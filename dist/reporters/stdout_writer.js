export const STDOUT_WRITER = {
    write(text) {
        process.stdout.write(text);
    },
    writeln(text = "") {
        process.stdout.write(`${text}\n`);
    },
};
