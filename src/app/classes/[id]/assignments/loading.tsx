import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-6 animate-pulse">
      <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        ))}
      </div>
      <div className="h-80 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
    </div>
  );
}
