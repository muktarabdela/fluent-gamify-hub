import React from 'react';

export default function UnitProgress({ unit, isFixed = false }) {
    return (
        <section className="py-4 bg-white/95 backdrop-blur-md shadow-md px-6 max-w-md mx-auto rounded-xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xs font-semibold tracking-wider text-gray-500">
                        UNIT {unit?.order_number} · {unit?.total_lessons || 0} LESSONS
                    </h2>
                    <h3 className="mt-1.5 text-lg font-bold text-gray-900">{unit?.title}</h3>
                </div>
                <div className="flex items-center bg-green-100 px-2.5 py-1 rounded-full">
                    <span className="text-sm font-medium text-green-700">
                        {Math.round(unit?.progress_percentage || 0)}%
                    </span>
                </div>
            </div>
            <div className="relative mt-3 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-300"
                    style={{ width: `${unit?.progress_percentage || 0}%` }}
                ></div>
            </div>
        </section>
    );
} 