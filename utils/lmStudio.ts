import { LMStudioClient } from "@lmstudio/sdk";
const client = new LMStudioClient();

const model = await client.llm.model("deepseek-r1-distill-qwen-7b");
const result = await model.respond("What is the capital of France?");

console.log(result);
