"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, Wallet, TrendingUp, ShieldCheck, Sparkles } from 'lucide-react';
import axios from 'axios';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: string;
}

export const OnboardingModal = ({ isOpen, onClose, token }: OnboardingModalProps) => {
    const [step, setStep] = useState(1);
    const totalSteps = 4;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.patch(`${apiUrl}/user/settings`, {
                hasSeenOnboarding: true
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onClose();
        } catch (err) {
            console.error('Failed to complete onboarding', err);
            onClose(); // Close anyway to not block user
        }
    };

    const steps = [
        {
            title: "Welcome to Hsabati",
            description: "Your premium financial companion. Let's get you set up in less than a minute.",
            icon: <Sparkles className="text-primary" size={48} />,
            color: "primary"
        },
        {
            title: "Track Everything",
            description: "Log your income and expenses with ease. Use categories to see where your money goes.",
            icon: <Wallet className="text-emerald-400" size={48} />,
            color: "emerald-400"
        },
        {
            title: "Smart Lending",
            description: "Keep track of who owes you and who you owe. Never miss a repayment again.",
            icon: <ShieldCheck className="text-blue-400" size={48} />,
            color: "blue-400"
        },
        {
            title: "Insights & Growth",
            description: "Beautiful analytics help you understand your habits and grow your savings.",
            icon: <TrendingUp className="text-purple-400" size={48} />,
            color: "purple-400"
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="relative w-full max-w-lg glass-card p-8 md:p-12 shadow-2xl overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full" />

                        <div className="relative z-10">
                            <div className="flex justify-center mb-8">
                                <motion.div
                                    key={step}
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="p-6 rounded-3xl bg-white/5 border border-white/10"
                                >
                                    {currentStep.icon}
                                </motion.div>
                            </div>

                            <div className="text-center mb-10">
                                <motion.h3
                                    key={`title-${step}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl font-bold mb-4"
                                >
                                    {currentStep.title}
                                </motion.h3>
                                <motion.p
                                    key={`desc-${step}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-muted-foreground text-lg leading-relaxed"
                                >
                                    {currentStep.description}
                                </motion.p>
                            </div>

                            {/* Progress Dots */}
                            <div className="flex justify-center gap-2 mb-10">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleNext}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 text-lg"
                                >
                                    {step === totalSteps ? "Get Started" : "Continue"}
                                    <ArrowRight size={20} />
                                </motion.button>

                                {step === 1 && (
                                    <button
                                        onClick={completeOnboarding}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Skip introduction
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
