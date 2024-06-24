import { OpenAI } from "openai";
import {
  constructFunctionPrompt,
  constructRequirementsPrompt,
} from "../util/prompts";

const createAssistantCompletion = async (
  apiKey: string,
  message: string,
  returnType: string,
  args: string[]
): Promise<string[]> => {
  const configuration = {
    apiKey: apiKey,
  };
  const openai = new OpenAI(configuration);
  let answers = [];

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: constructFunctionPrompt(message, returnType, args),
        },
      ],
      model: "gpt-3.5-turbo",
    });

    // Extract the content from the completion response and clean it
    let completionText =
      completion.choices[0]?.message?.content || "No content returned";
    answers.push(completionText);
    const completionTwo = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: constructRequirementsPrompt(completionText),
        },
      ],
      model: "gpt-3.5-turbo",
    });
    let completionTextTwo = completionTwo.choices[0].message.content;
    // Remove Markdown code block formatting if present
    if (completionText.startsWith("```") && completionText.endsWith("```")) {
      completionText = completionText.split("\n").slice(1, -1).join("\n");
    }
    if (
      completionTextTwo &&
      completionTextTwo.startsWith("```") &&
      completionTextTwo.endsWith("```")
    ) {
      completionTextTwo = completionTextTwo.split("\n").slice(1, -1).join("\n");
    }

    console.log(`Completion 2: ${completionTextTwo}`);
    if (completionTextTwo) answers.push(completionTextTwo);
    console.log(`answers: ${answers}`);
    return answers;
  } catch (error) {
    console.error("Error when calling OpenAI:", error);
    throw new Error("Failed to get completion from OpenAI");
  }
};

export { createAssistantCompletion };
