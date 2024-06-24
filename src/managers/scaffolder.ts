import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { Response } from "express";
import { appTemplate } from "../templates/appTemplate";
import { requirementsTemplate } from "../templates/requirementsTemplate";
import { dockerfileTemplate } from "../templates/dockerfileTemplate";
import { taskTemplate } from "../templates/taskTemplate";
import { makeRequest } from "./models/client";

const appletsDir = path.join(__dirname, "..", "applets");

export const scaffoldTask = async (
  message: string,
  returnType: string,
  args: string[],
  id: string,
  port: number,
  res: Response
) => {
  try {
    console.log(`Scaffolding task for app: ${id}`);
    const [taskCode, requirementsContent] = await makeRequest(
      message,
      returnType,
      args
    ); // Assuming makeRequest returns an array with task code and requirements content
    console.log(`Task code received for ${id}: ${taskCode}`);
    console.log(`Requirements received for ${id}: ${requirementsContent}`);

    const tasksFilePath = path.join(appletsDir, id, "tasks.py");
    console.log(`Writing tasks.py to: ${tasksFilePath}`);

    await fs.promises.writeFile(tasksFilePath, taskCode);
    console.log(`tasks.py for ${id} updated successfully`);

    const requirementsFilePath = path.join(appletsDir, id, "requirements.txt");
    console.log(`Updating requirements.txt for ${id}`);
    await fs.promises.writeFile(requirementsFilePath, requirementsContent);
    console.log(`requirements.txt for ${id} updated successfully`);

    // Install the requirements
    const installCommand = `pip install -r ${requirementsFilePath}`;
    exec(installCommand, (installError, installStdout, installStderr) => {
      if (installError) {
        console.error(`Error installing requirements: ${installError.message}`);
        res.status(500).send({
          message: "Failed to install requirements",
          error: installError.message,
        });
        return;
      }
      console.log(`Requirements installed successfully`);

      // Rebuild the Docker image
      const appDir = path.join(appletsDir, id);
      const buildCommand = `docker build -t ${id} ${appDir}`;
      exec(buildCommand, (buildError, buildStdout, buildStderr) => {
        if (buildError) {
          console.error(`Build error: ${buildError.message}`);
          res.status(500).send({
            message: "Docker build failed",
            error: buildError.message,
          });
          return;
        }
        console.log(`Docker image rebuilt successfully for ${id}`);

        // Run the Docker container
        const runCommand = `docker run -d -p ${port}:80 ${id}`;
        exec(runCommand, (runError, runStdout, runStderr) => {
          if (runError) {
            console.error(`Run error: ${runError.message}`);
            res
              .status(500)
              .send({ message: "Docker run failed", error: runError.message });
            return;
          }
          console.log(
            `Docker container started successfully for ${id}, container ID: ${runStdout.trim()}`
          );
          res.status(201).send({
            message:
              "Flask app scaffolded, requirements installed, and running in Docker!",
            containerId: runStdout.trim(),
          });
        });
      });
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error scaffolding task: ${errorMessage}`);
    throw new Error(errorMessage);
  }
};

export const scaffoldApp = (id: string) => {
  const appDir = path.join(appletsDir, id);
  console.log(`Creating directory structure for ${id} at ${appDir}`);

  fs.mkdirSync(appDir, { recursive: true });
  fs.writeFileSync(path.join(appDir, "tasks.py"), taskTemplate());
  fs.writeFileSync(path.join(appDir, "app.py"), appTemplate());
  fs.writeFileSync(
    path.join(appDir, "requirements.txt"),
    requirementsTemplate()
  );
  fs.writeFileSync(path.join(appDir, "Dockerfile"), dockerfileTemplate());
};

export const buildAndRunDocker = (id: string, port: number, res: Response) => {
  const appDir = path.join(appletsDir, id);
  console.log(`Building Docker image for ${id} from ${appDir}`);

  const buildCommand = `docker build -t ${id} ${appDir}`;
  const runCommand = `docker run -d -p ${port}:80 ${id}`;

  exec(buildCommand, (buildError, buildStdout, buildStderr) => {
    if (buildError) {
      console.error(`Build error: ${buildError.message}`);
      res
        .status(500)
        .send({ message: "Docker build failed", error: buildError.message });
      return;
    }

    console.log(`Docker image built successfully for ${id}`);
    exec(runCommand, (runError, runStdout, runStderr) => {
      if (runError) {
        console.error(`Run error: ${runError.message}`);
        res
          .status(500)
          .send({ message: "Docker run failed", error: runError.message });
        return;
      }

      console.log(
        `Docker container started successfully for ${id}, container ID: ${runStdout.trim()}`
      );
      res.status(201).send({
        message: "Flask app scaffolded and running in Docker!",
        containerId: runStdout.trim(),
      });
    });
  });
};

export const stopDockerContainers = (ports: number[], ids: string[]) => {
  ports.forEach((port, index) => {
    const command = `docker ps -q --filter "publish=${port}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Error finding container on port ${port}: ${error.message}`
        );
        return;
      }

      const containerId = stdout.trim();
      if (containerId) {
        const stopCommand = `docker stop ${containerId}`;
        exec(stopCommand, (stopError, stopStdout, stopStderr) => {
          if (stopError) {
            console.error(
              `Error stopping container ${containerId}: ${stopError.message}`
            );
            return;
          }
          console.log(`Container ${containerId} stopped successfully`);

          const removeCommand = `docker rm ${containerId}`;
          exec(removeCommand, (removeError, removeStdout, removeStderr) => {
            if (removeError) {
              console.error(
                `Error removing container ${containerId}: ${removeError.message}`
              );
              return;
            }
            console.log(`Container ${containerId} removed successfully`);

            // Remove the corresponding applet directory
            const appDir = path.join(appletsDir, ids[index]);
            fs.rm(appDir, { recursive: true, force: true }, (rmError) => {
              if (rmError) {
                console.error(
                  `Error removing applet directory ${appDir}: ${rmError.message}`
                );
                return;
              }
              console.log(`Applet directory ${appDir} removed successfully`);
            });
          });
        });
      } else {
        console.log(`No container found running on port ${port}`);
      }
    });
  });
};
