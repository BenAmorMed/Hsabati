"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, StickyNote } from 'lucide-react';
import axios from 'axios';

interface RepaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    paymentId: string;
    contactName: string;
    remaining: number;
    token: string;
}

export const RepaymentModal = ({ isOpen, onClose, onSuccess, paymentId, contactName, remaining, token }: RepaymentModalProps) => {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.post(`${apiUrl}/advanced-payments/${paymentId}/repayment`, {
                amount: parseFloat(amount),
                note,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            onClose();
            setAmount('');
            setNote('');
        } catch (err) {
            console.error('Failed to log repayment', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm glass-card p-6 md:p-8 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold">Log Repayment</h3>
                                <p className="text-sm text-muted-foreground">From/To {contactName}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">
                                    Amount <span className="text-xs opacity-50 block mt-0.5">Max: ${remaining.toLocaleString()}</span>
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        max={remaining}
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Note (Optional)</label>
                                <div className="relative">
                                    <StickyNote className="absolute left-4 top-4 text-muted-foreground" size={18} />
                                    <textarea
                                        placeholder="What is this for?"
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Processing...' : 'Log Repayment'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
