import * as THREE from 'three';

import { Ground } from '../components/Ground2';
import { ResourceTracker } from '../ResourceTracker';
import { useLerp } from '../utils/lerp';
import { eventTarget } from './EventManager';
import { STEP_EVENT } from '../utils/StepCounter';

const STEP_FACTOR = 0.01;

export const GroundManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    const { ground } = Ground(tracker);
    scene.add(ground);

    let rotate = STEP_FACTOR * Math.PI;
    const [updateValue] = useLerp(() => rotate, (x) => {
        ground.rotation.x = x;
        rotate = x;
    });

    const step = () => {
        updateValue(rotate + STEP_FACTOR * Math.PI);
    }

    eventTarget.addEventListener(STEP_EVENT, ({ detail }) => {
        step();
    });

    return { step };
}