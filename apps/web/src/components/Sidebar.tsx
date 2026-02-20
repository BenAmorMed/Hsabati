"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ArrowLeftRight,
    ShieldCheck,
    BarChart3,
    Settings,
    Bell,
    LogOut,
    Wallet,
    Menu,
    X,
    Repeat
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export const Sidebar = () => {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ArrowLeftRight, label: 'Transactions', path: '/transactions' },
        { icon: Repeat, label: 'Recurring', path: '/recurring-transactions' },
        { icon: ShieldCheck, label: 'Lend/Borrow', path: '/advanced-payments' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    const SidebarContent = ({ isMobile = false }) => (
        <div className={`h-full flex flex-col ${isMobile ? 'p-6' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-12 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                        <Wallet className="text-white" size={24} />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Hsabati<span className="text-primary text-2xl leading-none">.</span></h1>
                </div>
                {isMobile && (
                    <button onClick={toggleSidebar} className="p-2 text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <motion.div
                            key={item.path}
                            whileHover={{ x: 5 }}
                            onClick={() => {
                                router.push(item.path);
                                if (isMobile) setIsOpen(false);
                            }}
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

    return (
        <>
            {/* Mobile Header Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-morphism border-b border-white/5 flex items-center justify-between px-6 z-40">
                <div className="flex items-center gap-2">
                    <Wallet className="text-primary" size={24} />
                    <span className="font-bold text-lg">Hsabati</span>
                </div>
                <button onClick={toggleSidebar} className="p-2 text-muted-foreground hover:text-foreground">
                    <Menu size={24} />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 h-screen glass-morphism border-r border-white/5 flex-col fixed left-0 top-0 z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Overlay & Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleSidebar}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-80 glass-morphism border-r border-white/10 z-50 overflow-y-auto"
                        >
                            <SidebarContent isMobile />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
