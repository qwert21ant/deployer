import { Config, DeployCommand, Project, Target } from "./models";
import fs from "fs-extra";
import { execute, executeSSH } from "./utils";
import { join } from "path";

export class Deployer {
  private config: Config = null;

  async init() {
    this.config = await this.loadConfig();
  }

  async deploy(targetNames: string[], projectName: string) {
    const project = this.config.projects[projectName];
    if (!project) throw new Error(`Project "${projectName}" not found in config`);

    const targets: Target[] = [];
    for (const targetName of targetNames) {
      const target = this.config.targets[targetName];
      if (!target) throw new Error(`Target "${targetName}" not found in config`);
      targets.push(target);
    }

    await this.buildProject(project);

    for (let i = 0; i < targets.length; i++) {
      console.log(`Deploying to target "${targetNames[i]}"...`);
      await this.deployOnTarget(targets[i], project);
    }
  }

  private async deployOnTarget(target: Target, project: Project) {
    if (project.commands?.preDeploy)
      await this.executeCommand(project.commands.preDeploy, target);

    await this.copyFiles(project, target);

    if (project.commands?.postDeploy)
      await this.executeCommand(project.commands.postDeploy, target);
  }

  async run(commandName: string, targetNames: string[], projectName: string) {
    const project = this.config.projects[projectName];
    if (!project) throw new Error(`Project "${projectName}" not found in config`);

    const targets: Target[] = [];
    for (const targetName of targetNames) {
      const target = this.config.targets[targetName];
      if (!target) throw new Error(`Target "${targetName}" not found in config`);
      targets.push(target);
    }

    const command = project.commands?.[commandName];
    if (!command) throw new Error(`Command "${commandName}" not found in project`);

    for (let i = 0; i < targets.length; i++) {
      console.log(`Running command "${commandName}" on target "${targetNames[i]}"...`);
      await this.executeCommand(command, targets[i]);
    }
  }

  private async executeCommand(command: DeployCommand, target: Target) {
    console.log(`Executing command "${command.cmd}"...`);
    const res = await executeSSH(command.cmd, target, { cwd: command.dir });
    if (res.code !== 0)
      throw new Error(`Command failed with code ${res.code}\n${res.stderr}`);
  }

  private async copyFiles(project: Project, target: Target) {
    console.log("Copying files...");

    const fileMap: Record<string, string> = Array.isArray(project.files)
      ? Object.fromEntries(project.files.map(file => [file, file]))
      : project.files;

    for (const path in fileMap) {
      console.log(`  - ${path} -> ${fileMap[path]}`);
      const res = await execute(`scp ${join(project.dir, path)} "${target.user}@${target.host}:${join(target.dir, fileMap[path])}"`);
      if (res.code !== 0)
        throw new Error(`Copy failed with code ${res.code}\n${res.stderr}`);
    }
  }

  private async buildProject(project: Project) {
    if (!project.buildCmd) return;

    console.log("Building project...");
    const res = await execute(project.buildCmd, { cwd: project.dir });
    if (res.code !== 0)
      throw new Error(`Build failed with code ${res.code}\n${res.stderr}`);
  }

  private async loadConfig(): Promise<Config> {
    let config: any;
    try {
      config = await fs.readJSON(".deploy.json");
    } catch (e) {
      throw new Error("Failed to load config file: " + e.message);
    }
    if (!this.validateConfig(config))
      throw new Error("Invalid config file");
  
    return config;
  }

  private validateConfig(config: Config): boolean {
    //todo
    return true;
  }
}