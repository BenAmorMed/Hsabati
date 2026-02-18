import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: number;
    color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="glass-card p-6 flex items-center gap-4 relative overflow-hidden group"
        >
            <div className={`p-3 rounded-2xl bg-${color}/10 text-${color}`}>
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold mt-1">{value}</p>
                {trend !== undefined && (
                    <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend >= 0 ? '+' : ''}{trend}% from last month
                    </p>
                )}
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
        </motion.div>
    );
};
