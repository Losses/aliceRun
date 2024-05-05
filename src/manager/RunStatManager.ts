import { ROUTER_ID } from "../stores/router";
import { STEP_EVENT } from "../utils/StepCounter";
import { FrameRateLevel } from "../utils/TimeMagic";
import { eventTarget } from "./EventManager";
import { stepCounter } from "./JoyConManager";
import { timeManager } from "./TimeManager";

export const RunStatManager = () => {
    let startTime = 0;

    const $time = document.querySelector('.time-value');
    if (!$time) throw new Error('Time element not found');
    
    const $steps = document.querySelector('.steps-value');
    if (!$steps) throw new Error('Steps element not found');
    
    const $spm = document.querySelector('.spm-value');
    if (!$spm) throw new Error('SPM element not found');

    const $type = document.querySelector('.type-value');

    const tick = () => {
        const deltaTime = Date.now() - startTime;
        const minutes = Math.floor(deltaTime / (60 * 1000));
        const seconds = Math.floor(deltaTime % (60 * 1000) / 1000);
        $time.textContent = `${minutes.toString().padStart(3, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    ROUTER_ID.subscribe((id) => {
        if (id === '/single') {
            stepCounter.reset();
            startTime = Date.now();
            timeManager.addFn(tick, FrameRateLevel.D3);
        } else {
            timeManager.removeFn(tick);
        }
    });

    eventTarget.addEventListener(STEP_EVENT, ({detail: { magnitude, total, strideRate, type }}) => {
        if (ROUTER_ID.value !== '/single') return;

        $steps.textContent = total.toString().padStart(4, '0');
        $spm.textContent = Math.floor(strideRate).toString().padStart(3, '0');

        if ($type) {
            $type.textContent = type;
        }
      }
    );
}