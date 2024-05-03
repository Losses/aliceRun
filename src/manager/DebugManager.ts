import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { ResourceTracker } from '../ResourceTracker';
import { timeManager } from './TimeManager';
import { FrameRateLevel } from '../utils/TimeMagic';
import { stepCounter } from './JoyConManager';

export const DebugManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    // camera.position.set(-1200, 0, 0);
    // camera.lookAt(60, 0, 0);

    const controls = new OrbitControls(camera, document.querySelector("#app") as HTMLDivElement);
    controls.update();

    // const axesHelper = new THREE.AxesHelper(5);
    // scene.add(axesHelper);

    tracker.track(controls);

    const stepGuide = document.querySelector('.step_guide')!;
    timeManager.addFn(() => {
        controls.update();
        stepGuide.textContent = Date.now() % 800 > 400 ? 'UP' : 'DOWN';
    }, FrameRateLevel.D0);

    
    //@ts-ignore
    window.step = stepCounter.mockStep;

    let recording = false;
    const $recordButton = document.querySelector('.start_record');

    if ($recordButton) {
        $recordButton.addEventListener('click', () => {
            if (recording) {
                $recordButton.textContent = 'Record';
                recording = false;
                stepCounter.dumpRecord();
                stepCounter.recording = false;
            } else {
                $recordButton.textContent = 'Stop';
                stepCounter.reset();
                recording = true;
                stepCounter.recording = true;
            }
        });
    }

    timeManager.addFn(() => {
        if (recording) {
            stepCounter.tick();
        }
    }, FrameRateLevel.D0);

    return { };
}