"use client";
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { WalletChart } from '@/components/WalletChart';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TransactionModal } from '@/components/TransactionModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import axios from 'axios';

export default function Dashboard() {
  const { user, token, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !user.hasSeenOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5555';
      const [overviewRes, trendsRes] = await Promise.all([
        axios.get(`${apiUrl}/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${apiUrl}/analytics/trends`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setData(overviewRes.data.data);
      setTrends(trendsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  if (isLoading || !token || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
        <header className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, <span className="gradient-text">{user?.name || 'User'}</span> 👋</h2>
            <p className="text-muted-foreground mt-1 text-base md:text-lg">Here's what's happening with your money today.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-6 py-3 bg-primary rounded-2xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-center"
          >
            + New Transaction
          </motion.button>
        </header>

        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchDashboardData}
          token={token!}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => {
            setIsOnboardingOpen(false);
            updateUser({ hasSeenOnboarding: true });
          }}
          token={token!}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
          <StatCard title="Global Balance" value={`$${data.balance.toLocaleString()} `} icon={Wallet} trend={0} />
          <StatCard title="Monthly Income" value={`$${data.totalIncome.toLocaleString()} `} icon={TrendingUp} trend={0} color="green-400" />
          <StatCard title="Monthly Expenses" value={`$${data.totalExpenses.toLocaleString()} `} icon={TrendingDown} trend={0} color="red-400" />
          <StatCard title="Total Savings" value={`$${(data.totalIncome - data.totalExpenses).toLocaleString()} `} icon={Clock} trend={0} color="blue-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 glass-card p-6 md:p-8 min-h-[300px] md:min-h-[400px] overflow-hidden">
            <h3 className="text-lg md:text-xl font-bold mb-6">Financial Trends</h3>
            <div className="h-full w-full">
              <WalletChart data={trends} />
            </div>
          </div>
          <div className="glass-card p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold mb-6">Recent Activities</h3>
            <div className="space-y-4 md:space-y-6">
              {data.recentTransactions?.length > 0 ? data.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Wallet size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="max-w-[120px] sm:max-w-none truncate">
                      <p className="font-semibold text-sm md:text-base truncate">{tx.description || 'No description'}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font - bold text - sm md: text - base ${tx.type === 'expense' ? 'text-red-400' : 'text-green-400'} `}>
                    {tx.type === 'expense' ? '-' : '+'}${tx.amount.toLocaleString()}
                  </p>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-10">No recent transactions.</p>
              )}
            </div>
            <button className="w-full mt-6 md:mt-8 py-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              View All Transactions
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
