// import { Router, Request, Response } from "express";
// import { makeRequest, QueryParams } from "../managers/models/client"; // Ensure proper import of your function and interface

// const router = Router();

// // Route to handle LLM queries
// router.post("/prompt-llm", async (req: Request, res: Response) => {
//   const {
//     prompt,
//     maxTokens,
//     temperature,
//     topP,
//     frequencyPenalty,
//     presencePenalty,
//   } = req.body;

//   if (!prompt || maxTokens === undefined) {
//     return res
//       .status(400)
//       .json({ message: "Prompt and maxTokens are required" });
//   }

//   try {
//     const queryParams: QueryParams = {
//       prompt,
//       maxTokens,
//       temperature,
//       topP,
//       frequencyPenalty,
//       presencePenalty,
//     };
//     const result = await makeRequest(prompt);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error("Error making LLM request:", error);

//     // Type-checking and handling of the error
//     if (error instanceof Error) {
//       // Now 'error' is typed as an Error instance, so we can access 'message'
//       res
//         .status(500)
//         .json({ message: "Failed to query LLM", error: error.message });
//     } else {
//       // If the error is not an instance of Error, handle it differently
//       res
//         .status(500)
//         .json({ message: "Failed to query LLM", error: "Unknown error" });
//     }
//   }
// });
