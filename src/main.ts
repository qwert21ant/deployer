import { program } from "commander";
import { Deployer } from "./Deployer";

export async function main() {
  const deployer = new Deployer();
  await deployer.init();

  program
    .name("deployer")
    .description("Tool for deploy projects via SSH");
  
  program
    .command("deploy")
    .description("Deploy a project to a target")
    .option("-p, --project <project>", "Project to deploy")
    .option("-t, --target <target...>", "Target(s) to deploy to")
    .action(async (options) => {
      const { target, project } = options;
      if (!target || !project) {
        console.error("Both target and project are required");
        process.exit(1);
      }
      
      await deployer.deploy(target, project);
    });

  program
    .command("run")
    .description("Run a command on the target(s)")
    .arguments("<command>")
    .option("-p, --project <project>", "Project to deploy")
    .option("-t, --target <target...>", "Target(s) to deploy to")
    .action(async (command, options) => {
      const { target, project } = options;
      if (!target || !project) {
        console.error("Both target and project are required");
        process.exit(1);
      }
      
      await deployer.run(command, target, project);
    });

  program.parse();
}
