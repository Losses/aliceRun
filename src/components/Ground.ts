import * as THREE from 'three';

import Rand from 'random-seed';

import { ResourceTracker } from '../ResourceTracker';

const SEGMENTS = 40;
export const GROUND_SIZE = 2000;
const RANDOM_VERTICES_RANGE = 9;

const MATERIAL = new THREE.MeshNormalMaterial({ wireframe: true });

export const Ground = (x: number, y: number, tracker: ResourceTracker) => {
    const centerSeed = `c-${x}-${y}`;
    const topSeed = `b-${x}-${y - 0.5}`;
    const leftSeed = `b-${x - 0.5}-${y}`;
    const rightSeed = `b-${x + 0.5}-${y}`;
    const bottomSeed = `b-${x}-${y + 0.5}`;

    const centerGen = Rand.create(centerSeed);
    const topBorderGen = Rand.create(topSeed);
    const leftBorderGen = Rand.create(leftSeed);
    const rightBorderGen = Rand.create(rightSeed);
    const bottomBorderGen = Rand.create(bottomSeed);

    const centerZMap = Array(SEGMENTS * SEGMENTS).fill(0).map(() => centerGen.intBetween(0, RANDOM_VERTICES_RANGE * 1000));
    const topBorderZMap = Array(SEGMENTS).fill(0).map(() => topBorderGen.intBetween(0, RANDOM_VERTICES_RANGE * 1000));
    const bottomBorderZMap = Array(SEGMENTS).fill(0).map(() => bottomBorderGen.intBetween(0, RANDOM_VERTICES_RANGE * 1000));
    const leftBorderZMap = Array(SEGMENTS - 2).fill(0).map(() => leftBorderGen.intBetween(0, RANDOM_VERTICES_RANGE * 1000));
    const rightBorderZMap = Array(SEGMENTS - 2).fill(0).map(() => rightBorderGen.intBetween(0, RANDOM_VERTICES_RANGE * 1000));

    const geometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, SEGMENTS - 1, SEGMENTS - 1);

    const zMap = new Float32Array(centerZMap);

    for (let i = 0; i < topBorderZMap.length; i++) {
        zMap[i] = topBorderZMap[i];
    }

    for (let i = 0; i < bottomBorderZMap.length; i++) {
        zMap[i + (SEGMENTS - 1) * SEGMENTS] = bottomBorderZMap[i];
    }

    for (let i = 0; i < leftBorderZMap.length; i++) {
        zMap[(i + 1) * SEGMENTS] = leftBorderZMap[i];
    }

    for (let i = 0; i < rightBorderZMap.length; i++) {
        zMap[(i + 2) * SEGMENTS - 1] = rightBorderZMap[i];
    }

    const positions = geometry.getAttribute('position');

    for (let i = 0; i < zMap.length; i++) {
        positions.setZ(i, zMap[i] / 1000);
    }

    const plane = new THREE.Mesh(geometry, MATERIAL);
    plane.position.x = x * GROUND_SIZE - 0.5 * GROUND_SIZE;
    plane.position.z = y * GROUND_SIZE - 0.5 * GROUND_SIZE;
    plane.position.y = -8;
    plane.rotateX(-Math.PI / 2);

    tracker.track(geometry);
    tracker.track(MATERIAL);

    return plane;
}