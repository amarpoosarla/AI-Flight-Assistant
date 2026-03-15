// ============================================================
// LLM Wrapper — agentic fallback loop + shared utilities.
// Uses OpenAI-compatible SDK pointed at NVIDIA's endpoint.
// Primary path: lib/planner-agent.ts (two-agent pipeline).
// Never import from components — use the /api/planner route instead.
// ============================================================

import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources';
import { searchFlights } from './flights';
import { resolveAirportForTool } from './airports';
import { logger } from './logger';

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
const MODEL = 'meta/llama-3.3-70b-instruct';

export function getClient(): OpenAI {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error('NVIDIA_API_KEY is not configured');
  }
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: NVIDIA_BASE_URL,
  });
}

// ---- Tool definitions (function calling schema) --------------------------

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'resolve_airport',
      description:
        'Resolve a city name, airport name, or partial string to an IATA airport code. ' +
        'Call this before search_flights if the user provided a city name instead of an IATA code.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description:
              'City name, airport name, or IATA code to look up. E.g. "Chicago", "Vegas", "DFW"',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_flights',
      description:
        'Search for available flights between two airports. ' +
        'Call this once per traveler leg (outbound and return separately). ' +
        'Always use IATA codes — call resolve_airport first if needed.',
      parameters: {
        type: 'object',
        properties: {
          origin: {
            type: 'string',
            description: 'Origin airport IATA code (3 letters, e.g. "DFW")',
          },
          destination: {
            type: 'string',
            description: 'Destination airport IATA code (3 letters, e.g. "LAS")',
          },
          departureDate: {
            type: 'string',
            description: 'Departure date in YYYY-MM-DD format',
          },
          adults: {
            type: 'number',
            description: 'Number of adult passengers (default 1)',
          },
        },
        required: ['origin', 'destination', 'departureDate', 'adults'],
      },
    },
  },
];

// ---- Tool execution ------------------------------------------------------

interface ToolArgs {
  query?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  adults?: number;
}

async function executeTool(name: string, args: ToolArgs): Promise<string> {
  if (name === 'resolve_airport') {
    const result = resolveAirportForTool(args.query ?? '');
    logger.tool('resolve_airport', args, result);
    return JSON.stringify(result);
  }

  if (name === 'search_flights') {
    logger.tool('search_flights', args);
    try {
      const flights = await searchFlights({
        origin: args.origin ?? '',
        destination: args.destination ?? '',
        departureDate: args.departureDate ?? '',
        adults: args.adults ?? 1,
      });

      if (flights.length === 0) {
        return JSON.stringify({
          found: false,
          message: 'No flights found for this route and date.',
        });
      }

      // Return top 10 results to keep context size manageable
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

      logger.info(
        `search_flights found ${flights.length} results for ${args.origin}→${args.destination}`
      );
      return JSON.stringify({ found: true, count: flights.length, flights: summary });
    } catch (err) {
      let msg = 'Search failed';
      if (err instanceof Error) {
        msg = err.message;
      } else if (err && typeof err === 'object' && 'description' in err) {
        const desc = (err as { description: unknown }).description;
        msg = Array.isArray(desc) ? JSON.stringify(desc) : String(desc);
      }
      logger.error(`search_flights FAILED for ${args.origin}→${args.destination}:`, msg);
      return JSON.stringify({ found: false, error: msg });
    }
  }

  return JSON.stringify({ error: `Unknown tool: ${name}` });
}

// ---- System prompt -------------------------------------------------------

