import { ROUTER_ID } from "../stores/router"
import { FrameRateLevel } from "../utils/TimeMagic";
import { stepCounter } from "./JoyConManager";
import { timeManager } from "./TimeManager";

const WAIT_TIME = 5000;

export const DiagnosisManager = () => {
    const $main = document.querySelector('.diagnosis-charts');
    if (!$main) return;

    Object.entries(stepCounter.data).forEach(([key, sparkline]) => {
        const $container = document.createElement('div');
        $container.classList.add('diagnosis-sparkline-container');
        const $label = document.createElement('span');
        $label.classList.add('label');
        $label.textContent = key;
        $container.appendChild(sparkline.$canvas);
        $container.appendChild($label);

        $main.appendChild($container);
    });

    ROUTER_ID.subscribe((id) => {
        const routerMatch = id === '/settings/diagnosis-hid';
        stepCounter.monitoring = routerMatch;

        if (routerMatch) {
            timeManager.addFn(stepCounter.updateSparklines, FrameRateLevel.D0);
        } else {
            timeManager.removeFn(stepCounter.updateSparklines);
        }
    });

    let startTime = 0;
    let triggeredRecording = false;
    let trueRecording = false;
    const $recordButton = document.querySelector('.start_record');

    const switchRecording = () => {
        trueRecording = false;
        if (!$recordButton) return;
        if (stepCounter.recording) {
            triggeredRecording = false;
            trueRecording = false;
            $recordButton.textContent = 'Record';
            stepCounter.recording = false;
            stepCounter.dumpRecord();
        } else {
            startTime = Date.now();
            triggeredRecording = true;
        }
    };

    if ($recordButton) {
        $recordButton.addEventListener('click', switchRecording);
    }

    timeManager.addFn(() => {
        if (!$recordButton) return;
        if (!triggeredRecording) return;

        const now = Date.now();
        const diff = now - startTime;
        if (diff < WAIT_TIME) {
            $recordButton.textContent = 'Ready';
        } else {
            if (!trueRecording) {
                stepCounter.reset();
                stepCounter.recording = true;
            }
            $recordButton.textContent = 'Stop';
        }

        const recordingTime = diff - WAIT_TIME;

        if (recordingTime > 60 * 1000) {
            return switchRecording();
        }

        const beginAlpha = now % 800 > 400 ? 0.8 : 0.6;
        const endAlpha = now % 800 > 400 ? 0.4 : 0.1;

        const percent = Math.min(((recordingTime) / (60 * 1000)) * 100, 100);
        $recordButton.setAttribute(
            'style',
            `background: linear-gradient(90deg, rgba(0,0,0,${beginAlpha}) 0%, rgba(0,0,0,${beginAlpha}) ${percent - 0.1}%, rgba(0,0,0,${endAlpha}) ${percent}%, rgba(0,0,0,${endAlpha}) ${percent + 0.1}%);`
        );
    }, FrameRateLevel.D0);
}