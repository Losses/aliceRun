import {
   BufferGeometry,
   type CylinderGeometry as CyG0,
   Float32BufferAttribute,
   Vector2,
   Vector3,
} from 'three';

class CylinderThetaUpdateManager {
   constructor(private readonly cylinder: CylinderGeometry2) {}

   updateTheta = (deltaTheta: number) => {
      const points = this.cylinder.points;

      for (let i = 0; i < points.length; i += 1) {
         const point = points[i];
         const theta = point.baseTheta + deltaTheta;
         const sinTheta = Math.sin(theta);
         const cosTheta = Math.cos(theta);

         point.updateTheta(sinTheta, cosTheta);
      }
   };
}

class CylinderPoint {
   constructor(
      private readonly cylinder: CylinderGeometry2,
      private readonly index: number,
      readonly radius: number,
      readonly ratio: number,
      private readonly _height: number,
      readonly baseTheta: number,
   ) {}

   updateTheta = (deltaThetaOrSinTheta: number, cosTheta?: number) => {
      if (cosTheta === undefined) {
         const sinTheta = Math.sin(this.baseTheta + deltaThetaOrSinTheta);
         const cosTheta = Math.cos(this.baseTheta + deltaThetaOrSinTheta);

         this.x = this.radius * sinTheta;
         this.z = this.radius * cosTheta * this.ratio;
      } else {
         this.x = this.radius * deltaThetaOrSinTheta;
         this.z = this.radius * cosTheta * this.ratio;
      }
   };

   get height() {
      return this._height;
   }
   set height(x: number) {
      this.y = x;
   }

   private get x() {
      return this.cylinder.attributes.position.getX(this.index);
   }
   private set x(x: number) {
      this.cylinder.attributes.position.setX(this.index, x);
      this.cylinder.attributes.position.needsUpdate = true;
   }

   private get y() {
      return this.cylinder.attributes.position.getY(this.index);
   }
   private set y(x: number) {
      this.cylinder.attributes.position.setY(this.index, x);
      this.cylinder.attributes.position.needsUpdate = true;
   }

   private get z() {
      return this.cylinder.attributes.position.getZ(this.index);
   }
   private set z(x: number) {
      this.cylinder.attributes.position.setZ(this.index, x);
      this.cylinder.attributes.position.needsUpdate = true;
   }
}

export type CylinderGeometryParameters = CyG0['parameters'] & {
   ratio: number;
};

export class CylinderGeometry2 extends BufferGeometry {
   type = 'CylinderGeometry';

   parameters: CylinderGeometryParameters;

   readonly points: CylinderPoint[];
   private readonly pointsManager: CylinderThetaUpdateManager;
   readonly updateTheta = (deltaTheta: number) => {
      if (!this.attributes.position) return;
      this.pointsManager.updateTheta(deltaTheta);
   };

   constructor({
      radiusTop = 1,
      radiusBottom = 1,
      height = 1,
      radialSegments = 32,
      heightSegments = 1,
      openEnded = false,
      thetaStart = 0,
      thetaLength = Math.PI * 2,
      ratio = 1,
   }: Partial<CylinderGeometryParameters>) {
      super();

      this.parameters = {
         radiusTop,
         radiusBottom,
         height,
         radialSegments,
         heightSegments,
         openEnded,
         thetaStart,
         thetaLength,
         ratio,
      };

      radialSegments = Math.floor(radialSegments);
      heightSegments = Math.floor(heightSegments);

      // buffers

      const indices: number[] = [];
      const vertices: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];

      // helper variables

      let index = 0;
      const indexArray: number[][] = [];
      const halfHeight = height / 2;
      let groupStart = 0;

      // generate geometry

      const points: CylinderPoint[] = [];

      this.points = points;
      this.pointsManager = new CylinderThetaUpdateManager(this);

