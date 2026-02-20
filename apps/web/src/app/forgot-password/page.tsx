"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.post(`${apiUrl}/auth/forgot-password`, { email });
            setIsSent(true);
        } catch (err) {
            setError('Failed to send reset link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-10 relative z-10 border-white/10">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <Mail className="text-primary" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Forgot Password?</h2>
                        <p className="text-muted-foreground mt-2">No worries, we'll send you reset instructions.</p>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Send size={20} /> {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-20 h-20 bg-green-400/10 text-green-400 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 size={40} />
                            </div>
                            <p className="text-lg font-medium">Reset link sent to your email!</p>
                            <p className="text-muted-foreground text-sm">Please check your inbox and follow the instructions to reset your password.</p>
                        </div>
                    )}

                    <Link
                        href="/login"
                        className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
