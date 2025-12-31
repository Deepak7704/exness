"use client";

import { motion } from "framer-motion";
import React from "react";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className="group relative"
        >
            <div className="relative p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]">
                {/* Icon container - simplified, no rotation animation */}
                <div className="w-14 h-14 mb-6 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-white/80 group-hover:text-white group-hover:bg-accent/20 transition-all duration-300">
                    {icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">
                    {title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                    {description}
                </p>
            </div>
        </motion.div>
    );
};

export default FeatureCard;
