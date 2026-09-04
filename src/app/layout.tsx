import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from '@/components/providers/ClientProviders';

export const metadata: Metadata = {
  title: 'TicketIT - In-Store Retail Ticketing & Administration',
  description:
    'The ticketing solution that ticks all the boxes. Manage ESLs, in-store pricing, users, client data, and session usage with enterprise accuracy.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#E7EAEF] text-ticketit-navy">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
