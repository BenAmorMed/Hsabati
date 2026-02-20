"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Missing reset token. Please check your link.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.post(`${apiUrl}/auth/reset-password`, {
                token,
                newPassword: password
            });
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError('Failed to reset password. The link may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="glass-card p-10 relative z-10 border-white/10">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                        <KeyRound className="text-blue-400" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Set New Password</h2>
                    <p className="text-muted-foreground mt-2">Choose a strong password for your account.</p>
                </div>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-green-400/10 text-green-400 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={40} />
                        </div>
                        <p className="text-lg font-medium">Password Reset Successful!</p>
                        <p className="text-muted-foreground text-sm">Your password has been updated. Redirecting you to login...</p>
                    </div>
                )}

                {!isSuccess && (
                    <Link
                        href="/login"
                        className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} /> Cancel
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Suspense fallback={<div className="glass-card p-10 text-center">Loading...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </motion.div>
        </div>
    );
}
