import { getUserPositionsTool, calculatePortfolioRiskTool } from './positionTools';

export function getAllTools() {
  return [
    getUserPositionsTool,
    calculatePortfolioRiskTool,
  ];
}

export { getUserPositionsTool, calculatePortfolioRiskTool };
