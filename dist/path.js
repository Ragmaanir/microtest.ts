export class Path {
    static normalize(file_path) {
        return file_path.replace(/\\/g, "/");
    }
    static starts_with(file_path, prefix) {
        const normalized_path = Path.normalize(file_path);
        const normalized_prefix = Path.normalize(prefix);
        return normalized_path === normalized_prefix || normalized_path.startsWith(`${normalized_prefix}/`);
    }
    static replace_prefix(file_path, prefix, replacement) {
        const normalized_prefix = Path.normalize(prefix);
        const suffix = file_path.slice(normalized_prefix.length);
        return `${replacement}${suffix}`;
    }
    static segment_index(file_path, segment) {
        const normalized_path = Path.normalize(file_path);
        if (normalized_path === segment || normalized_path.startsWith(`${segment}/`)) {
            return 0;
        }
        const middle_index = normalized_path.indexOf(`/${segment}/`);
        if (middle_index >= 0) {
            return middle_index + 1;
        }
        const end_index = normalized_path.indexOf(`/${segment}`);
        if (end_index >= 0 && end_index + segment.length + 1 === normalized_path.length) {
            return end_index + 1;
        }
        return null;
    }
}
