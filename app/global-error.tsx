'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('ShutterScape Global Error Boundary caught:', error);
  }, [error]);
  return (
    <html lang="en" className="bg-[#070708] text-[#F4F1EA]">
      <body className="min-h-screen bg-[#070708] text-[#F4F1EA] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#121214] border border-[#B3261E]/40 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-[#B3261E]/20 text-[#B3261E] flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">System Level Exposure Failure</h1>
            <p className="text-sm text-[#F4F1EA]/70">
              A critical core system fault occurred while initializing the view.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => reset()}
              type="button"
              className="px-5 py-2.5 bg-[#F59E0B] text-black font-semibold rounded-xl text-sm transition-all hover:bg-[#F59E0B]/90"
            >
              Reset Shutter
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#1F1F24] text-white border border-white/10 font-medium rounded-xl text-sm transition-all hover:bg-white/10"
            >
              Reload Base
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
