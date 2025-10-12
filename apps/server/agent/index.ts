import { createModel, agentConfig } from "./config";
import { TRADING_SYSTEM_PROMPT } from "./prompt";
import { getAllTools } from "./tools";
import type { AgentAction, AgentFinish, AgentStep } from "@langchain/core/agents";
import type { ChainValues } from "@langchain/core/utils/types";
import { BaseMessage } from "@langchain/core/messages";

// Simple rate limiter
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 60, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    // Remove old requests outside time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest!);
      console.log(`[RateLimit] ⏸️  Rate limit reached. Wait ${Math.ceil(waitTime / 1000)}s`);
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

const rateLimiter = new RateLimiter(60, 60000); // 60 requests per minute

// Simple agent that executes tools directly
class CustomTradingAgent {
  private model: any;
  private tools: any[];
  private toolMap: Map<string, any>;

  constructor(model: any, tools: any[]) {
    this.model = model;
    this.tools = tools;
    this.toolMap = new Map(tools.map(t => [t.name, t]));
  }

  // Required by AgentExecutor
  _agentActionType() {
    return "single" as const;
  }

  // Main planning method
  async plan(
    steps: AgentStep[],
    inputs: ChainValues,
    callbackManager?: any
  ): Promise<AgentAction | AgentFinish> {
    const query = inputs.input || inputs.query || "";
    
    console.log(`[Agent] 🤔 Planning (${steps.length} steps completed)`);
    
    // Build context from previous steps
    let context = "";
    if (steps.length > 0) {
      context = "\n\nPrevious actions:\n" + steps.map((step, idx) => {
        const action = step.action as AgentAction;
        return `${idx + 1}. Called ${action.tool} with ${JSON.stringify(action.toolInput)}
   Result: ${step.observation}`;
      }).join("\n\n");
    }

    const prompt = `${TRADING_SYSTEM_PROMPT}

Available tools:
${this.tools.map(t => `- ${t.name}: ${t.description.split('\n')[0]}`).join('\n')}

CRITICAL INSTRUCTIONS:
1. You MUST call get_user_positions first
2. Then MUST call calculate_portfolio_risk
3. Then provide final recommendation

Respond in JSON format ONLY:

To call a tool:
{"action": "tool_call", "tool": "tool_name", "input": {"userId": "...", "symbol": "..."}}

To finish:
{"action": "finish", "output": "your detailed recommendation"}

User query: ${query}${context}

Your JSON response:`;

    console.log("[Agent] 📤 Sending to LLM...");
    
    // Check rate limit
    const canProceed = await rateLimiter.checkLimit();
    if (!canProceed) {
      return {
        returnValues: { 
          output: "Rate limit exceeded. Please try again in a moment." 
        },
        log: "rate_limit_exceeded",
      };
    }
    
    const response = await this.model.invoke(prompt);
    let content = response.content?.toString() || "";
    
    console.log("[Agent] 📥 LLM response:", content.substring(0, 300));

    // Robust JSON extraction
    let jsonContent = content.trim();
    
    // Strip markdown code blocks (multiple patterns)
    jsonContent = jsonContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```\s*$/g, '')
      .trim();
    
    // Try to extract JSON from text if still not valid
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
      console.log("[Agent] 🧹 Extracted JSON from text");
    }

    try {
      // Try to parse as JSON
      const parsed = JSON.parse(jsonContent);
      
      if (parsed.action === "finish") {
        console.log("[Agent] ✅ Finishing with answer");
        return {
          returnValues: { output: parsed.output },
          log: content,
        };
      }
      
      if (parsed.action === "tool_call" && parsed.tool) {
        console.log(`[Agent] 🔧 Tool call: ${parsed.tool}`);
        
        // Validate tool input
        const toolInput = parsed.input || {};
        
        // Check required fields for trading tools
        if (parsed.tool === 'get_user_positions' || parsed.tool === 'calculate_portfolio_risk') {
          if (!toolInput.userId || !toolInput.symbol) {
            console.error("[Agent] ❌ Missing required fields:", toolInput);
            return {
              returnValues: { 
                output: "Error: Unable to analyze positions. Missing required user or symbol information." 
              },
              log: content,
            };
          }
          
          // Validate symbol enum
          const validSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
          if (!validSymbols.includes(toolInput.symbol)) {
            console.error("[Agent] ❌ Invalid symbol:", toolInput.symbol);
            return {
              returnValues: { 
                output: `Error: Invalid symbol '${toolInput.symbol}'. Must be one of: ${validSymbols.join(', ')}` 
              },
              log: content,
            };
          }
          
          // Basic UUID validation
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(toolInput.userId)) {
            console.error("[Agent] ❌ Invalid userId format:", toolInput.userId);
            return {
              returnValues: { 
                output: "Error: Invalid user ID format. Please contact support." 
              },
              log: content,
            };
          }
        }
        
        return {
          tool: parsed.tool,
          toolInput: toolInput,
          log: content,
        };
      }
    } catch (e) {
      console.error("[Agent] ⚠️  Failed to parse JSON response:", e);
    }

    // Fallback: treat as final answer
    console.log("[Agent] 📝 Treating as final answer");
    return {
      returnValues: { output: content },
      log: content,
    };
  }

  // Required method
  async returnStoppedResponse(
    earlyStoppingMethod: string,
    steps: AgentStep[],
    inputs: ChainValues
  ): Promise<AgentFinish> {
    return {
      returnValues: { 
        output: "Stopped due to iteration limit. Please try a simpler question." 
      },
      log: "max_iterations_reached",
    };
  }

  // Required method
  get inputKeys() {
    return ["input"];
  }

  // Optional: for tool preparation
  prepareForOutput(returnValues: Record<string, any>, steps: AgentStep[]) {
    return returnValues;
  }
}

let agentInstance: CustomTradingAgent | null = null;

export async function intializeAgent() {
    if (agentInstance) {
        console.log("Using cached agent");
        return agentInstance;
    }
    
    try {
        console.log("Trading agent started");
        
        const model = createModel();
        const tools = getAllTools();
        
        console.log(`Loaded ${tools.length} tools:`, tools.map(t => t.name));

        agentInstance = new CustomTradingAgent(model, tools);

        console.log("✓ Agent initialized successfully");
        return agentInstance;
    } catch (error) {
        console.error("✗ Failed to initialize agent:", error);
        throw error;
    }
}

export async function askAgent(input: string, userId: string) {
    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`[Agent] NEW QUERY`);
        console.log(`[Agent] User: ${userId}`);
        console.log(`[Agent] Message: "${input}"`);
        console.log(`${'='.repeat(60)}\n`);

        const agent = await intializeAgent();
        const tools = getAllTools();
        const toolMap = new Map(tools.map(t => [t.name, t]));
        
        const formattedInput = `User ID: ${userId}\n\nQuery: ${input}`;
        
        const startTime = Date.now();
        const maxIterations = agentConfig.maxIterations;
        const steps: AgentStep[] = [];
        const toolCallHistory: string[] = [];
        let finalOutput = "";

        // Manual execution loop
        for (let i = 0; i < maxIterations; i++) {
            console.log(`\n[Agent] 🔄 Iteration ${i + 1}/${maxIterations}`);
            
            try {
                // Get next action from agent
                const action = await agent.plan(steps, { input: formattedInput });
                
                // Check if finished
                if ('returnValues' in action) {
                    console.log("[Agent] ✅ Agent finished");
                    finalOutput = action.returnValues.output;
                    break;
                }
                
                // Execute tool
                const toolName = action.tool;
                const toolCallSignature = `${toolName}:${JSON.stringify(action.toolInput)}`;
                
                // Detect repeated tool calls (potential infinite loop)
                if (toolCallHistory.includes(toolCallSignature)) {
                    console.error(`[Agent] ⚠️  Detected repeated tool call: ${toolName}`);
                    finalOutput = "Analysis complete based on available data. Unable to gather additional information.";
                    break;
                }
                
                toolCallHistory.push(toolCallSignature);
                
                const tool = toolMap.get(toolName);
                
                if (!tool) {
                    console.error(`[Agent] ❌ Tool not found: ${toolName}`);
                    finalOutput = `Error: Tool '${toolName}' not found`;
                    break;
                }
                
                console.log(`[Agent] 🔧 Executing: ${toolName}`);
                console.log(`[Agent] 📥 Input:`, action.toolInput);
                
                // Execute tool with retry logic
                let observation = "";
                let retries = 3;
                let lastError: any = null;
                
                for (let attempt = 1; attempt <= retries; attempt++) {
                  try {
                    // Execute tool with timeout (30 seconds)
                    const timeoutPromise = new Promise<string>((_, reject) => {
                      setTimeout(() => reject(new Error('Tool execution timeout')), 30000);
                    });
                    
                    const toolPromise = tool.invoke(action.toolInput);
                    
                    observation = await Promise.race([toolPromise, timeoutPromise]);
                    console.log(`[Agent] ✅ Tool executed (attempt ${attempt})`);
                    break;
                  } catch (toolError: any) {
                    lastError = toolError;
                    console.error(`[Agent] ⚠️  Tool error (attempt ${attempt}/${retries}):`, toolError?.message);
                    
                    if (attempt < retries) {
                      // Wait before retry (exponential backoff)
                      const delay = Math.pow(2, attempt) * 100;
                      console.log(`[Agent] ⏳ Retrying in ${delay}ms...`);
                      await new Promise(resolve => setTimeout(resolve, delay));
                    }
                  }
                }
                
                if (!observation) {
                  observation = `Error executing ${toolName}: ${lastError?.message || 'Unknown error'}. Please try again.`;
                  console.error(`[Agent] ❌ Tool failed after ${retries} attempts`);
                }
                
                console.log(`[Agent] 📤 Result length: ${observation.length} chars`);
                
                steps.push({
                    action: action,
                    observation: observation,
                });
                
            } catch (iterError: any) {
                console.error(`[Agent] ❌ Iteration error:`, iterError?.message);
                finalOutput = `Error during execution: ${iterError?.message}`;
                break;
            }
        }
        
        if (!finalOutput) {
            finalOutput = "Max iterations reached without completing the analysis.";
        }
        
        const duration = Date.now() - startTime;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`[Agent] 📊 EXECUTION COMPLETE`);
        console.log(`[Agent] Steps: ${steps.length}`);
        console.log(`[Agent] Duration: ${duration}ms`);
        console.log(`${'='.repeat(60)}\n`);

        // Filter valid steps with real data
        const validSteps = steps.filter((step) => {
            const obs = step.observation;
            return obs && 
                   typeof obs === 'string' && 
                   obs.length > 50 &&
                   !obs.startsWith('{"userId"') &&
                   (obs.includes('Portfolio') || obs.includes('Positions') || obs.includes('Balance'));
        });

        console.log(`[Agent] Valid steps: ${validSteps.length}`);

        return {
            success: true,
            answer: finalOutput,
            toolsUsed: validSteps.map((step) => (step.action as AgentAction).tool),
            reasoning: validSteps.map(step => ({
                action: step.action,
                observation: step.observation
            })),
            metadata: {
                latency: duration,
                stepsExecuted: steps.length,
            }
        };
    } catch (error: any) {
        console.error("[Agent] ❌ Fatal Error:", error?.message);
        
        return {
            success: false,
            answer: `Error: ${error?.message || 'Unknown error'}`,
            toolsUsed: [],
            reasoning: [],
        };
    }
}