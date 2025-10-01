import './globals.css';
import React from 'react';

export const metadata = {
  title: 'SCIE300 Humor Survey',
  description: 'Anonymous ratings for human vs AI jokes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen h-screen antialiased">
        <div className="max-w-3xl mx-auto px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
