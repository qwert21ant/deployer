import { SSHTarget } from "./SSHTarget";

export interface Target extends SSHTarget {
  type: "ssh";

  dir: string;
}