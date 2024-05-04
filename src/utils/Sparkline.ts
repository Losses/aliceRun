import { WindowedArray } from "./WindowedArray";

export class NumberRecord {
    private _value = 0;

    public history: number[] = [];

    public recording = false;

    constructor() {
    }

    get value() { return this._value };
    set value(x: number) {
        this._value = x;

        if (this.recording) {
            this.history.push(x);
        }
    }

    clear = () => {
        this._value = 0;
        this.history = [];
    }
}

const SPACE_RATIO = 0.1;

export class Sparkline {
    public readonly $canvas = document.createElement('canvas');
    private readonly context: CanvasRenderingContext2D | null = null;

    monitoring = false;
    private data = new WindowedArray(2000);

    public readonly record = new NumberRecord();

    constructor() {
        this.context = this.$canvas.getContext('2d');

        const dpr = window.devicePixelRatio || 1;

        this.$canvas.classList.add('glass');

        this.$canvas.width = 400 * dpr;
        this.$canvas.height = 50 * dpr;

        this.$canvas.style.width = '200px';
        this.$canvas.style.height = '50px';
    }

    get value() {
        return this.record.value;
    }

    set value(x) {
        this.record.value = x;
        if (this.monitoring) {
            this.data.push(x);
        }
    }

    get history() {
        return this.record.history;
    }

    get clear() {
        return this.record.clear;
    }

    get recording() {
        return this.record.recording;
    }

    set recording(x) {
        this.record.recording = x;
    }

    tick() {
        if (!this.context) return;
        const $canvas = this.$canvas;
        const ctx = this.context;
        const data = this.data.array;

        ctx.clearRect(0, 0, $canvas.width, $canvas.height);

        const step = $canvas.width / (data.length - 1);

        const max = this.data.max;
        const min = this.data.min;

        const normalizedData = data.map(value => SPACE_RATIO + ((value - min) / (max - min) * (1 - SPACE_RATIO * 2)));

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, $canvas.height - normalizedData[0] * $canvas.height);
        normalizedData.forEach((value, index) => {
            ctx.lineTo(index * step, $canvas.height - value * $canvas.height);
        });

        ctx.stroke();
    }
}