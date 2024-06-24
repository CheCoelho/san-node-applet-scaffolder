import axios from "axios";
import { config } from "dotenv";
import { createAssistantCompletion } from "./providers/openai";

// Load environment variables
config();

// Constants
const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/engines/davinci/completions";

// TypeScript interface for the request body
export interface QueryParams {
  prompt: string;
  maxTokens: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export const makeRequest = async (
  message: string,
  returnType: string,
  args: string[]
): Promise<string[]> => {
  try {
    const responses = await createAssistantCompletion(
      API_KEY as string,
      message,
      returnType,
      args
    );
    return responses;
  } catch (error) {
    console.error("Error querying LLM:", error);
    throw error;
  }
};
