'use client';

import type { Metadata } from 'next';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import './globals.css';

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

// Note: Metadata removed due to client component
// export const metadata: Metadata = {
//   title: 'Mission Control | AI Agent Dashboard',
//   description: 'Real-time activity monitoring and task management for AI agents',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
