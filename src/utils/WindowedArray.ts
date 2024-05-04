export class WindowedArray {
    array: number[] = [];
    constructor(private readonly windowSize: number, private readonly initialValue = 0) {
        this.array.length = windowSize;
        this.array.fill(initialValue);
    }

    max = this.initialValue;
    min = this.initialValue;

    push(...args: number[]) {
        this.max = Math.max(this.max, ...args);
        this.min = Math.min(this.min, ...args);

        this.array.push(...args);

        const length = this.array.length - this.windowSize;

        if (length > 0) {
            this.array.splice(0, length);
        }

        return args.length;
    }
}