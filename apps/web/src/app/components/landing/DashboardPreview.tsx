"use client";

import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";
import { DashboardIcon, TradingViewIcon, PortfolioIcon, InsightsIcon } from "./Icons";

const features = [
    {
        icon: <DashboardIcon className="w-7 h-7" />,
        title: "Real-time Dashboard",
        description: "Live order book, positions, and P&L updates streamed via WebSockets. No refresh needed.",
    },
    {
        icon: <TradingViewIcon className="w-7 h-7" />,
        title: "TradingView Charts",
        description: "Professional charting with 100+ indicators. Price data synced through Redis Pub/Sub.",
    },
    {
        icon: <PortfolioIcon className="w-7 h-7" />,
        title: "Portfolio Analytics",
        description: "Background workers calculate performance metrics and risk analysis in parallel.",
    },
    {
        icon: <InsightsIcon className="w-7 h-7" />,
        title: "AI Insights",
        description: "LangChain-powered assistant analyzes market conditions and suggests trade opportunities.",
    },
];

const DashboardPreview: React.FC = () => {
    return (
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-white/70 bg-white/5 rounded-full border border-white/10">
                        Dashboard Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Trade with Confidence
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-white/60">
                        Every feature powered by our real-time infrastructure.
                    </p>
                </motion.div>

                {/* Feature cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.title}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            index={index}
                        />
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <a
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-xl transition-all duration-300"
                    >
                        <span>Open Dashboard</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default DashboardPreview;
