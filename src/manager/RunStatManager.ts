import { ROUTER_ID } from "../stores/router";
import { LowPassFilter } from "../utils/LowPassFilter";
import { RateEstimator } from "../utils/RateEstimator";
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

    const rateEstimator = new RateEstimator();
    const strideRateFilter = new LowPassFilter(0.2);

    const tick = () => {
        const deltaTime = Date.now() - startTime;
        const minutes = Math.floor(deltaTime / (60 * 1000));
        const seconds = Math.floor(deltaTime % (60 * 1000) / 1000);
        $time.textContent = `${minutes.toString().padStart(3, '0')}:${seconds.toString().padStart(2, '0')}`;
        $spm.textContent = Math.floor(strideRateFilter.filter(rateEstimator.estimateRate())).toString().padStart(3, '0');
    }

    ROUTER_ID.subscribe((id) => {
        if (id === '/single') {
            rateEstimator.reset();
            stepCounter.reset();
            startTime = Date.now();
            timeManager.addFn(tick, FrameRateLevel.D3);
        } else {
            timeManager.removeFn(tick);
        }
    });

    eventTarget.addEventListener(STEP_EVENT, ({detail: { magnitude, total, strideRate, type }}) => {
        if (ROUTER_ID.value !== '/single') return;

        rateEstimator.record();
        $steps.textContent = total.toString().padStart(4, '0');

        if ($type) {
            $type.textContent = type;
        }
      }
    );
}