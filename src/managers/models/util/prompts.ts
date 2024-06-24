export const constructFunctionPrompt = (
  promptObjective: string,
  returnType: string,
  args: string[]
): string => {
  const prompt = `Create a function to handle the following task:

${promptObjective}

The code should be written in Python.

${
  args.length === 0
    ? "The function should take no arguments."
    : "The function should take the following arguments: " + args.join(", ")
}

Return only the code, no extra text.

Encapsulate all variables in the function. It will be imported into another module. The function should be called main_task.`;

  return prompt;
};

export const constructRequirementsPrompt = (message: string): string => {
  console.log(`Constructing requirements prompt for: ${message}`);
  const prompt = `Based on the following Python code, create a requirements.txt file listing all necessary dependencies:
  
${message}

Ensure you include the existing requirements in the file:
Flask==2.0.1
Werkzeug==2.2.2`;

  return prompt;
};
