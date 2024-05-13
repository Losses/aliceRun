import { WindowAverageRecord } from "./WindowAverageRecord";

export class SpmStatPainter extends WindowAverageRecord {
    private context: CanvasRenderingContext2D;

    public $canvas = document.getElementById('spm-chart') as HTMLCanvasElement;

    private normalized: number[] | null = null;
    private interpolated: number[] | null = null;

    constructor(windowSize: number) {
        super(windowSize);

        const context = this.$canvas.getContext('2d');
        if (!context) {
            throw new Error('Cannot find context of the canvas');
        }
        this.context = context;
    }

    addData(x: number) {
        super.addData(x);
        this.normalized = null;
        this.interpolated = null;
    }

    private normalize = () => {
        if (this.normalized) return;
        const max = Math.max(...this.points);
        const min = Math.min(...this.points);

        this.normalized = this.points.map(value => ((value - min) / (max - min)));
    }

    private exponentialSmoothing(alpha = 0.99) {
        if (!this.normalized) {
            throw new Error(`Data not normalized`);
        }

        const outputLength = this.$canvas.width;

        if (this.interpolated && this.interpolated.length === outputLength) return;

        console.log('smoothing', this.$canvas, outputLength);

        this.interpolated = new Array(outputLength).fill(0);

        const n = this.normalized.length - 1;

        for (let i = 0; i < outputLength; i++) {
            const x = i / (outputLength - 1);
            const index = Math.floor(x * n);
            // const weight = x * n - index;
    
            if (i === 0) {
                this.interpolated[i] =  this.normalized[0];
            } else if (i === outputLength - 1) {
                this.interpolated[i] = this.normalized[i];
            } else {
                // this.interpolated[i] = alpha * this.interpolated[i] + (1 - alpha) * this.interpolated[i - 1];
                // this.interpolated[i] = (1 - weight) * this.normalized[index] + weight * this.normalized[index + 1];
                this.interpolated[i] = alpha * this.interpolated[i - 1] + (1 - alpha) * this.normalized[index];
            }
        }
    
        return this.interpolated;
    }

    public resizeToParent(): void {
        const parent = this.$canvas.parentElement;
        if (!parent) {
            throw new Error('Canvas does not have a parent element');
        }

        const rect = parent.getBoundingClientRect();
        this.$canvas.width = rect.width * window.devicePixelRatio;
        this.$canvas.height = rect.height * window.devicePixelRatio;

        this.$canvas.style.width = `${rect.width}px`;
        this.$canvas.style.height = `${rect.height}px`;
    }


    draw(progress: number): void {
        this.normalize();
        this.exponentialSmoothing();

        if (!this.normalized) {
            throw new Error(`Data not normalized`);
        }
        
        if (!this.interpolated) {
            throw new Error(`Interpolated not generated`);
        }

        const { width, height } = this.$canvas;
        this.context.clearRect(0, 0, width, height);

        this.context.strokeStyle = 'white';

        this.context.beginPath();

        const drawPoints = Math.floor(this.interpolated.length * progress);

        console.log(drawPoints, this.interpolated);

        for (let x = 0; x <= drawPoints; x += 1) {
            const y = 0.1 + height * (1 - this.interpolated[x]) * 0.8;

            if (x === 0) {
                this.context.moveTo(x, y);
            } else {
                this.context.lineTo(x, y);
            }
        }

        this.context.stroke();
    }
}