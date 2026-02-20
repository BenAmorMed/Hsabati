"use client";
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2, Clock, Info, ShieldAlert, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
    const { token, isLoading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!isLoading && !token) {
            router.push('/login');
        }
    }, [token, isLoading, router]);

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    const fetchNotifications = async () => {
        setIsFetching(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            const res = await axios.get(`${apiUrl}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setIsFetching(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.patch(`${apiUrl}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllRead = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
            await axios.patch(`${apiUrl}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    if (isLoading || !token) return null;

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                        <p className="text-muted-foreground mt-1">Stay updated on your balance changes and payment due dates.</p>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllRead}
                            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
                        >
                            <CheckCircle2 size={16} /> Mark all read
                        </button>
                    )}
                </header>

                <div className="max-w-4xl mx-auto space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {isFetching ? (
                            <div className="py-20 text-center">
                                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-muted-foreground">Checking for new alerts...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((n) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={n.id}
                                    className={`glass-card p-6 flex items-start gap-4 transition-all ${!n.isRead ? 'border-l-4 border-primary bg-primary/5' : 'opacity-70'}`}
                                >
                                    <div className={`p-3 rounded-2xl ${n.type === 'reminder' ? 'bg-yellow-400/10 text-yellow-400' :
                                        n.type === 'alert' ? 'bg-red-400/10 text-red-400' :
                                            'bg-blue-400/10 text-blue-400'
                                        }`}>
                                        {n.type === 'reminder' ? <Clock size={24} /> :
                                            n.type === 'alert' ? <ShieldAlert size={24} /> :
                                                <Info size={24} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-lg truncate">{n.title}</h4>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{n.message}</p>
                                    </div>
                                    {!n.isRead && (
                                        <button
                                            onClick={() => markAsRead(n.id)}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-colors shrink-0"
                                            title="Mark as read"
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-20 text-center glass-card border-dashed">
                                <Bell className="mx-auto mb-4 opacity-10" size={64} />
                                <h3 className="text-xl font-bold mb-2">All caught up!</h3>
                                <p className="text-muted-foreground">You have no new notifications at the moment.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
