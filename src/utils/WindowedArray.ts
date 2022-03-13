export class WindowedArray {
    array: number[] = [];
    constructor(private windowSize: number) {
        this.array.length = windowSize;
        this.array.fill(0);
    }

    push(...args: number[]) {
        this.array.push(...args);

        const length = this.array.length - this.windowSize;

        if (length > 0) {
            this.array.splice(0, length);
        }

        return args.length;
    }
}