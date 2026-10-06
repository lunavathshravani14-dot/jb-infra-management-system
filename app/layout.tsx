import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JB Infra — Executive & Admin Management System',
  description: 'Enterprise Executive Onboarding, Permanent Unique ID, Cadre & Hierarchy Management System',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
