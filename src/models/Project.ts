import { DeployCommands } from "./DeployCommands";

export interface Project {
  dir: string;
  files: string[] | Record<string, string>;
  buildCmd?: string;

  commands?: DeployCommands;
}