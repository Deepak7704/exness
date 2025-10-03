export default function InstrumentPanel() {
  const supportedAssets = [
    { name: "BTCUSDT" },
    { name: "ETHUSDT" },
    { name: "SOLUSDT" },
  ];

  return (
    <div className="w-72 flex-shrink-0 border-r border-gray-800 bg-[#0A0E1A] p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-400">
        INSTRUMENTS
      </h2>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-gray-500">
            <th className="py-2 font-normal">Asset</th>
            <th colSpan={2} className="py-2 text-center font-normal">
              Trade
            </th>
          </tr>
        </thead>
        <tbody>
          {supportedAssets.map((asset) => (
            <tr key={asset.name} className="border-t border-gray-800">
              <td className="py-3 font-semibold">{asset.name}</td>
              <td className="py-3 pr-1">
                <button 
                  className="w-full rounded-md bg-green-600/20 px-3 py-2 text-xs font-bold text-green-400 transition-colors hover:bg-green-600/30"
                  aria-label={`Buy ${asset.name}`}
                >
                  BUY
                </button>
              </td>
              <td className="py-3 pl-1">
                <button 
                  className="w-full rounded-md bg-red-600/20 px-3 py-2 text-xs font-bold text-red-400 transition-colors hover:bg-red-600/30"
                  aria-label={`Sell ${asset.name}`}
                >
                  SELL
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}