"use client";
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { TrendingUp, TrendingDown, PieChart as PieIcon, BarChart3, Calendar, Download } from 'lucide-react';

export default function AnalyticsPage() {
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [yearlyData, setYearlyData] = useState<any[]>([]);
    const [distributions, setDistributions] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [token, isLoading, router]);

    useEffect(() => {
        if (token) {
            fetchAnalytics();
        }
    }, [token, selectedYear]);

    const fetchAnalytics = async () => {
        setIsFetching(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const [overviewRes, yearlyRes, distributionRes] = await Promise.all([
                axios.get(`${apiUrl}/analytics/overview`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${apiUrl}/analytics/yearly-summary?year=${selectedYear}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${apiUrl}/analytics/category-distribution?type=expense`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setData(overviewRes.data.data || {});
            setYearlyData(yearlyRes.data.data.months || []);
            setDistributions(distributionRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch analytics', err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await axios.get(`${apiUrl}/export/transactions/csv`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'hsabati-transactions.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to export CSV', err);
            alert('Failed to export CSV');
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading || !token) return null;

    const COLORS = ['#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6'];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const barData = yearlyData.map(m => ({
        name: monthNames[m.month - 1],
        income: m.income,
        expenses: m.expense
    }));

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                        <p className="text-muted-foreground mt-1">Deep dive into your spending and income patterns.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-semibold hover:bg-primary/20 transition-all disabled:opacity-50"
                        >
                            <Download size={18} /> {isExporting ? 'Exporting...' : 'Export CSV'}
                        </motion.button>
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                            <Calendar size={18} className="text-muted-foreground ml-2" />
                            <span className="text-sm font-medium pr-4">Last 30 Days</span>
                        </div>
                    </div>
                </header>

                {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-muted-foreground">Generating financial insights...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-l-4 border-primary">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Savings Rate</p>
                                <h4 className="text-2xl font-bold">42.5%</h4>
                                <div className="flex items-center gap-1 text-green-400 text-xs mt-2">
                                    <TrendingUp size={14} />
                                    <span>+2.1% from last month</span>
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 border-l-4 border-red-400">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Highest Expense</p>
                                <h4 className="text-2xl font-bold">Rent ($1,200)</h4>
                                <p className="text-xs text-muted-foreground mt-2">Fixed Monthly</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-l-4 border-green-400">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Income</p>
                                <h4 className="text-2xl font-bold">${data?.totalIncome?.toLocaleString()}</h4>
                                <p className="text-xs text-muted-foreground mt-2">Verified Deposits</p>
                            </motion.div>
                        </div>

                        {/* Charts Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="glass-card p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <BarChart3 className="text-primary" size={24} />
                                    <h3 className="text-xl font-bold">Income vs Expenses</h3>
                                </div>
                                <div className="h-80 w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                            <Legend verticalAlign="top" height={36} />
                                            <Bar dataKey="income" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="glass-card p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <PieIcon className="text-primary" size={24} />
                                    <h3 className="text-xl font-bold">Expense Breakdown</h3>
                                </div>
                                <div className="h-80 w-full min-w-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={distributions.length > 0 ? distributions.map(d => ({ name: d.category, value: d.total })) : [{ name: 'No data', value: 1 }]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {distributions.length > 0 ? distributions.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                )) : <Cell fill="rgba(255,255,255,0.05)" />}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Category Rankings */}
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-bold mb-6 text-center">Top Spending Categories</h3>
                            <div className="space-y-6 max-w-2xl mx-auto">
                                {distributions.length > 0 ? distributions.map((cat, idx) => {
                                    const totalDist = distributions.reduce((sum, d) => sum + d.total, 0);
                                    return (
                                        <div key={cat.category} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-semibold">{cat.category}</span>
                                                <span className="text-muted-foreground">${cat.total.toLocaleString()} ({Math.round((cat.total / totalDist) * 100)}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(cat.total / distributions[0].total) * 100}%` }}
                                                    transition={{ duration: 1, delay: idx * 0.1 }}
                                                    className="h-full bg-primary"
                                                />
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-center text-muted-foreground py-10">No spending data for the selected period.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
