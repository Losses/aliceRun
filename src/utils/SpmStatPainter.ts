import { SplineCurve, Vector2 } from "three";
import { WindowAverageRecord } from "./WindowAverageRecord";

export class SpmStatPainter extends WindowAverageRecord {
    private context: CanvasRenderingContext2D;

    public $canvas = document.getElementById('spm-chart') as HTMLCanvasElement;

    private closed = false;
    private normalized: SplineCurve | null = null;
    private interpolated: Vector2[] | null = null;

    constructor(windowSize: number) {
        super(windowSize);

        const context = this.$canvas.getContext('2d');
        if (!context) {
            throw new Error('Cannot find context of the canvas');
        }
        this.context = context;
    }

    addData(x: number) {
        if (this.closed) return;

        super.addData(x);
        this.normalized = null;
        this.interpolated = null;
    }

    reset(): void {
        super.reset();
        this.closed = false;
    }

    private normalize = () => {
        if (this.normalized) return;
        const max = Math.max(...this.points);
        const min = Math.min(...this.points);
        const unit = 1 / this.points.length;

        this.normalized = new SplineCurve(
            this.points.map((value, index) => {
                return new Vector2(
                    unit * index,
                    (value - min) / (max - min)
                );
            }),
        );
    }

    private intepolate(alpha = 0.03) {
        if (!this.normalized) {
            throw new Error(`Data not normalized`);
        }

        const outputLength = this.$canvas.width;

        if (this.interpolated && this.interpolated.length === outputLength) return;

       this.interpolated = this.normalized.getPoints(outputLength);

       for (let i = 1; i < this.interpolated.length; i += 1) {
            this.interpolated[i].y = this.interpolated[i].y * alpha + this.interpolated[i - 1].y * (1 - alpha);
       }
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

    close() {
        this.closed = true;
    }

    draw(progress: number): void {
        this.normalize();
        this.intepolate();

        if (!this.normalized) {
            throw new Error(`Data not normalized`);
        }
        
        if (!this.interpolated) {
            throw new Error(`Interpolated not generated`);
        }

        const { width, height } = this.$canvas;
        this.context.clearRect(0, 0, width, height);

        this.context.strokeStyle = 'white';
        this.context.lineWidth = 1.5;

        this.context.beginPath();

        const drawPoints = Math.floor(this.interpolated.length * progress);

        for (let x = 0; x < drawPoints; x += 1) {
            const y = 0.1 * height + height * (1 - this.interpolated[x].y) * 0.8;

            if (x === 0) {
                this.context.moveTo(x, y);
            } else {
                this.context.lineTo(x, y);
            }
        }

        this.context.stroke();
    }
}