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
            className="glass-card p-4 md:p-6 flex items-center gap-3 md:gap-4 relative overflow-hidden group"
        >
            <div className={`p-2.5 md:p-3 rounded-2xl bg-${color}/10 text-${color} shrink-0`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="text-muted-foreground text-xs md:text-sm font-medium truncate">{title}</h3>
                <p className="text-xl md:text-2xl font-bold mt-0.5 md:mt-1 truncate">{value}</p>
                {trend !== undefined && (
                    <p className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'} truncate`}>
                        {trend >= 0 ? '+' : ''}{trend}% from last month
                    </p>
                )}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-primary/5 rounded-full -mr-10 -mt-10 md:-mr-12 md:-mt-12 group-hover:scale-150 transition-transform duration-500" />
        </motion.div>
    );
};
