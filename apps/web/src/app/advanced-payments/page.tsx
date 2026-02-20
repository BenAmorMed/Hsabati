"use client";
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, Trash2, Calendar, User, DollarSign, History, CheckCircle2, Clock } from 'lucide-react';
import { AdvancedPaymentModal } from '@/components/AdvancedPaymentModal';
import { RepaymentModal } from '@/components/RepaymentModal';

export default function AdvancedPaymentsPage() {
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [payments, setPayments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'lend' | 'borrow'>('lend');
    const [isFetching, setIsFetching] = useState(true);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [token, isLoading, router]);

    useEffect(() => {
        if (token) {
            fetchPayments();
        }
    }, [token]);

    const fetchPayments = async () => {
        setIsFetching(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await axios.get(`${apiUrl}/advanced-payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch payments', err);
        } finally {
            setIsFetching(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.delete(`${apiUrl}/advanced-payments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPayments();
        } catch (err) {
            console.error('Failed to delete payment', err);
        }
    };

    const openRepayModal = (payment: any) => {
        setSelectedPayment(payment);
        setIsRepayModalOpen(true);
    };

    const filteredPayments = payments.filter(p => p.type === activeTab);

    if (isLoading || !token) return null;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Lend & Borrow</h2>
                        <p className="text-muted-foreground mt-1">Track money you've lent to others or borrowed from them.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreateModalOpen(true)}
                        className="w-full md:w-auto px-6 py-3 bg-primary rounded-2xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> New Record
                    </motion.button>
                </header>

                <AdvancedPaymentModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={fetchPayments}
                    token={token!}
                />

                {selectedPayment && (
                    <RepaymentModal
                        isOpen={isRepayModalOpen}
                        onClose={() => setIsRepayModalOpen(false)}
                        onSuccess={fetchPayments}
                        paymentId={selectedPayment.id}
                        contactName={selectedPayment.contactName}
                        remaining={selectedPayment.remaining}
                        token={token!}
                    />
                )}

                {/* Tabs */}
                {/* ... existing tabs code ... */}
                <div className="flex p-1 bg-white/5 rounded-2xl w-full max-w-sm mb-8">
                    <button
                        onClick={() => setActiveTab('lend')}
                        className={`flex-1 py-3 px-4 rounded-xl transition-all font-semibold ${activeTab === 'lend' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Money Lent
                    </button>
                    <button
                        onClick={() => setActiveTab('borrow')}
                        className={`flex-1 py-3 px-4 rounded-xl transition-all font-semibold ${activeTab === 'borrow' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Money Borrowed
                    </button>
                </div>

                {/* Payments List */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {isFetching ? (
                            <div className="col-span-full py-20 text-center">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Fetching records...</p>
                            </div>
                        ) : filteredPayments.length > 0 ? (
                            filteredPayments.map((p) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={p.id}
                                    className="glass-card p-6 flex flex-col relative group"
                                >
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all bg-white/5 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div className="flex justify-between items-start mb-6 pr-8">
                                        <div className="p-3 rounded-2xl bg-white/5 text-primary">
                                            <User size={24} />
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${p.status === 'paid' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'}`}>
                                            {p.status}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold mb-1">{p.contactName}</h3>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            <Calendar size={14} />
                                            <span>Due: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No due date'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-end">
                                            <span className="text-muted-foreground text-sm">Total Amount</span>
                                            <span className="text-lg font-bold">${p.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${Math.min(100, Math.max(0, ((p.amount - p.remaining) / p.amount) * 100))}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-muted-foreground text-sm">Remaining</span>
                                            <span className="text-xl font-bold text-primary">${p.remaining.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                                            <History size={16} /> Details
                                        </button>
                                        <button
                                            onClick={() => openRepayModal(p)}
                                            disabled={p.status === 'paid'}
                                            className="flex-1 py-3 px-4 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <DollarSign size={16} /> Repay
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center glass-card border-dashed">
                                <ShieldCheck className="mx-auto mb-4 opacity-10" size={64} />
                                <h3 className="text-xl font-bold mb-2">No {activeTab} records</h3>
                                <p className="text-muted-foreground">Keep track of your debts and loans in one place.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
