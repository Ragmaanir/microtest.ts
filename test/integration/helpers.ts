import { spawnSync } from "node:child_process"

export interface IntegrationResult {
  status: number | null
  stdout: string
  stderr: string
  output: string
}

export function run_fixture(path: string): IntegrationResult {
  const result = spawnSync(`pnpm exec tsx src/cli.ts ${path}`, {
    encoding: "utf8",
    env: {
      ...process.env,
      COLOR: "0",
    },
    shell: true,
  })

  const stdout = result.stdout?.toString() ?? ""
  const stderr = result.stderr?.toString() ?? ""

  return {
    status: result.status,
    stdout,
    stderr,
    output: `${stdout}${stderr}`,
  }
}
