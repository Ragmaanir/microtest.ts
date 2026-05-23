#!/usr/bin/env node
export declare class MicrotestCli {
    static readonly DEFAULT_TARGETS: string[];
    static readonly TEST_FILE_EXTENSIONS: ReadonlySet<string>;
    static readonly IGNORED_DIRECTORIES: ReadonlySet<string>;
    run(args: string[]): Promise<void>;
    private collect_test_files;
    private collect_target_files;
    private collect_directory_files;
    private is_test_file;
    private disable_auto_run;
    private restore_auto_run;
}
