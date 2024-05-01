import * as THREE from 'three';

import { ResourceTracker } from '../ResourceTracker';
import { CylinderGeometry2 } from './CylinderGeometry2';

const RADIUS = 120;
const HEIGHT = 80;
const SCALE_Z = 3;

const GROUND_Y_OFFSET = 1.05;

export const groundCoord = (r: number, x: number) => {
  return new THREE.Vector3(x, RADIUS * Math.cos(r) - RADIUS * GROUND_Y_OFFSET, RADIUS * Math.sin(r) * SCALE_Z);
}

interface IGroundItemDefinition {
  r: number;
  x: number;
  mesh: THREE.Mesh;
}

export const getRandomItems = (count = 50) => {
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshNormalMaterial();

  const items: IGroundItemDefinition[] = new Array(count).fill(undefined);

  for (let i = 0; i < count; i += 1) {
    const mesh = new THREE.Mesh(geometry, material);
    items[i] = {
      r: Math.random() * Math.PI * 2,
      x: Math.random() * HEIGHT - HEIGHT / 2,
      mesh: mesh,
    };
  }

  return items;
}

export const Ground = (tracker: ResourceTracker) => {
  const geometry = new CylinderGeometry2({
    radiusTop: RADIUS,
    radiusBottom: RADIUS,
    height: HEIGHT,
    radialSegments: 60,
    heightSegments: 40,
    openEnded: true,
    ratio: SCALE_Z,
  });
  // const material = new THREE.MeshNormalMaterial({ wireframe: true });
  const material = new THREE.MeshMatcapMaterial( { color: 0x049EF4, flatShading: true } );
  const ground = new THREE.Mesh(geometry, material);

  //@ts-ignore
  window.g = ground;

  ground.position.setY(-RADIUS * GROUND_Y_OFFSET);

  ground.rotateZ(Math.PI / 2);

  tracker.track(geometry);
  tracker.track(material);

  return { ground };
}