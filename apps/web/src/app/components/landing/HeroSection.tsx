"use client";

import { motion } from "framer-motion";
import { ArrowRightIcon } from "./Icons";

// Text reveal animation variants
const textRevealContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.3,
        },
    },
};

const characterReveal = {
    hidden: {
        opacity: 0,
        x: -20,
    },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            damping: 12,
            stiffness: 100,
        },
    },
};

// Component to animate text character by character
const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
    return (
        <motion.span
            variants={textRevealContainer}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {text.split("").map((char, index) => (
                <motion.span
                    key={index}
                    variants={characterReveal}
                    className="inline-block"
                    style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                >
                    {char}
                </motion.span>
            ))}
        </motion.span>
    );
};

const HeroSection: React.FC = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Gradient orbs */}
                <motion.div
                    className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-light/30 rounded-full blur-3xl"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, -40, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                {/* Main Headline - Playfair Display Bold 700 Italic with reveal animation */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight mb-8 text-white font-[family-name:var(--font-playfair)]">
                    <span className="block">
                        <AnimatedText text="Every trade backed by" />
                    </span>
                    <span className="block mt-2">
                        <AnimatedText text="unbreakable infrastructure." />
                    </span>
                </h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto mb-10 leading-relaxed"
                >
                    Built on Redis Pub/Sub for instant data propagation, WebSockets for
                    real-time updates, and distributed workers for parallel processing.
                    Your trades execute with sub-millisecond precision.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.8 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <motion.a
                        href="/signin"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-semibold rounded-xl overflow-hidden transition-all duration-300 button-glow"
                    >
                        <span className="relative z-10">Start Trading</span>
                        <ArrowRightIcon className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
                        <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.a>

                    <motion.a
                        href="#features"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/5 transition-all duration-300"
                    >
                        View Architecture
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
