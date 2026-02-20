"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, DollarSign, Calendar, Type } from 'lucide-react';
import axios from 'axios';

interface AdvancedPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token: string;
}

export const AdvancedPaymentModal = ({ isOpen, onClose, onSuccess, token }: AdvancedPaymentModalProps) => {
    const [type, setType] = useState<'lend' | 'borrow'>('lend');
    const [amount, setAmount] = useState('');
    const [contactName, setContactName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.post(`${apiUrl}/advanced-payments`, {
                type,
                amount: parseFloat(amount),
                contactName,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            onClose();
            // Reset form
            setAmount('');
            setContactName('');
            setDueDate('');
        } catch (err) {
            console.error('Failed to create advanced payment', err);
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
                        className="relative w-full max-w-md glass-card p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold">New Record</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Switcher */}
                            <div className="flex p-1 bg-white/5 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setType('lend')}
                                    className={`flex-1 py-3 px-4 rounded-xl transition-all font-semibold ${type === 'lend' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Money Lent
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('borrow')}
                                    className={`flex-1 py-3 px-4 rounded-xl transition-all font-semibold ${type === 'borrow' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Money Borrowed
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Contact Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Who are you dealing with?"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Amount</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors font-mono"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Due Date (Optional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="date"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary transition-colors text-foreground"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Record'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
