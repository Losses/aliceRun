class SpmStatPainter {
    private context: CanvasRenderingContext2D;

    public canvas = document.createElement('canvas');

    constructor(private points: number[]) {
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Cannot find context of the canvas');
        }
        this.context = context;
    }

    public resizeToParent(): void {
        const parent = this.canvas.parentElement;
        if (!parent) {
            throw new Error('Canvas does not have a parent element');
        }

        const rect = parent.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;

        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }


    draw(progress: number): void {
        const { width, height } = this.canvas;
        this.context.clearRect(0, 0, width, height);

        this.context.beginPath();

        const pointsToDraw = Math.ceil(progress * (this.points.length - 1));
        for (let i = 0; i <= pointsToDraw; i++) {
            let currentX = (width / (this.points.length - 1)) * i;
            let currentY = height - (height * this.points[i]);

            if (i > 0 && i <= pointsToDraw) {
                let prevX = (width / (this.points.length - 1)) * (i - 1);
                let prevY = height - (height * this.points[i - 1]);
                let interpolatedX = prevX + (currentX - prevX) * (progress * (this.points.length - 1) - i + 1);
                let interpolatedY = prevY + (currentY - prevY) * (progress * (this.points.length - 1) - i + 1);
                this.context.lineTo(interpolatedX, interpolatedY);
            } else {
                this.context.moveTo(currentX, currentY);
            }
        }

        this.context.stroke();
    }
}