      const generateTorso = () => {
         const normal = new Vector3();
         const vertex = new Vector3();

         let groupCount = 0;

         // this will be used to calculate the normal
         const slope = (radiusBottom - radiusTop) / height;

         // generate vertices, normals and uvs

         for (let y = 0; y <= heightSegments; y++) {
            const indexRow = [];

            const v = y / heightSegments;

            // calculate the radius of the current row

            const radius = v * (radiusBottom - radiusTop) + radiusTop;

            for (let x = 0; x <= radialSegments; x++) {
               const u = x / radialSegments;

               const theta = u * thetaLength + thetaStart;

               const point = new CylinderPoint(
                  this,
                  y * radialSegments + x,
                  radius,
                  ratio,
                  v * height + halfHeight,
                  theta,
               );
               const sinTheta = Math.sin(theta);
               const cosTheta = Math.cos(theta);

               points.push(point);

               // vertex
               vertex.x = radius * sinTheta;
               vertex.y = -v * height + halfHeight;
               vertex.z = radius * cosTheta * ratio;
               vertices.push(vertex.x, vertex.y, vertex.z);

               // normal

               normal.set(sinTheta, slope, cosTheta).normalize();
               normals.push(normal.x, normal.y, normal.z);

               // uv

               uvs.push(u, 1 - v);

               // save index of vertex in respective row

               indexRow.push(index++);
            }

            // now save vertices of the row in our index array

            indexArray.push(indexRow);
         }

         // generate indices

         for (let x = 0; x < radialSegments; x++) {
            for (let y = 0; y < heightSegments; y++) {
               // we use the index array to access the correct indices

               const a = indexArray[y][x];
               const b = indexArray[y + 1][x];
               const c = indexArray[y + 1][x + 1];
               const d = indexArray[y][x + 1];

               // faces

               indices.push(a, b, d);
               indices.push(b, c, d);

               // update group counter

               groupCount += 6;
            }
         }

         // add a group to the geometry. this will ensure multi material support

         this.addGroup(groupStart, groupCount, 0);

         // calculate new start value for groups

         groupStart += groupCount;
      };

      const generateCap = (top: boolean) => {
         // save the index of the first center vertex
         const centerIndexStart = index;

         const uv = new Vector2();
         const vertex = new Vector3();

         let groupCount = 0;

         const radius = top === true ? radiusTop : radiusBottom;
         const sign = top === true ? 1 : -1;

         // first we generate the center vertex data of the cap.
         // because the geometry needs one set of uvs per face,
         // we must generate a center vertex per face/segment

         for (let x = 1; x <= radialSegments; x++) {
            // vertex

            vertices.push(0, halfHeight * sign, 0);

            // normal

            normals.push(0, sign, 0);

            // uv

            uvs.push(0.5, 0.5);

            // increase index

            index++;
         }

         // save the index of the last center vertex
         const centerIndexEnd = index;

         // now we generate the surrounding vertices, normals and uvs

         for (let x = 0; x <= radialSegments; x++) {
            const u = x / radialSegments;
            const theta = u * thetaLength + thetaStart;

            const cosTheta = Math.cos(theta);
            const sinTheta = Math.sin(theta);

            // vertex

            vertex.x = radius * sinTheta;
            vertex.y = halfHeight * sign;
            vertex.z = radius * cosTheta;
            vertices.push(vertex.x, vertex.y, vertex.z);

            // normal

            normals.push(0, sign, 0);

            // uv

            uv.x = cosTheta * 0.5 + 0.5;
            uv.y = sinTheta * 0.5 * sign + 0.5;
            uvs.push(uv.x, uv.y);

            // increase index

            index++;
         }

         // generate indices

         for (let x = 0; x < radialSegments; x++) {
            const c = centerIndexStart + x;
            const i = centerIndexEnd + x;

            if (top === true) {
               // face top

               indices.push(i, i + 1, c);
            } else {
               // face bottom

               indices.push(i + 1, i, c);
            }

            groupCount += 3;
         }

         // add a group to the geometry. this will ensure multi material support

         this.addGroup(groupStart, groupCount, top === true ? 1 : 2);

         // calculate new start value for groups

         groupStart += groupCount;
      };

      generateTorso();

      if (openEnded === false) {
         if (radiusTop > 0) generateCap(true);
         if (radiusBottom > 0) generateCap(false);
      }

      // build geometry

      this.setIndex(indices);
      this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
      this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
      this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
   }

   copy(source: CylinderGeometry2) {
      super.copy(source);

      this.parameters = Object.assign({}, source.parameters);

      return this;
   }

   // biome-ignore lint/suspicious/noExplicitAny: Users should know what they are doing
   static fromJSON(data: any) {
      return new CylinderGeometry2({
         radiusTop: data.radiusTop,
         radiusBottom: data.radiusBottom,
         height: data.height,
         radialSegments: data.radialSegments,
         heightSegments: data.heightSegments,
         openEnded: data.openEnded,
         thetaStart: data.thetaStart,
         thetaLength: data.thetaLength,
         ratio: data.ratio,
      });
   }
}
