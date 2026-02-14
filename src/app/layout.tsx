import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mission Control | AI Agent Dashboard',
  description: 'Real-time activity monitoring and task management for AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
