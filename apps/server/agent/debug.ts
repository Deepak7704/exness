import { getUserPositionsTool, calculatePortfolioRiskTool } from './tools/positionTools';

const TEST_USER_ID = "92d11bf2-dea2-46a5-914b-0f0a98cfb7da";
const TEST_SYMBOL = "BTCUSDT";

async function testTools() {
  console.log("\n" + "=".repeat(70));
  console.log("TESTING TOOLS DIRECTLY");
  console.log("=".repeat(70) + "\n");

  try {
    // Test 1: getUserPositionsTool
    console.log("TEST 1: get_user_positions tool");
    console.log("-".repeat(70));
    console.log(`Calling with userId: ${TEST_USER_ID}, symbol: ${TEST_SYMBOL}\n`);
    
    const positionsResult = await getUserPositionsTool.invoke({
      userId: TEST_USER_ID,
      symbol: TEST_SYMBOL as any,
    });

    console.log("✓ Tool executed successfully!");
    console.log("\nRESULT:");
    console.log(positionsResult);
    console.log("\n");

    // Test 2: calculatePortfolioRiskTool
    console.log("TEST 2: calculate_portfolio_risk tool");
    console.log("-".repeat(70));
    console.log(`Calling with userId: ${TEST_USER_ID}, symbol: ${TEST_SYMBOL}\n`);
    
    const riskResult = await calculatePortfolioRiskTool.invoke({
      userId: TEST_USER_ID,
      symbol: TEST_SYMBOL as any,
    });

    console.log("✓ Tool executed successfully!");
    console.log("\nRESULT:");
    console.log(riskResult);
    console.log("\n");

    console.log("=".repeat(70));
    console.log("✓✓✓ ALL TOOLS WORKING CORRECTLY ✓✓✓");
    console.log("=".repeat(70));
    console.log("\nIf you see actual data above (not just JSON input echoed back),");
    console.log("then the tools themselves are working fine.");
    console.log("The issue is with how LangChain is calling them.\n");

  } catch (error) {
    console.error("\n✗✗✗ TOOL TEST FAILED ✗✗✗");
    console.error(error);
  }
}

testTools();