"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, XCircle, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. Missing token.');
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
                await axios.get(`${apiUrl}/auth/verify-email/${token}`);
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now access all features.');

                // Auto-redirect to login after 5 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 5000);
            } catch (err) {
                setStatus('error');
                setMessage('This verification link is invalid or has expired.');
            }
        };

        verifyToken();
    }, [token, router]);

    return (
        <div className="w-full max-w-md">
            <div className="glass-card p-10 relative z-10 border-white/10 text-center">
                <div className="flex justify-center mb-8">
                    {status === 'loading' && (
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-spin">
                            <Loader2 className="text-primary" size={40} />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="w-20 h-20 bg-green-400/10 text-green-400 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle size={40} />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-20 h-20 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center">
                            <XCircle size={40} />
                        </div>
                    )}
                </div>

                <h2 className="text-3xl font-bold tracking-tight mb-4">
                    {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Verified!' : 'Verification Failed'}
                </h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    {message}
                </p>

                {status === 'success' ? (
                    <Link
                        href="/login"
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
                    >
                        Go to Login <ArrowRight size={20} />
                    </Link>
                ) : status === 'error' ? (
                    <Link
                        href="/register"
                        className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all"
                    >
                        Return to Sign Up
                    </Link>
                ) : null}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
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
                    <VerifyEmailContent />
                </Suspense>
            </motion.div>
        </div>
    );
}
