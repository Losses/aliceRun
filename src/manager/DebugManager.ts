import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { ResourceTracker } from '../ResourceTracker';
import { timeManager } from './TimeManager';
import { FrameRateLevel } from '../utils/TimeMagic';

export const DebugManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    camera.position.set(-1200, 0, 0);
    camera.lookAt(60, 0, 0);

    const controls = new OrbitControls(camera, document.querySelector("#app") as HTMLDivElement);
    controls.update();

    tracker.track(controls);

    timeManager.addFn(() => controls.update(), FrameRateLevel.D0);

    return { };
}