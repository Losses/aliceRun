import {
	Vector2,
	Vector3,
	BufferGeometry,
	Float32BufferAttribute,
	type CylinderGeometry as CyG0
} from 'three';

class CylinderThetaUpdateManager {
	private sinCache = new Map<number, number>();
	private cosCache = new Map<number, number>();
	constructor(private readonly points: CylinderPoint[]) { };

	private setCache(map: Map<number, number>, theta: number, cachedValue: number) {
		map.set(theta, cachedValue);

		return cachedValue;
	}

	updateTheta = (deltaTheta: number) => {
		for (let i = 0; i < this.points.length; i += 1) {
			const point = this.points[i];
			const theta = point.baseTheta + deltaTheta;
			const sinTheta = this.sinCache.get(theta) ?? this.setCache(this.sinCache, theta, Math.sin(theta));
			const cosTheta = this.cosCache.get(theta) ?? this.setCache(this.cosCache, theta, Math.cos(theta));

			point.updateTheta(sinTheta, cosTheta);
		}
	}
}

class CylinderPoint {
	constructor(
		private readonly vertices: number[],
		private readonly position: number,
		readonly radius: number,
		readonly ratio: number,
		private readonly _height = 0,
		readonly baseTheta: number,
	) {

	}

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
	}

	get height() { return this._height };
	set height(x: number) {
		this.y = x;
	}

	private get x() { return this.vertices[this.position] }
	private set x(x: number) { this.vertices[this.position] = x }

	private get y() { return this.vertices[this.position + 1] }
	private set y(x: number) { this.vertices[this.position + 1] = x }

	private get z() { return this.vertices[this.position + 2] }
	private set z(x: number) { this.vertices[this.position + 2] = x }
}

export type CylinderGeometryParameters = CyG0['parameters'] & {
	ratio: number;
}

export class CylinderGeometry2 extends BufferGeometry {
	type = 'CylinderGeometry';

	parameters: CylinderGeometryParameters;

	readonly points: CylinderPoint[];
	private readonly pointsManager: CylinderThetaUpdateManager;
	readonly updateTheta = (deltaTheta: number) => {
		this.pointsManager.updateTheta(deltaTheta);
		console.log(this.getAttribute('position').needsUpdate);
		this.getAttribute('position').needsUpdate = true;
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

		const scope = this;

		radialSegments = Math.floor(radialSegments);
		heightSegments = Math.floor(heightSegments);

		// buffers

		const indices: number[] = [];
		const vertices: number[] = new Array(radialSegments * heightSegments * 3).fill(0);
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
		this.pointsManager = new CylinderThetaUpdateManager(points);

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

		function generateTorso() {

			const normal = new Vector3();

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

					const point = new CylinderPoint(vertices, (y * radialSegments + x) * 3, radius, ratio, v * height + halfHeight, theta);
					const sinTheta = Math.sin(theta);
					const cosTheta = Math.cos(theta);

					points.push(point);

					// vertex

					point.updateTheta(0);
					point.height = - v * height + halfHeight;

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

			scope.addGroup(groupStart, groupCount, 0);

			// calculate new start value for groups

			groupStart += groupCount;

		}

		function generateCap(top: boolean) {

			// save the index of the first center vertex
			const centerIndexStart = index;

			const uv = new Vector2();
			const vertex = new Vector3();

			let groupCount = 0;

			const radius = (top === true) ? radiusTop : radiusBottom;
			const sign = (top === true) ? 1 : - 1;

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

				uv.x = (cosTheta * 0.5) + 0.5;
				uv.y = (sinTheta * 0.5 * sign) + 0.5;
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

			scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);

			// calculate new start value for groups

			groupStart += groupCount;

		}
	}

	copy(source: CylinderGeometry2) {

		super.copy(source);

		this.parameters = Object.assign({}, source.parameters);

		return this;

	}

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
