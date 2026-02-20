"use client";
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Trash2, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { TransactionModal } from '@/components/TransactionModal';

export default function TransactionsPage() {
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [token, isLoading, router]);

    useEffect(() => {
        if (token) {
            fetchTransactions();
        }
    }, [token]);

    const fetchTransactions = async () => {
        setIsFetching(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await axios.get(`${apiUrl}/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.delete(`${apiUrl}/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTransactions();
        } catch (err) {
            console.error('Failed to delete transaction', err);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' || tx.type === filterType;
        return matchesSearch && matchesFilter;
    });

    if (isLoading || !token) return null;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
                        <p className="text-muted-foreground mt-1">Manage and track all your financial activities.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="w-full md:w-auto px-6 py-3 bg-primary rounded-2xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> New Transaction
                    </motion.button>
                </header>

                <TransactionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchTransactions}
                    token={token!}
                />

                {/* Filters & Search */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                        >
                            <option value="all" className="bg-background">All Types</option>
                            <option value="income" className="bg-background">Income</option>
                            <option value="expense" className="bg-background">Expenses</option>
                        </select>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 font-semibold text-sm">Description</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Category</th>
                                    <th className="px-6 py-4 font-semibold text-sm">Date</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-right">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode='popLayout'>
                                    {isFetching ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                                Loading transactions...
                                            </td>
                                        </tr>
                                    ) : filteredTransactions.length > 0 ? (
                                        filteredTransactions.map((tx) => (
                                            <motion.tr
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                key={tx.id}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${tx.type === 'expense' ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'}`}>
                                                            {tx.type === 'expense' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                        </div>
                                                        <span className="font-medium">{tx.description || 'No description'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-muted-foreground">
                                                        {tx.category?.name || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {new Date(tx.date).toLocaleDateString()}
                                                </td>
                                                <td className={`px-6 py-4 text-right font-bold ${tx.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                                                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(tx.id)}
                                                        className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                                <Wallet className="mx-auto mb-4 opacity-20" size={48} />
                                                No transactions found.
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
