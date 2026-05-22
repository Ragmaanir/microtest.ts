export class Rand {
    state;
    constructor(seed) {
        this.state = Rand.hash(seed);
    }
    next() {
        this.state = Math.imul(1664525, this.state) + 1013904223;
        return (this.state >>> 0) / 4294967296;
    }
    shuffle(items) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const other_index = Math.floor(this.next() * (index + 1));
            const item = result[index];
            const other = result[other_index];
            result[index] = other;
            result[other_index] = item;
        }
        return result;
    }
    static hash(seed) {
        let hash = 2166136261;
        for (const char of seed) {
            hash ^= char.charCodeAt(0);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }
}
