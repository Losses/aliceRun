import * as THREE from 'three';

import { ResourceTracker } from '../ResourceTracker';
import { Grass } from '../components/Grass';

export const GrassManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    const { grass } = Grass(tracker);
    scene.add(grass);

    return { };
}