// ============================================================
// Two-Agent Pipeline for the AI Travel Planner
//
// Agent 1 (Planner)  — parses user intent into a structured JSON plan (1 LLM call)
// Execution phase    — resolves airports + searches all legs in parallel (0 LLM calls)
// Agent 2 (Synth)   — streams the formatted answer with pre-fetched data (1 LLM call)
//
// Fallback: if planning fails or canPlan=false, runs the agentic loop from lib/llm.ts
// ============================================================

import type { ChatCompletionMessageParam } from 'openai/resources';
import { searchFlights } from './flights';
import { resolveAirportForTool } from './airports';
import { getClient, buildSystemPrompt, chatStream as agenticChatStream } from './llm';
import { logger } from './logger';
import type { LLMMessage } from './llm';
import type { FlightOffer } from '@/types/flight';

const MODEL = 'meta/llama-3.3-70b-instruct';

// ---- Types -------------------------------------------------------------------

interface PlannerOutput {
  canPlan: boolean;
  travelers: { name: string; originCity: string }[];
  destinationCity: string;
  departureDate: string; // YYYY-MM-DD
  returnDate: string | null;
  nights: number | null;
  adults: number;
}

interface FlightLeg {
  travelerName: string;
  legType: 'outbound' | 'return';
  origin: string;
  destination: string;
  date: string;
  adults: number;
}

interface LegResult {
  leg: FlightLeg;
  flights: FlightOffer[];
  error: string | null;
}

// ---- Agent 1: Planner -------------------------------------------------------

const PLANNER_SYSTEM = `You are a flight request parser. Extract flight booking intent and return ONLY valid JSON — no markdown, no explanation.

Schema:
{
  "canPlan": boolean,
  "travelers": [{ "name": string, "originCity": string }],
  "destinationCity": string,
  "departureDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD or null",
  "nights": number or null,
  "adults": number
}

Rules:
- canPlan: false if this is NOT a flight search request (e.g. general questions)
- travelers: one entry per person flying FROM a different origin
- Use names the user provides. If unnamed, use "You" for the first traveler and "Guest 2", "Guest 3" etc. for others
- originCity / destinationCity: use the city name exactly as the user stated
- departureDate: compute from today if user says "next Friday", "March 20", etc.
- returnDate: null for one-way trips; compute from departureDate + nights if needed
- nights: integer if derivable, else null
- adults: total passengers (default 1)`;

