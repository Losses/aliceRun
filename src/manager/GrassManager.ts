import * as THREE from 'three';

import { ResourceTracker } from '../ResourceTracker';
import { Grass } from '../components/Grass';
import { useLerp } from '../utils/lerp';
import { eventTarget } from './EventManager';
import { STEP_ANGLE } from '../constants/ground';
import { STEP_EVENT } from '../utils/StepCounter';

export const GrassManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    const { grass } = Grass(tracker);
    scene.add(grass);

    let rotation = 0;

    const { material } = grass;

    const [updateValue] = useLerp(
        () => rotation,
        (x) => {
            rotation = x;
            material.uniforms.groundDeltaTheta.value = x;
            material.uniformsNeedUpdate = true;
        }
    );

    const step = () => {
        updateValue(rotation + STEP_ANGLE);
    }

    eventTarget.addEventListener(STEP_EVENT, ({ detail }) => {
        step();
    });


    return { };
}