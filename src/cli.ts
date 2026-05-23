#!/usr/bin/env node

import { readdir, stat } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { register } from "tsx/esm/api"
import { run } from "./index.js"

export class MicrotestCli {
  static readonly DEFAULT_TARGETS = ["test"]
  static readonly TEST_FILE_EXTENSIONS: ReadonlySet<string> = new Set([".js", ".mjs", ".cjs", ".ts", ".mts", ".cts"])
  static readonly IGNORED_DIRECTORIES: ReadonlySet<string> = new Set(["node_modules", "dist", "fixtures"])

  async run(args: string[]): Promise<void> {
    const targets = args.length === 0 ? MicrotestCli.DEFAULT_TARGETS : args
    const files = await this.collect_test_files(targets)

    if (files.length === 0) {
      console.error(`No test files found for: ${targets.join(", ")}`)
      process.exitCode = 1
      return
    }

    const unregister = register()

    try {
      for (const file of files) {
        await import(pathToFileURL(file).href)
      }

      await run()
    } finally {
      await unregister()
    }
  }

  private async collect_test_files(targets: string[]): Promise<string[]> {
    const files = new Set<string>()

    for (const target of targets) {
      for (const file of await this.collect_target_files(path.resolve(target))) {
        files.add(file)
      }
    }

    return [...files].sort()
  }

  private async collect_target_files(target: string): Promise<string[]> {
    const target_stat = await stat(target)

    if (target_stat.isFile()) {
      return this.is_test_file(target) ? [target] : []
    }

    if (target_stat.isDirectory()) {
      return await this.collect_directory_files(target)
    }

    return []
  }

  private async collect_directory_files(directory: string): Promise<string[]> {
    const files: string[] = []

    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entry_path = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        if (!MicrotestCli.IGNORED_DIRECTORIES.has(entry.name)) {
          files.push(...await this.collect_directory_files(entry_path))
        }
      } else if (entry.isFile() && this.is_test_file(entry_path)) {
        files.push(entry_path)
      }
    }

    return files
  }

  private is_test_file(file: string): boolean {
    return MicrotestCli.TEST_FILE_EXTENSIONS.has(path.extname(file)) && !file.endsWith(".d.ts")
  }
}

await new MicrotestCli().run(process.argv.slice(2)).catch((error: unknown) => {
  process.exitCode = 1
  console.error(error instanceof Error ? error.stack ?? error.message : String(error))
})
