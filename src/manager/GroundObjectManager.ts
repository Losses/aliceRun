import * as THREE from 'three';

import { useLerp } from '../utils/lerp';
import { STEP_ANGLE } from '../constants/ground';
import { STEP_EVENT } from '../utils/StepCounter';
import { eventTarget } from './EventManager';
import { ResourceTracker } from '../ResourceTracker';
import { GroundObject } from '../components/GroundObject';
import { CompressedTexture } from '../utils/CompressedTexture';

export const GroundObjectManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker, renderer: THREE.WebGLRenderer) => {
    const groundObjects: ReturnType<typeof GroundObject>['groundObject'][] = [];

    for (let i = 0; i < 7; i += 1) {
        const { groundObject } = GroundObject(CompressedTexture(`/textures/g${ i + 1 }.ktx2`, renderer), tracker);
        scene.add(groundObject);

        groundObjects.push(groundObject);
    }

    for (let i = 4; i < 7; i += 1) {
        const { groundObject } = GroundObject(CompressedTexture(`/textures/p${ i + 1 }.ktx2`, renderer), tracker);
        scene.add(groundObject);

        groundObjects.push(groundObject);
    }

    let rotate = 0;

    const [updateValue] = useLerp(() => rotate, (x) => {
        for (let i = 0; i < groundObjects.length; i += 1) {
            const object = groundObjects[i];

            object.material.uniforms.groundDeltaTheta.value = x;
            object.material.uniformsNeedUpdate = true;
        }

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