import { Project } from "./Project";
import { Target } from "./Target";

export interface Config {
  targets: Record<string, Target>;
  projects: Record<string, Project>;
}