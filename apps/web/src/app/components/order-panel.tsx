export default function OrderPanel() {
  return (
    <div className="w-72 border-l border-gray-800 bg-[#101421] p-4 flex flex-col">
      <h3 className="text-lg font-semibold mb-4">BTC/USD</h3>
      <div className="flex border border-gray-700 rounded-md mb-4">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded-l-md text-sm font-semibold">
          Market
        </button>
        <button className="flex-1 py-2 text-gray-400 rounded-r-md text-sm font-semibold hover:bg-gray-800">
          Limit
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">VOLUME</label>
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md">
            <button className="px-3 py-2 text-gray-400 hover:bg-gray-700">-</button>
            <input
              type="text"
              defaultValue="0.01"
              className="w-full bg-transparent text-center font-mono focus:outline-none"
            />
            <button className="px-3 py-2 text-gray-400 hover:bg-gray-700">+</button>
            <span className="text-xs text-gray-500 pr-3">Lots</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">LEVERAGE</label>
          <div className="grid grid-cols-4 gap-1">
            {["1x", "2x", "5x", "10x"].map((l, i) => (
              <button
                key={l}
                className={`py-2 text-sm rounded-md ${
                  l === "10x" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {["TAKE PROFIT", "STOP LOSS"].map((label) => (
          <div key={label}>
            <label className="text-xs text-gray-400 mb-1 block">{label}</label>
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md">
              <span className="px-3 text-gray-500 text-sm">Not set</span>
              <div className="flex-1" />
              <button className="px-3 py-2 text-gray-400 hover:bg-gray-700">{label === 'TAKE PROFIT' ? '+' : '-'}</button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <button className="w-full bg-green-600/20 text-green-400 border border-green-600 py-3 rounded-md hover:bg-green-600/30">
          Buy
        </button>
        <button className="w-full bg-red-600/20 text-red-400 border border-red-600 py-3 rounded-md hover:bg-red-600/30">
          Sell
        </button>
      </div>

      <div className="mt-auto border-t border-gray-800 pt-4 text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Balance</span>
          <span className="font-mono">11,839.99 USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Free Margin</span>
          <span className="font-mono">11,650.30 USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Margin Level</span>
          <span className="font-mono text-green-500">--</span>
        </div>
      </div>
    </div>
  );
}