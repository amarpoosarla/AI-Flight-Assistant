// ============================================================
// AI Travel Planner Types
// ============================================================

import type { FlightOffer } from './flight';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;   // ISO datetime
}

export interface TravelerRequest {
  name: string;
  origin: string;        // IATA code
  originCity?: string;   // Human-readable city name
}

export interface PlannerRequest {
  messages: ChatMessage[];
  sessionId?: string;
}

export interface FlightPair {
  traveler: string;      // Traveler name or identifier
  outbound: FlightOffer;
  inbound: FlightOffer;
  subtotal: number;
}

export interface TravelScenario {
  rank: number;
  label: string;              // e.g. "Cheapest Combined", "Fastest Arrivals"
  flightPairs: FlightPair[];
  combinedTotal: number;
  currency: string;
  arrivalGapMinutes: number;  // Max gap between first and last arrival
  summary: string;            // Natural language summary
}

export interface PlannerResponse {
  sessionId: string;
  message: string;             // Full assistant text response
  scenarios?: TravelScenario[];
  isStreaming?: boolean;
}

export interface PlannerSession {
  id: string;
  userId: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
