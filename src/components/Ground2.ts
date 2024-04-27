import * as THREE from 'three';

import { ResourceTracker } from '../ResourceTracker';

const RADIUS = 120;
const HEIGHT = 400;
const SCALE_Z = 3;

export const groundCoord = (r: number, x: number) => {
  return new THREE.Vector3(x, RADIUS * Math.sin(r), RADIUS * Math.cos(r) * SCALE_Z);
}

interface IGroundItemDefinition {
  r: number;
  x: number;
  mesh: THREE.Mesh;
}

export const getRandomItems = (count = 50) => {
  const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
  const material = new THREE.MeshDepthMaterial();

  const items: IGroundItemDefinition[] = new Array(count).fill(undefined);

  for (let i = 0; i < count; i += 1) {
    const mesh = new THREE.Mesh(geometry, material);
    items[i] = {
      r: Math.random() * Math.PI * 2,
      x: Math.random() * HEIGHT,
      mesh: mesh,
    };
  }

  return items;
}

export const Ground = (tracker: ResourceTracker) => {
  const geometry = new THREE.CylinderGeometry(RADIUS, RADIUS, HEIGHT, 60, 40, true);
  const material = new THREE.MeshNormalMaterial({ wireframe: true });
  const ground = new THREE.Mesh(geometry, material);

  const group = new THREE.Group();
  group.add(ground);

  ground.position.setY(-RADIUS * 1.05);

  ground.rotateZ(Math.PI / 2);
  group.scale.setZ(SCALE_Z);

  tracker.track(geometry);
  tracker.track(material);

  return { ground, group };
}