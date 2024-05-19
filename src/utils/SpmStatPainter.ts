import { SplineCurve, Vector2 } from 'three';
import { WindowAverageRecord } from './WindowAverageRecord';

const BODY_ALPHA = 0.4;
const TIP_SIZE = 50;

export class SpmStatPainter extends WindowAverageRecord {
   private context: CanvasRenderingContext2D;

   public $canvas: HTMLCanvasElement;

   private closed = false;
   private normalized: SplineCurve | null = null;
   private interpolated: Vector2[] | null = null;

   constructor(windowSize: number, id: string, private color = '255, 255, 255') {
      super(windowSize);

      this.$canvas = document.getElementById(id) as HTMLCanvasElement;

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
            return new Vector2(unit * index, (value - min) / (max - min));
         }),
      );
   };

   private intepolate(alpha = 0.2) {
      if (!this.normalized) {
         throw new Error('Data not normalized');
      }

      const outputLength = this.$canvas.width;

      if (this.interpolated && this.interpolated.length === outputLength)
         return;

      this.interpolated = this.normalized.getPoints(outputLength);

      for (let i = 1; i < this.interpolated.length; i += 1) {
         this.interpolated[i].y =
            this.interpolated[i].y * alpha +
            this.interpolated[i - 1].y * (1 - alpha);
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
      if (!this.points.length) return;

      this.normalize();
      this.intepolate();

      if (!this.normalized) {
         throw new Error('Data not normalized');
      }

      if (!this.interpolated) {
         throw new Error('Interpolated not generated');
      }

      const { width, height } = this.$canvas;
      this.context.clearRect(0, 0, width, height);

      this.context.strokeStyle = 'white';
      this.context.lineWidth = 4;

      this.context.beginPath();

      const totalPoints = this.interpolated.length;
      const drawPoints = Math.floor(totalPoints * progress);

      const gradient = this.context.createLinearGradient(0, 0, drawPoints, 0);

      const bodyAlpha =
         drawPoints + TIP_SIZE > totalPoints
            ? BODY_ALPHA +
              (1 - BODY_ALPHA) * (1 - (totalPoints - drawPoints) / TIP_SIZE)
            : BODY_ALPHA;

      gradient.addColorStop(0, `rgba(${this.color}, ${bodyAlpha})`);
      if (drawPoints < TIP_SIZE) {
         gradient.addColorStop(1, `rgba(${this.color}, 1)`);
      } else {
         gradient.addColorStop(
            (drawPoints - TIP_SIZE) / drawPoints,
            `rgba(${this.color}, ${bodyAlpha})`,
         );
         gradient.addColorStop(1, `rgba(${this.color}, 1)`);
      }

      this.context.strokeStyle = gradient;

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
