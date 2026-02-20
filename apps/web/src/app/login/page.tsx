"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Wallet } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [show2FA, setShow2FA] = useState(false);
    const { login } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const res = await login({ email, password, twoFactorCode });
            if (res.requireTwoFactor) {
                setShow2FA(true);
            } else if (res.success) {
                router.push('/');
            }
        } catch (err) {
            setError('Invalid credentials or 2FA code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-6 md:p-8"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Wallet className="text-white" size={28} />
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Welcome <span className="gradient-text">Back</span></h1>
                <p className="text-muted-foreground text-center mb-8 text-sm md:text-base">Sign in to manage your wealth.</p>

                {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                    {!show2FA ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 md:mb-2">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                                    placeholder="alex@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1.5 md:mb-2">
                                    <label className="text-sm font-medium">Password</label>
                                    <Link href="/forgot-password" className="text-primary hover:underline text-xs">Forgot password?</Link>
                                </div>
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-primary transition-colors text-sm md:text-base"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium mb-1.5 md:mb-2 text-center text-blue-400">Two-Factor Code</label>
                            <input
                                type="text"
                                maxLength={6}
                                className="w-full bg-white/5 border border-primary/50 rounded-xl px-4 py-2.5 md:py-3 focus:outline-none focus:border-primary transition-colors text-center text-xl tracking-[0.5em] font-bold"
                                placeholder="000000"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-3 text-center">Please enter the code from your authenticator app.</p>
                        </div>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        className="w-full bg-primary py-3 md:py-3.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm md:text-base disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : (show2FA ? 'Confirm 2FA' : 'Sign In')}
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    Don't have an account? <Link href="/register" className="text-primary hover:underline font-semibold">Sign Up</Link>
                </p>
            </motion.div>
        </div>
    );
}
