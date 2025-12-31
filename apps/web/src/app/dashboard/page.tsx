"use client";

import { useState } from 'react';
import TradingChart from "../components/trading-chart";
import OrderPanel from "../components/order-panel";
import { PositionsPanel } from "../components/positions-panel";
import TradingPrices from "../components/trading-prices";
import { TradingAssistantModal } from "../components/TradingAssistant";
import { ProtectedRoute, useAuth } from "../context/AuthContext";

function DashboardContent() {
    const { logout } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [unrealizedPNL, setUnrealizedPNL] = useState(0);
    const [balanceRefreshTrigger, setBalanceRefreshTrigger] = useState(0);

    const handleOrderPlaced = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleBalanceChange = (pnl: number) => {
        setUnrealizedPNL(pnl);
    };

    const handlePositionClosed = () => {
        setBalanceRefreshTrigger(prev => prev + 1);
        setRefreshTrigger(prev => prev + 1)
    }

    return (
        <>
            <main className="flex h-screen w-screen overflow-hidden bg-[#0A0E1A]">
                {/* Left Panel - Instruments */}
                <aside className="w-[280px] h-screen flex-shrink-0 border-r border-gray-800 overflow-y-auto">
                    <TradingPrices />
                </aside>

                {/* Center Panel - Trading Chart + Positions */}
                <section className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
                    {/* Header with Logout */}
                    <div className="flex items-center justify-between px-4 py-2 bg-[#0A0E1A] border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3v18h18" />
                                    <path d="M18 17V9" />
                                    <path d="M13 17V5" />
                                    <path d="M8 17v-3" />
                                </svg>
                            </div>
                            <span className="text-white font-semibold">TradePro Dashboard</span>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Trading Chart - Fixed Height */}
                    <div className="h-[55vh] min-h-0 overflow-hidden border-b border-gray-800">
                        <TradingChart />
                    </div>

                    {/* Positions Panel - Remaining Space */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <PositionsPanel
                            refreshTrigger={refreshTrigger}
                            onBalanceChange={handleBalanceChange}
                            onPositionClosed={handlePositionClosed}
                        />
                    </div>
                </section>

                {/* Right Panel - Order Entry */}
                <aside className="w-[320px] h-screen flex-shrink-0 border-l border-gray-800 overflow-y-auto">
                    <OrderPanel
                        onOrderPlaced={handleOrderPlaced}
                        unrealizedPNL={unrealizedPNL}
                        balanceRefreshTrigger={balanceRefreshTrigger}
                    />
                </aside>
            </main>

            {/* AI Assistant Modal */}
            <TradingAssistantModal />
        </>
    );
}

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
