export function PositionsPanel() {
  return (
    <div className="h-64 border-t border-gray-800 flex flex-col">
      <div className="flex items-center border-b border-gray-800">
        <button className="px-4 py-3 text-sm font-semibold border-b-2 border-blue-500 text-white">
          Open Positions
        </button>
        <button className="px-4 py-3 text-sm font-semibold text-gray-400 hover:bg-gray-800/50">
          Closed Positions
        </button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-gray-400">
            <tr className="border-b border-gray-800">
              {['TYPE', 'VOLUME', 'OPEN PRICE', 'CURRENT PRICE', 'TAKE PROFIT', 'STOP LOSS', 'PROFIT', 'TIME'].map(header => (
                <th key={header} className="p-3 font-normal">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800 hover:bg-gray-800/30">
              <td className="p-3"><span className="text-green-500">BUY</span></td>
              <td className="p-3 font-mono">0.01</td>
              <td className="p-3 font-mono">118,658.30</td>
              <td className="p-3 font-mono">118,854.56</td>
              <td className="p-3 font-mono">120,000.00</td>
              <td className="p-3 font-mono">117,000.00</td>
              <td className="p-3 font-mono text-green-500">+204.26 USD <span className="text-gray-400">(+0.17%)</span></td>
              <td className="p-3 font-mono text-gray-400">14:32:15</td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
}