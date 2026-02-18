'use client';

import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
