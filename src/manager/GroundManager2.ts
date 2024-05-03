import * as THREE from 'three';

import { Ground } from '../components/Ground2';
import { useLerp } from '../utils/lerp';
import { STEP_ANGLE } from '../constants/ground';
import { STEP_EVENT } from '../utils/StepCounter';
import { eventTarget } from './EventManager';
import { ResourceTracker } from '../ResourceTracker';
import { CylinderGeometry2 } from '../components/CylinderGeometry2';
import { GroundObject } from '../components/GroundObject';

export const GroundManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    const { ground } = Ground(tracker);
    scene.add(ground);

    const light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light);

    let rotate = 0;

    const [updateValue] = useLerp(() => rotate, (x) => {
        (ground.geometry as CylinderGeometry2).updateTheta(-x);
        rotate = x;
    });

    const step = () => {
        updateValue(rotate + STEP_ANGLE);
    }

    eventTarget.addEventListener(STEP_EVENT, ({ detail }) => {
        step();
    });

    return { step };
}