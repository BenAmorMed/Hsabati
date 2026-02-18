"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    ArrowLeftRight,
    ShieldCheck,
    BarChart3,
    Settings,
    Bell,
    LogOut,
    Wallet
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export const Sidebar = () => {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ArrowLeftRight, label: 'Transactions', path: '/transactions' },
        { icon: ShieldCheck, label: 'Lend/Borrow', path: '/advanced-payments' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="w-64 h-screen glass-morphism border-r border-white/5 p-6 flex flex-col fixed left-0 top-0">
            <div className="flex items-center gap-3 mb-12 px-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Wallet className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Hsabati<span className="text-primary text-2xl leading-none">.</span></h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <motion.div
                            key={item.path}
                            whileHover={{ x: 5 }}
                            onClick={() => router.push(item.path)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${isActive ? 'bg-primary/20 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </motion.div>
                    );
                })}
            </nav>

            <div className="pt-6 border-t border-white/5">
                <motion.div
                    whileHover={{ x: 5 }}
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl cursor-pointer transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </motion.div>
            </div>
        </div>
    );
};
