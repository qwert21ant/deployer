import { exec, ExecOptions } from "child_process";
import { SSHTarget } from "../models";

export interface ExecResult {
  code: number;
  stdout: string;
  stderr: string;
  error: Error;
}

export function execute(command: string, options?: ExecOptions & { dontThrow?: boolean }): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error && !options?.dontThrow) {
        reject(error);
        return;
      }

      resolve({
        code: error ? error.code : 0,
        stdout: stdout.toString(),
        stderr: stderr.toString(),
        error,
      });
    });
  });
}

export function executeSSH(command: string, target: SSHTarget, options?: ExecOptions & { dontThrow?: boolean }): Promise<ExecResult> {
  let cmd = "";
  
  if (options?.cwd)
    cmd += `cd ${options.cwd} && `;

  cmd += command;
  return execute(`ssh ${target.user}@${target.host} -p ${target.port || 22} "${cmd}"`, options);
}