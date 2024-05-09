import { ROUTER_ID } from "../stores/router";
import { LowPassFilter } from "../utils/LowPassFilter";
import { RateEstimator } from "../utils/RateEstimator";
import { STEP_EVENT } from "../utils/StepCounter";
import { FrameRateLevel } from "../utils/TimeMagic";
import { eventTarget } from "./EventManager";
import { stepCounter } from "./JoyConManager";
import { timeManager } from "./TimeManager";

export const INFINITE_TIME_KEY = 'alice-run-inf-time';
export const INFINITE_STEP_KEY = 'alice-run-inf-step';

const parseInt = (x: string | null | undefined) => {
    if (x === null) return 0;
    if (x === undefined) return 0;

    const number = Number.parseFloat(x);

    if (Number.isNaN(number)) return 0;

    return Math.floor(number);
}

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

    let lastSyncTime = 0;
    const tick = () => {
        const deltaTime = Date.now() - startTime;
        const minutes = Math.floor(deltaTime / (60 * 1000));
        const seconds = Math.floor(deltaTime % (60 * 1000) / 1000);
        $time.textContent = `${minutes.toString().padStart(3, '0')}:${seconds.toString().padStart(2, '0')}`;
        $spm.textContent = Math.floor(strideRateFilter.filter(rateEstimator.estimateRate())).toString().padStart(3, '0');
    }

    ROUTER_ID.subscribe((id) => {
        if (id.includes('/single/play/')) {
            rateEstimator.reset();
            stepCounter.reset();
            startTime = Date.now();

            if (id === '/single/play/infinite') {
                stepCounter.stepCount = parseInt(localStorage.getItem(INFINITE_STEP_KEY));
                $steps.textContent = stepCounter.stepCount.toString().padStart(4, '0');
                startTime = Date.now() - parseInt(localStorage.getItem(INFINITE_TIME_KEY));
            }

            timeManager.addFn(tick, FrameRateLevel.D3);
        } else {
            timeManager.removeFn(tick);
        }
    });

    eventTarget.addEventListener(STEP_EVENT, ({detail: { magnitude, total, strideRate, type }}) => {
        if (!ROUTER_ID.value.includes('/single/play/')) return;

        rateEstimator.record();
        $steps.textContent = total.toString().padStart(4, '0');

        if ($type) {
            $type.textContent = type;
        }

        if (ROUTER_ID.value === '/single/play/infinite' && Date.now() - lastSyncTime > 600) {
            const deltaTime = Date.now() - startTime;
            localStorage.setItem(INFINITE_TIME_KEY, deltaTime.toString());
            localStorage.setItem(INFINITE_STEP_KEY, stepCounter.stepCount.toString());
            lastSyncTime = Date.now();
        }
      }
    );
}