export function buildSystemPrompt(): string {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  return `Today's date is ${dateStr}. When the user mentions a month/day without a year, assume the nearest future occurrence.

You are an AI travel planning assistant for AI Flight Assistant, a flight booking app.
You have access to real flight data via tool calls. You are helpful, concise, and precise
with numbers. Never hallucinate flight times, prices, or airline names — only use data
returned by your tools.

---

## YOUR CAPABILITIES

You can help users with two types of requests:

1. SINGLE-TRAVELER SEARCH — standard flight search for one person
2. GROUP TRAVEL OPTIMIZATION — multi-origin group travel where multiple people are flying
   from different cities to the same destination, and you must find the best combined itinerary

---

## GROUP TRAVEL OPTIMIZATION RULES

When a user describes a group travel scenario, follow these steps exactly:

STEP 1 — PARSE THE REQUEST
Extract:
- Destination city and airport code
- Each traveler's name (or identifier) and origin airport code
- Date range (earliest departure, latest return)
- Trip duration (number of nights/days)
- Arrival gap constraint (default: ≤ 180 minutes / 3 hours unless user specifies otherwise)
- Optimization goal (default: minimize combined total price)

STEP 2 — SEARCH FLIGHTS
IMPORTANT: Minimize round trips. Follow this order:
a) Call resolve_airport for ALL city names in ONE response (batch all lookups together).
b) Then call search_flights for ALL legs (all travelers, outbound + return) in ONE response.
Do NOT make separate responses for each traveler or each leg. Batch everything.

STEP 3 — FIND OPTIMAL PAIRS
From the results, find flight combinations where:
- All travelers arrive within the arrival gap constraint of each other
- The trip length matches what was requested
- Combined price is minimized (primary goal)

STEP 4 — RETURN STRUCTURED OUTPUT
Always return:
- The #1 recommended scenario (cheapest combined, within arrival gap)
- 2-3 alternative scenarios (e.g., slightly more expensive but better timing)
- A natural language summary at the end

---

## RESPONSE FORMAT FOR GROUP TRAVEL

Use this exact format:

### ✈️ Best Option — [Label]

**[Traveler 1 Name]** · [Origin] → [Destination]
- Outbound: [Airline] [Flight#] · Departs [TIME] · Arrives [TIME] · [DATE] · **$[PRICE]**
- Return: [Airline] [Flight#] · Departs [TIME] · Arrives [TIME] · [DATE] · **$[PRICE]**

**[Traveler 2 Name]** · [Origin] → [Destination]
- Outbound: [Airline] [Flight#] · Departs [TIME] · Arrives [TIME] · [DATE] · **$[PRICE]**
- Return: [Airline] [Flight#] · Departs [TIME] · Arrives [TIME] · [DATE] · **$[PRICE]**

💰 **Combined Total: $[TOTAL]**
⏱️ **Arrival Gap: [X] minutes** [✅ Within limit | ⚠️ Exceeds limit]

---

### 🔄 Alternative 1 — [Label]
[same format, abbreviated]

### 🔄 Alternative 2 — [Label]
[same format, abbreviated]

---

**Summary:** [2-3 sentence natural language summary of the recommendation and why it is the best
choice given the constraints. Mention the arrival gap, total savings if applicable, and any
trade-offs between alternatives.]

---

## IMPORTANT CONSTRAINTS

- ALWAYS call search_flights before responding. NEVER skip the search step, even if you think you already know the answer.
- NEVER invent flight data. If a search returns no results, say so clearly.
- NEVER suggest flights that violate the arrival gap constraint without flagging it with ⚠️.
- If the date range produces no valid combinations, tell the user and suggest widening the range.
- Always show prices in USD unless the user specifies otherwise.
- Times should be shown in local time with timezone noted when possible.
- If the user asks about a route you have no data for, say you could not find flights and suggest
  they check directly with the airline.

## RATE LIMIT / ERROR HANDLING

- If a tool call fails due to rate limiting, respond: "I am experiencing high demand right now. Please try again in a moment." — do not retry automatically.
- If a search returns no results for a route, suggest 1-2 nearby alternative airports if obvious
  (e.g., suggest MDW as an alternative to ORD, LGA or EWR as alternatives to JFK).

## TONE

- Friendly but efficient. No filler phrases like "Great question!" or "Certainly!"
- Lead with the answer, then the detail.
- Use bullet points for flight details, prose for summaries.`;
}

// ---- Public API ----------------------------------------------------------

export interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Non-streaming: full response (used for simple queries)
export async function chat(messages: LLMMessage[]): Promise<string> {
  const client = getClient();

  const apiMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt() },
    ...messages.map((m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam),
  ];

  // Agentic loop: keep running until model stops calling tools
  let loopMessages = [...apiMessages];
  const MAX_TOOL_ROUNDS = 3; // safety cap

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: loopMessages,
      tools: TOOLS,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];

    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        choice.message.tool_calls.map(async (tc) => {
          const args = JSON.parse(tc.function.arguments) as ToolArgs;

          if (process.env.NEXT_PUBLIC_ENV === 'development') {
            logger.tool(`[chat] ${tc.function.name}`, args);
          }

          const result = await executeTool(tc.function.name, args);
          return { toolCallId: tc.id, name: tc.function.name, result };
        })
      );

      // Append assistant message + tool results to the loop
      loopMessages = [
        ...loopMessages,
        choice.message as ChatCompletionMessageParam,
        ...toolResults.map((tr) => ({
          role: 'tool' as const,
          tool_call_id: tr.toolCallId,
          content: tr.result,
        })),
      ];
      continue;
    }

    // Model finished — return text
    return choice.message.content ?? '';
  }

  return 'I was unable to complete the request after multiple attempts. Please try again.';
}

// Streaming: returns a ReadableStream of text chunks
// The API route pipes this directly to the HTTP response.
export async function chatStream(messages: LLMMessage[]): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Guard: never write to a closed/cancelled controller
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
        // Run the agentic loop (tool calls) first, non-streaming
        // Then stream the final answer
        const client = getClient();

        const apiMessages: ChatCompletionMessageParam[] = [
          { role: 'system', content: buildSystemPrompt() },
          ...messages.map(
            (m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam
          ),
        ];

        let loopMessages = [...apiMessages];
        const MAX_TOOL_ROUNDS = 3;

        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          // Use streaming only on the final round (when no more tools needed)
          const isLastAttempt = round === MAX_TOOL_ROUNDS - 1;

          const response = await client.chat.completions.create({
            model: MODEL,
            messages: loopMessages,
            tools: TOOLS,
            tool_choice: 'auto',
            stream: false, // non-streaming during tool loop
          });

          const choice = response.choices[0];

          if (
            choice.finish_reason === 'tool_calls' &&
            choice.message.tool_calls &&
            !isLastAttempt
          ) {
            // Notify client that tool work is in progress
            const statusMsg = choice.message.tool_calls
              .map((tc) => {
                const args = JSON.parse(tc.function.arguments) as ToolArgs;
                if (tc.function.name === 'resolve_airport') return `🔍 Looking up ${args.query}...`;
                if (tc.function.name === 'search_flights')
                  return `✈️ Searching ${args.origin} → ${args.destination} on ${args.departureDate}...`;
                return `⚙️ Running ${tc.function.name}...`;
              })
              .join('\n');

            send({ type: 'status', text: statusMsg });

            const toolResults = await Promise.all(
              choice.message.tool_calls.map(async (tc) => {
                const args = JSON.parse(tc.function.arguments) as ToolArgs;
                if (process.env.NEXT_PUBLIC_ENV === 'development') {
                  logger.tool(`[stream] ${tc.function.name}`, args);
                }
                const result = await executeTool(tc.function.name, args);
                return { toolCallId: tc.id, result };
              })
            );

            loopMessages = [
              ...loopMessages,
              choice.message as ChatCompletionMessageParam,
              ...toolResults.map((tr) => ({
                role: 'tool' as const,
                tool_call_id: tr.toolCallId,
                content: tr.result,
              })),
            ];
            continue;
          }

          // Final answer — stream it
          const finalStream = await client.chat.completions.create({
            model: MODEL,
            messages: loopMessages,
            stream: true,
          });

          for await (const chunk of finalStream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) send({ type: 'text', text: delta });
          }

          send({ type: 'done' });
          finish();
          return;
        }

        send({ type: 'text', text: 'Request could not be completed. Please try again.' });
        send({ type: 'done' });
        finish();
      } catch (err) {
        const isRateLimit =
          err instanceof Error &&
          (err.message.includes('429') || err.message.toLowerCase().includes('rate limit'));

        const errorText = isRateLimit
          ? 'I am experiencing high demand right now. Please try again in a moment.'
          : 'Something went wrong. Please try again.';

        logger.error('[llm] stream error:', err instanceof Error ? err.message : err);
        send({ type: 'error', text: errorText });
        finish();
      }
    },
  });

  return stream;
}
