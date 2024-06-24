import axios from "axios";
import { Command } from "commander";
import prompts, { PromptObject } from "prompts";

const program = new Command();

interface Node {
  name: string;
  prompt: string;
  returnType: string;
}

const nodes: Node[] = [];

// Command to add a new node
program
  .command("add-node")
  .description("Add a new node")
  .action(async () => {
    const questions: PromptObject[] = [
      {
        type: "text",
        name: "name",
        message: "Node name:",
      },
      {
        type: "text",
        name: "prompt",
        message: "Node prompt:",
      },
      {
        type: "text",
        name: "returnType",
        message: "Node return type:",
      },
      {
        type: "list",
        name: "args",
        message: "Node arguments:",
        separator: ",",
      },
    ];

    const answers = await prompts(questions);

    nodes.push({
      name: answers.name,
      prompt: answers.prompt,
      returnType: answers.returnType,
    });

    try {
      await axios.post("http://localhost:3000/api/scaffold", {
        appName: answers.name,
        message: answers.prompt,
        return_type: answers.returnType,
        args: [],
      });
      console.log(`Node ${answers.name} created successfully.`);
    } catch (error) {
      console.error("Error creating node:", error);
    }
  });

// Command to run all nodes in order
program
  .command("run-nodes")
  .description("Run all nodes in order")
  .action(async () => {
    let input = "";

    for (const node of nodes) {
      try {
        const response = await axios.post(
          `http://localhost:5001/${node.name}`,
          {
            input: input,
          }
        );
        input = response.data.output;
        console.log(
          `Node ${node.name} executed successfully with output:`,
          input
        );
      } catch (error) {
        console.error(`Error running node ${node.name}:`, error);
        break;
      }
    }
  });

// Parse the command-line arguments
program.parse(process.argv);
