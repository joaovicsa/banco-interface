// components/DashboardSkeleton.tsx
'use client';

import { JSX } from "react";

const DashboardSkeleton = (): JSX.Element => {
    return (
        <div className="min-h-screen bg-[#f6f8fb] p-4 flex flex-col items-center animate-pulse">
            {/* Header skeleton */}
            <div className="w-full max-w-5xl flex justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-300" />
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-300 rounded" />
                        <div className="h-3 w-24 bg-gray-300 rounded" />
                    </div>
                </div>
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
            </div>

            {/* Balance Card skeleton */}
            <div className="w-full max-w-5xl mb-8 p-4 bg-white rounded-2xl shadow-md">
                <div className="h-6 w-40 bg-gray-300 rounded mb-4" />
                <div className="h-10 w-60 bg-gray-300 rounded mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="h-14 bg-gray-300 rounded-xl" />
                    <div className="h-14 bg-gray-300 rounded-xl" />
                </div>
            </div>

            {/* Transaction History skeleton */}
            <div className="pt-4 pb-4 h-80 bg-white rounded-2xl shadow-md w-full max-w-5xl p-4">
                <div className="w-full max-w-5xl space-y-3">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div key={idx} className="h-12 w-full bg-gray-300 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
