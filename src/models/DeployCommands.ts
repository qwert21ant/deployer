export interface DeployCommand {
  cmd: string;
  dir?: string;
}

export type DeployCommands = Record<string | "preDeploy" | "postDeploy", DeployCommand>;
