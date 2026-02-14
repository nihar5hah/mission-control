'use client';

import type { Metadata } from 'next';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useState, useEffect } from 'react';
import './globals.css';

const CONVEX_URL = 'https://adorable-fly-124.eu-west-1.convex.site';

function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const [convex, setConvex] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    const client = new ConvexReactClient(CONVEX_URL);
    setConvex(client);
  }, []);

  if (!convex) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-white">Loading Mission Control...</div>
      </div>
    );
  }

  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
