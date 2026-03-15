import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Flight Assistant',
  description: 'Search flights and plan group travel with AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
