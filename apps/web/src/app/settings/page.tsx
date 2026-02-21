"use client";
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Smartphone, Globe, Cloud, LogOut, ChevronRight, Save, Palette } from 'lucide-react';
import { TwoFactorSetupModal } from '@/components/TwoFactorSetupModal';
import axios from 'axios';

export default function SettingsPage() {
    const { user, logout, token, isLoading, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currency, setCurrency] = useState(user?.currency || 'USD');
    const [isSaving, setIsSaving] = useState(false);
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [token, isLoading, router]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await axios.patch(`${apiUrl}/user/settings`, {
                name,
                currency,
                theme
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateUser(res.data.data);
            alert('Settings saved successfully!');
        } catch (err) {
            console.error('Failed to save settings', err);
            alert('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBackup = async () => {
        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await axios.get(`${apiUrl}/backup/export`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Create a blob and trigger download
            const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hsabati_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert('Backup generated and downloaded successfully!');
        } catch (err) {
            console.error('Failed to generate backup', err);
            alert('Failed to generate backup. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !token) return null;

    const SettingItem = ({ icon: Icon, label, value, color = 'primary' }: any) => (
        <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm text-muted-foreground">{value}</p>
                </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground group-hover:text-foreground transition-all" />
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
                <header className="mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground mt-1">Manage your account preferences and application settings.</p>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-6xl">
                    {/* Profile Section */}
                    <div className="xl:col-span-2 space-y-8">
                        <section className="glass-card p-8">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                                <User className="text-primary" /> Profile Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 opacity-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="mt-8 px-8 py-3 bg-primary rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                <Save size={20} /> {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </section>

                        <section className="glass-card p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Shield className="text-blue-400" /> Security & Privacy
                            </h3>
                            <div className="divide-y divide-white/5">
                                <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group" onClick={() => !user?.isTwoFactorEnabled && setIs2FAModalOpen(true)}>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-blue-400/10 text-blue-400">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Two-Factor Authentication</p>
                                            <p className={`text-sm ${user?.isTwoFactorEnabled ? 'text-green-400' : 'text-muted-foreground'}`}>
                                                {user?.isTwoFactorEnabled ? 'Enabled' : 'Disabled - Click to set up'}
                                            </p>
                                        </div>
                                    </div>
                                    {!user?.isTwoFactorEnabled && <ChevronRight size={20} className="text-muted-foreground group-hover:text-foreground transition-all" />}
                                </div>
                                <SettingItem icon={Mail} label="Recovery Email" value={user?.email || 'Not set'} color="blue-400" />
                                <SettingItem icon={Smartphone} label="Registered Devices" value="1 active session" color="blue-400" />
                            </div>
                        </section>

                        <TwoFactorSetupModal
                            isOpen={is2FAModalOpen}
                            onClose={() => setIs2FAModalOpen(false)}
                            token={token!}
                            onSuccess={() => {
                                updateUser({ isTwoFactorEnabled: true });
                            }}
                        />
                    </div>

                    {/* Preferences & Misc */}
                    <div className="space-y-8">
                        <section className="glass-card p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Globe className="text-emerald-400" /> Preferences
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">Color Theme</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'dark', color: '#8b5cf6', label: 'Classic' },
                                            { id: 'ocean', color: '#0ea5e9', label: 'Ocean' },
                                            { id: 'sunset', color: '#f97316', label: 'Sunset' },
                                            { id: 'midnight', color: '#6366f1', label: 'Midnight' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTheme(t.id as any)}
                                                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${theme === t.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                            >
                                                <div className="w-8 h-8 rounded-full shadow-lg" style={{ backgroundColor: t.color }} />
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-4 mt-4 border-t border-white/5">
                                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Display Currency</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
                                    >
                                        <option value="USD" className="bg-background">USD ($) - Dollar</option>
                                        <option value="EUR" className="bg-background">EUR (€) - Euro</option>
                                        <option value="GBP" className="bg-background">GBP (£) - Pound</option>
                                        <option value="TND" className="bg-background">TND (DT) - Dinar Tunisian</option>
                                    </select>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Auto-sync Data</span>
                                        <div className="w-12 h-6 bg-primary rounded-full relative">
                                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="glass-card p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <Cloud className="text-purple-400" /> Cloud Backup
                            </h3>
                            <p className="text-sm text-muted-foreground mb-6">Last backup was performed recently. Export your data for offline safety.</p>
                            <button
                                onClick={handleBackup}
                                disabled={isSaving}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all disabled:opacity-50"
                            >
                                {isSaving ? 'Processing...' : 'Backup Now'}
                            </button>
                        </section>

                        <button
                            onClick={() => { logout(); router.push('/login'); }}
                            className="w-full py-4 text-red-400 bg-red-400/5 hover:bg-red-400/10 border border-red-400/10 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                        >
                            <LogOut size={20} /> Sign Out
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
