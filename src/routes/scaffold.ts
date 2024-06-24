import { Router, Request, Response } from "express";
import {
  buildAndRunDocker,
  scaffoldApp,
  scaffoldTask,
  stopDockerContainers,
} from "../managers/scaffolder";

const router = Router();

router.post("/scaffold", async (req: Request, res: Response) => {
  const appId = req.body.nodeId;
  const message = req.body.functionalDescription;
  const returnTypes = req.body.returnTypeDescription;
  const args = req.body.args;
  const port = req.body.port;

  try {
    console.log(`Scaffolding Flask app with name: ${appId}`, req.body);
    scaffoldApp(appId);
    const ids: string[] = req.body.nodeIds;

    await scaffoldTask(message, returnTypes, args, appId, req.body.port, res);

    buildAndRunDocker(appId, port, res);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error during scaffolding: ${errorMessage}`);
    res
      .status(500)
      .send({ message: "Failed to scaffold app or task", error: errorMessage });
  }
});

router.post("/stop-containers", (req: Request, res: Response) => {
  const ports: number[] = req.body.ports;
  const ids: string[] = req.body.nodeIds;

  try {
    stopDockerContainers(ports, ids);
    res.status(200).send({ message: "Docker containers stopping initiated." });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error stopping containers: ${errorMessage}`);
    res.status(500).send({
      message: "Failed to stop Docker containers",
      error: errorMessage,
    });
  }
});

// Add a test route
router.get("/test", (req: Request, res: Response) => {
  console.log(`Test route accessed`);
  res.status(200).send({ message: "Test route is working!" });
});

export default router;
