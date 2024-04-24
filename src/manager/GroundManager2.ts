import * as THREE from 'three';

import { Ground } from '../components/Ground2';
import { ResourceTracker } from '../ResourceTracker';

export const GroundManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    const { ground } = Ground(tracker);
    scene.add(ground);
    
    const updateGroundTiles = () => {
    }

    return updateGroundTiles;
}