async function runPlannerAgent(messages: LLMMessage[]): Promise<PlannerOutput | null> {
  const client = getClient();
  const today = new Date().toISOString().split('T')[0];

  // Only send the last 5 messages to keep the planner call fast
  const recentMessages = messages.slice(-5);

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: `${PLANNER_SYSTEM}\n\nToday is ${today}.` },
        ...recentMessages.map(
          (m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam
        ),
      ],
      response_format: { type: 'json_object' },
      max_tokens: 400,
      stream: false,
    });

    const raw = response.choices[0].message.content ?? '{}';
    logger.info('[planner-agent] plan:', raw);
    const plan = JSON.parse(raw) as PlannerOutput;

    // Validate required fields
    if (
      typeof plan.canPlan !== 'boolean' ||
      !Array.isArray(plan.travelers) ||
      !plan.destinationCity ||
      !plan.departureDate
    ) {
      logger.warn('[planner-agent] invalid plan shape, falling back');
      return null;
    }

    return plan;
  } catch (err) {
    logger.warn('[planner-agent] parse failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

// ---- Execution phase ---------------------------------------------------------

function buildLegs(plan: PlannerOutput, destIATA: string): FlightLeg[] {
  const legs: FlightLeg[] = [];

  for (const traveler of plan.travelers) {
    const originResult = resolveAirportForTool(traveler.originCity);
    if (!originResult.found || !originResult.iata) {
      logger.warn(`[planner-agent] could not resolve origin: ${traveler.originCity}`);
      continue;
    }

    legs.push({
      travelerName: traveler.name,
      legType: 'outbound',
      origin: originResult.iata,
      destination: destIATA,
      date: plan.departureDate,
      adults: plan.adults,
    });

    if (plan.returnDate) {
      legs.push({
        travelerName: traveler.name,
        legType: 'return',
        origin: destIATA,
        destination: originResult.iata,
        date: plan.returnDate,
        adults: plan.adults,
      });
    }
  }

  return legs;
}

async function executeLegs(legs: FlightLeg[]): Promise<LegResult[]> {
  const results = await Promise.allSettled(
    legs.map((leg) =>
      searchFlights({
        origin: leg.origin,
        destination: leg.destination,
        departureDate: leg.date,
        adults: leg.adults,
      })
    )
  );

  return results.map((result, i) => {
    const leg = legs[i];
    if (result.status === 'fulfilled') {
      logger.info(
        `[planner-agent] ${leg.travelerName} ${leg.legType} ${leg.origin}→${leg.destination}: ${result.value.length} flights`
      );
      return { leg, flights: result.value, error: null };
    } else {
      const msg = result.reason instanceof Error ? result.reason.message : 'Search failed';
      logger.error(`[planner-agent] ${leg.travelerName} ${leg.legType} FAILED:`, msg);
      return { leg, flights: [], error: msg };
    }
  });
}

// ---- Build context for Agent 2 -----------------------------------------------

function buildResultsContext(plan: PlannerOutput, legResults: LegResult[]): string {
  const lines: string[] = [
    '## FLIGHT SEARCH RESULTS (pre-fetched — do NOT call any tools)',
    '',
    `Trip: ${plan.travelers.map((t) => t.originCity).join(' + ')} → ${plan.destinationCity}`,
    `Outbound: ${plan.departureDate}${plan.returnDate ? ` · Return: ${plan.returnDate}` : ' (one-way)'}`,
    '',
  ];

  for (const { leg, flights, error } of legResults) {
    lines.push(
      `### ${leg.travelerName} — ${leg.legType === 'outbound' ? 'Outbound' : 'Return'} (${leg.origin} → ${leg.destination}, ${leg.date})`
    );

    if (error) {
      lines.push(JSON.stringify({ found: false, error }));
    } else if (flights.length === 0) {
      lines.push(
        JSON.stringify({ found: false, message: 'No flights found for this route and date.' })
      );
    } else {
      const summary = flights.slice(0, 10).map((f) => ({
        id: f.id,
        airline: f.segments[0].airline,
        flightNumber: f.segments[0].flightNumber,
        origin: f.segments[0].departureAirport,
        destination: f.segments[f.segments.length - 1].arrivalAirport,
        departureTime: f.segments[0].departureTime,
        arrivalTime: f.segments[f.segments.length - 1].arrivalTime,
        duration: f.totalDuration,
        stops: f.stops,
        price: f.price,
        currency: f.currency,
        seatsAvailable: f.seatsAvailable,
      }));
      lines.push(JSON.stringify({ found: true, count: flights.length, flights: summary }, null, 0));
    }
    lines.push('');
  }

  lines.push('Use ONLY the data above for your response.');
  return lines.join('\n');
}

// ---- Public API --------------------------------------------------------------

export type { LLMMessage };

export async function chatStream(messages: LLMMessage[]): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      function send(payload: object) {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          closed = true;
        }
      }
      function finish() {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }

      try {
        // ── Phase 1: Parse intent ──────────────────────────────────────────
        send({ type: 'status', text: '🧠 Analyzing your request...' });
        const plan = await runPlannerAgent(messages);

        if (!plan || !plan.canPlan) {
          logger.info(
            '[planner-agent] falling back to agentic loop (canPlan=false or parse failed)'
          );
          // Pipe the agentic fallback stream into this controller
          const fallback = await agenticChatStream(messages);
          const reader = fallback.getReader();
          while (!closed) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!closed) {
              try {
                controller.enqueue(value);
              } catch {
                closed = true;
              }
            }
          }
          finish();
          return;
        }

        // Guard: too many travelers — fall back
        if (plan.travelers.length > 4) {
          logger.warn('[planner-agent] >4 travelers, falling back');
          const fallback = await agenticChatStream(messages);
          const reader = fallback.getReader();
          while (!closed) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!closed) {
              try {
                controller.enqueue(value);
              } catch {
                closed = true;
              }
            }
          }
          finish();
          return;
        }

        // ── Phase 2: Resolve destination + search all legs ─────────────────
        const destResult = resolveAirportForTool(plan.destinationCity);
        if (!destResult.found || !destResult.iata) {
          send({
            type: 'status',
            text: `🔍 Destination "${plan.destinationCity}" not recognized, searching anyway...`,
          });
          // Fall back if we can't resolve destination
          const fallback = await agenticChatStream(messages);
          const reader = fallback.getReader();
          while (!closed) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!closed) {
              try {
                controller.enqueue(value);
              } catch {
                closed = true;
              }
            }
          }
          finish();
          return;
        }

        const legs = buildLegs(plan, destResult.iata);
        if (legs.length === 0) {
          send({
            type: 'error',
            text: 'Could not resolve any origin airports. Please try again with city names like "Dallas" or airport codes like "DFW".',
          });
          finish();
          return;
        }

        const uniqueRoutes = legs
          .map((l) => `${l.origin}→${l.destination}`)
          .filter((r, i, a) => a.indexOf(r) === i);
        const routesSummary = uniqueRoutes.join(', ');
        send({
          type: 'status',
          text: `✈️ Searching ${legs.length} flight route${legs.length > 1 ? 's' : ''} in parallel: ${routesSummary}...`,
        });

        const legResults = await executeLegs(legs);

        // ── Phase 3: Synthesize and stream ─────────────────────────────────
        send({ type: 'status', text: '📊 Preparing your recommendations...' });

        const client = getClient();
        const resultsContext = buildResultsContext(plan, legResults);

        const apiMessages: ChatCompletionMessageParam[] = [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'system', content: resultsContext },
          ...messages.map(
            (m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam
          ),
        ];

        const finalStream = await client.chat.completions.create({
          model: MODEL,
          messages: apiMessages,
          stream: true,
          // No tools — Agent 2 only synthesizes pre-fetched data
        });

        for await (const chunk of finalStream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) send({ type: 'text', text: delta });
        }

        send({ type: 'done' });
        finish();
      } catch (err) {
        logger.error('[planner-agent] pipeline error:', err instanceof Error ? err.message : err);
        send({ type: 'error', text: 'Something went wrong. Please try again.' });
        finish();
      }
    },
  });

  return stream;
}
