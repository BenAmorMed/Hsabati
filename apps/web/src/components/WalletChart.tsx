"use client";
import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface TrendData {
    name: string;
    income: number;
    expenses: number;
    date: string;
}

interface WalletChartProps {
    data: TrendData[];
}

export const WalletChart = ({ data }: WalletChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-80 flex items-center justify-center text-muted-foreground border border-white/5 rounded-2xl bg-white/5">
                No trend data available.
            </div>
        );
    }
    return (
        <div className="w-full h-80 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(23, 23, 23, 0.8)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(8px)',
                            color: '#fff'
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                    />
                    <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#f43f5e"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
