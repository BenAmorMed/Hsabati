"use client";
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat, Plus, Trash2, Calendar, Tag, Clock, Power, CheckCircle2, AlertCircle } from 'lucide-react';
import { RecurringTransactionModal } from '@/components/RecurringTransactionModal';

export default function RecurringTransactionsPage() {
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [recurring, setRecurring] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [token, isLoading, router]);

    useEffect(() => {
        if (token) {
            fetchRecurring();
        }
    }, [token]);

    const fetchRecurring = async () => {
        setIsFetching(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await axios.get(`${apiUrl}/recurring-transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecurring(res.data || []);
        } catch (err) {
            console.error('Failed to fetch recurring transactions', err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.patch(`${apiUrl}/recurring-transactions/${id}/toggle`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRecurring();
        } catch (err) {
            console.error('Failed to toggle recurring transaction', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this recurring transaction?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.delete(`${apiUrl}/recurring-transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRecurring();
        } catch (err) {
            console.error('Failed to delete recurring transaction', err);
        }
    };

    if (isLoading || !token) return null;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Recurring Transactions</h2>
                        <p className="text-muted-foreground mt-1">Automate your regular income and expenses.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto px-6 py-3 bg-primary rounded-2xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> New Schedule
                    </motion.button>
                </header>

                <RecurringTransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchRecurring}
                    token={token!}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {isFetching ? (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Loading your schedules...</p>
                            </div>
                        ) : recurring.length > 0 ? (
                            recurring.map((rt) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={rt.id}
                                    className={`glass-card p-6 flex flex-col relative group ${!rt.isActive ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-3 rounded-2xl bg-white/5 ${rt.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                            <Repeat size={24} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggle(rt.id)}
                                                className={`p-2 rounded-xl transition-all ${rt.isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-white/5'}`}
                                                title={rt.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                <Power size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rt.id)}
                                                className="p-2 text-muted-foreground hover:text-red-400 bg-white/5 rounded-xl transition-all"
                                                title="Remove"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold mb-1 truncate">{rt.description || 'Unnamed Schedule'}</h3>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase tracking-wider font-semibold">
                                            <Tag size={14} />
                                            <span>{rt.category?.name || 'Uncategorized'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-muted-foreground text-sm">Amount</span>
                                            <span className={`text-2xl font-black ${rt.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                                {rt.type === 'expense' ? '-' : '+'}${rt.amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 py-3 px-4 bg-white/5 rounded-xl">
                                            <div className="flex flex-col flex-1">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Frequency</span>
                                                <span className="font-semibold capitalize text-sm">{rt.frequency}</span>
                                            </div>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div className="flex flex-col flex-1">
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Next Run</span>
                                                <span className="font-semibold text-sm">{new Date(rt.nextRunDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                                        <Clock size={12} />
                                        <span>Started {new Date(rt.startDate).toLocaleDateString()}</span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center glass-card border-dashed">
                                <Repeat className="mx-auto mb-4 opacity-10" size={64} />
                                <h3 className="text-xl font-bold mb-2">No recurring patterns</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">Set up automated transactions for your rent, subscriptions, or salary to keep your balance accurate.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
