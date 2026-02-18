"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Calendar, Tag, FileText } from 'lucide-react';
import axios from 'axios';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    token: string;
}

export const TransactionModal = ({ isOpen, onClose, onSuccess, token }: TransactionModalProps) => {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            fetchCategories();
        }
    }, [isOpen, token]);

    const fetchCategories = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await axios.get(`${apiUrl}/categories`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(res.data.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            await axios.post(`${apiUrl}/transactions`, {
                type,
                amount: parseFloat(amount),
                categoryId: categoryId || null,
                description,
                date: new Date(date).toISOString(),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            onClose();
            // Reset form
            setAmount('');
            setCategoryId('');
            setDescription('');
        } catch (err) {
            console.error('Failed to create transaction', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card w-full max-w-lg p-8 relative overflow-hidden"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-bold mb-6">Record <span className="gradient-text">Transaction</span></h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex p-1 bg-white/5 rounded-2xl">
                                    <button
                                        type="button"
                                        onClick={() => setType('expense')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'expense' ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/20' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Minus size={18} /> Expense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('income')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${type === 'income' ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/20' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Plus size={18} /> Income
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl text-muted-foreground">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-2xl font-bold focus:outline-none focus:border-primary transition-colors"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <Tag size={16} /> Category
                                        </label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                        >
                                            <option value="" className="bg-background">Select Category</option>
                                            {categories.filter(c => c.type === type).map(c => (
                                                <option key={c.id} value={c.id} className="bg-background">{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <Calendar size={16} /> Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                        <FileText size={16} /> Description
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                        placeholder="Whta was this for?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isLoading}
                                    className="w-full bg-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Record Transaction'
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
