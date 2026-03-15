import { render, screen } from '@testing-library/react';
import FlightCard from '@/components/flights/FlightCard';
import type { FlightOffer } from '@/types/flight';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock Zustand store
jest.mock('@/store/flightStore', () => ({
  useFlightStore: () => jest.fn(),
}));

const mockFlight: FlightOffer = {
  id: 'test-001',
  segments: [
    {
      departureAirport: 'JFK',
      arrivalAirport: 'LAX',
      departureTime: '2025-06-15T08:00:00',
      arrivalTime: '2025-06-15T11:30:00',
      duration: 'PT5H30M',
      flightNumber: 'DL 401',
      airline: 'Delta Air Lines',
      airlineCode: 'DL',
    },
  ],
  totalDuration: 'PT5H30M',
  stops: 0,
  price: 319,
  currency: 'USD',
  cabinClass: 'ECONOMY',
  source: 'mock',
};

describe('FlightCard', () => {
  it('renders airline name', () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText('Delta Air Lines')).toBeInTheDocument();
  });

  it('renders origin and destination airports', () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText('JFK')).toBeInTheDocument();
    expect(screen.getByText('LAX')).toBeInTheDocument();
  });

  it('renders formatted price', () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText('$319')).toBeInTheDocument();
  });

  it('renders nonstop label for 0 stops', () => {
    render(<FlightCard flight={mockFlight} />);
    expect(screen.getByText('Nonstop')).toBeInTheDocument();
  });

  it('renders stop count for flights with stops', () => {
    const flightWithStop = { ...mockFlight, stops: 1 };
    render(<FlightCard flight={flightWithStop} />);
    expect(screen.getByText('1 stop')).toBeInTheDocument();
  });

  it('shows low seat warning when seats <= 5', () => {
    const lowSeatFlight = { ...mockFlight, seatsAvailable: 3 };
    render(<FlightCard flight={lowSeatFlight} />);
    expect(screen.getByText('3 seats left')).toBeInTheDocument();
  });

  it('does not show seat warning when seats > 5', () => {
    const normalFlight = { ...mockFlight, seatsAvailable: 10 };
    render(<FlightCard flight={normalFlight} />);
    expect(screen.queryByText(/seats left/)).not.toBeInTheDocument();
  });
});
