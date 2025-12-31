"use client";

import { motion } from "framer-motion";

// Simplified icon components - clean and minimal
const RedisIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
    </svg>
);

const WebSocketIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12h16" />
        <path d="M4 12l4-4" />
        <path d="M4 12l4 4" />
        <path d="M20 12l-4-4" />
        <path d="M20 12l-4 4" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
);

const WorkerIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
);

const AIIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <circle cx="8" cy="16" r="1" fill="currentColor" />
        <circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
);

const architectureFeatures = [
    {
        icon: <RedisIcon />,
        title: "Redis Pub/Sub",
        description: "Real-time event broadcasting across all services. Price updates, order executions, and market data propagate instantly through our Redis messaging layer.",
    },
    {
        icon: <WebSocketIcon />,
        title: "WebSocket Connections",
        description: "Persistent bidirectional communication channels deliver live market data and trade notifications without polling. Zero latency updates to your dashboard.",
    },
    {
        icon: <WorkerIcon />,
        title: "Distributed Workers",
        description: "Background job processing for order matching, portfolio calculations, and data aggregation. Horizontally scalable to handle any trading volume.",
    },
    {
        icon: <AIIcon />,
        title: "LangChain AI Assistant",
        description: "Natural language trading assistant powered by LangChain. Get market analysis, trading suggestions, and portfolio insights through conversational AI.",
    },
];

const ArchitectureSection: React.FC = () => {
    return (
        <section id="features" className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/30 via-primary to-primary" />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium text-white/70 bg-white/5 rounded-full border border-white/10">
                        Infrastructure
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                        Built for Scale
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-white/60">
                        Enterprise-grade architecture designed for high-frequency trading environments.
                    </p>
                </motion.div>

                {/* Architecture grid - 2x2 layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {architectureFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`p-8 rounded-2xl border transition-all duration-300 hover:border-white/20 ${index === 3
                                    ? 'bg-accent/10 border-accent/30'
                                    : 'bg-white/[0.03] border-white/[0.08]'
                                }`}
                        >
                            {/* AI badge for LangChain */}
                            {index === 3 && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 mb-4 text-xs font-medium text-white bg-accent rounded-full">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    AI-Powered
                                </div>
                            )}

                            <div className="w-12 h-12 mb-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                                {feature.icon}
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-white/60 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ArchitectureSection;
