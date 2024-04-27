import * as THREE from 'three';

import { Ground, getRandomItems, groundCoord } from '../components/Ground2';
import { ResourceTracker } from '../ResourceTracker';
import { useLerp } from '../utils/lerp';
import { eventTarget } from './EventManager';
import { STEP_EVENT } from '../utils/StepCounter';

const STEP_FACTOR = 0.01;

export const GroundManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    const { ground } = Ground(tracker);
    scene.add(ground);

    camera.position.set(-1200, 0, 0);
    camera.lookAt(60, 0, 0);

    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );

    const randomItems = getRandomItems();

    randomItems.forEach((x) => scene.add(x.mesh));

    let rotate = STEP_FACTOR * Math.PI;

    const updateRandomItemPosition = () => {
        for (let i = 0; i < randomItems.length; i += 1) {
            const { mesh, r: meshR, x: meshX } = randomItems[i];

            const { x, y, z } = groundCoord(meshR + rotate, meshX);
            mesh.position.setX(x);
            mesh.position.setY(y);
            mesh.position.setZ(z);
        }
    }

    updateRandomItemPosition();

    const [updateValue] = useLerp(() => rotate, (x) => {
        ground.rotation.x = x;
        rotate = x;
        updateRandomItemPosition();
    });

    const step = () => {
        updateValue(rotate + STEP_FACTOR * Math.PI);
    }

    eventTarget.addEventListener(STEP_EVENT, ({ detail }) => {
        step();
    });

    return { step };
}