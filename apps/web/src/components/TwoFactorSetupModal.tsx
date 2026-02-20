"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Copy, Check, Smartphone } from 'lucide-react';
import axios from 'axios';

interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
    onSuccess: () => void;
}

export const TwoFactorSetupModal = ({ isOpen, onClose, token, onSuccess }: TwoFactorSetupModalProps) => {
    const [step, setStep] = useState(1);
    const [qrData, setQrData] = useState<{ qrCodeUrl: string; secret: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const startSetup = async () => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await axios.post(`${apiUrl}/auth/2fa/setup`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQrData(res.data.data);
            setStep(2);
        } catch (err) {
            setError('Failed to initialize 2FA setup');
        } finally {
            setIsLoading(false);
        }
    };

    const verifySetup = async () => {
        setIsLoading(true);
        setError('');
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.post(`${apiUrl}/auth/2fa/verify`, {
                code: verificationCode
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            setStep(3);
        } catch (err) {
            setError('Invalid verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copySecret = () => {
        if (qrData?.secret) {
            navigator.clipboard.writeText(qrData.secret);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
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
                        className="relative w-full max-w-md glass-card p-8 shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
                            <X size={20} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-400/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-2xl font-bold">Two-Factor Auth</h3>
                            <p className="text-muted-foreground text-sm mt-2">Add an extra layer of security to your account.</p>
                        </div>

                        {step === 1 && (
                            <div className="space-y-6 text-center">
                                <p className="text-sm">Two-factor authentication (2FA) adds a second step to your login process to verify your identity.</p>
                                <button
                                    onClick={startSetup}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-primary rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    {isLoading ? 'Initializing...' : 'Start Setup'}
                                </button>
                            </div>
                        )}

                        {step === 2 && qrData && (
                            <div className="space-y-6">
                                <div className="bg-white p-4 rounded-2xl mx-auto w-fit">
                                    <img src={qrData.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Or enter manual code</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-mono truncate items-center flex">
                                            {qrData.secret}
                                        </div>
                                        <button onClick={copySecret} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                                            {isCopied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Verification Code</label>
                                    <input
                                        type="text"
                                        placeholder="6-digit code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary text-center tracking-[0.5em] font-bold"
                                    />
                                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                                </div>

                                <button
                                    onClick={verifySetup}
                                    disabled={isLoading || verificationCode.length < 6}
                                    className="w-full py-4 bg-primary rounded-xl font-bold disabled:opacity-50 transition-all"
                                >
                                    {isLoading ? 'Verifying...' : 'Verify & Enable'}
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-6 py-4">
                                <div className="w-20 h-20 bg-green-400/10 text-green-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                    <Check size={40} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">Excellent!</h4>
                                    <p className="text-muted-foreground text-sm mt-2">Two-factor authentication is now enabled for your account.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
