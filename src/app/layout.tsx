import './globals.css';
import React from 'react';
import Image from 'next/image';

export const metadata = {
  title: 'SASsy - AI vs Human Humor Survey',
  description: 'Anonymous ratings for human vs AI jokes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen h-screen antialiased">
        <a
          href="/"
          className="fixed z-50 top-2 left-2 flex h-12 w-12 sm:h-18 sm:w-18 items-center justify-center rounded-lg shadow-md backdrop-blur-sm"
          aria-label="Go to home"
        >
          <Image src="/logo.png" alt="SASsy logo" width={42} height={42} className="h-10 w-10 sm:h-14 sm:w-14 object-contain" />
        </a>
        <div className="max-w-3xl mx-auto px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
