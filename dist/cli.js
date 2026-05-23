#!/usr/bin/env node
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { register } from "tsx/esm/api";
import { run } from "./index.js";
export class MicrotestCli {
    static DEFAULT_TARGETS = ["test"];
    static TEST_FILE_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".ts", ".mts", ".cts"]);
    static IGNORED_DIRECTORIES = new Set(["node_modules", "dist", "fixtures"]);
    async run(args) {
        const targets = args.length === 0 ? MicrotestCli.DEFAULT_TARGETS : args;
        const files = await this.collect_test_files(targets);
        if (files.length === 0) {
            console.error(`No test files found for: ${targets.join(", ")}`);
            process.exitCode = 1;
            return;
        }
        const unregister = register();
        try {
            const previous_auto_run = this.disable_auto_run();
            try {
                for (const file of files) {
                    await import(pathToFileURL(file).href);
                }
            }
            finally {
                this.restore_auto_run(previous_auto_run);
            }
            await run();
        }
        finally {
            await unregister();
        }
    }
    async collect_test_files(targets) {
        const files = new Set();
        for (const target of targets) {
            for (const file of await this.collect_target_files(path.resolve(target))) {
                files.add(file);
            }
        }
        return [...files].sort();
    }
    async collect_target_files(target) {
        const target_stat = await stat(target);
        if (target_stat.isFile()) {
            return this.is_test_file(target) ? [target] : [];
        }
        if (target_stat.isDirectory()) {
            return await this.collect_directory_files(target);
        }
        return [];
    }
    async collect_directory_files(directory) {
        const files = [];
        for (const entry of await readdir(directory, { withFileTypes: true })) {
            const entry_path = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                if (!MicrotestCli.IGNORED_DIRECTORIES.has(entry.name)) {
                    files.push(...await this.collect_directory_files(entry_path));
                }
            }
            else if (entry.isFile() && this.is_test_file(entry_path)) {
                files.push(entry_path);
            }
        }
        return files;
    }
    is_test_file(file) {
        return MicrotestCli.TEST_FILE_EXTENSIONS.has(path.extname(file)) && !file.endsWith(".d.ts");
    }
    disable_auto_run() {
        const previous_auto_run = process.env.MICROTEST_DISABLE_AUTO_RUN;
        process.env.MICROTEST_DISABLE_AUTO_RUN = "1";
        return previous_auto_run;
    }
    restore_auto_run(previous_auto_run) {
        if (previous_auto_run === undefined) {
            delete process.env.MICROTEST_DISABLE_AUTO_RUN;
            return;
        }
        process.env.MICROTEST_DISABLE_AUTO_RUN = previous_auto_run;
    }
}
await new MicrotestCli().run(process.argv.slice(2)).catch((error) => {
    process.exitCode = 1;
    console.error(error instanceof Error ? error.stack ?? error.message : String(error));
});
