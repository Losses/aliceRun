import { ROUTER_ID } from "../stores/router";
import { HIGH_LIMIT, LOW_LIMIT, SPM } from "../stores/runStat";
import { LowPassFilter } from "../utils/LowPassFilter";
import { RateEstimator } from "../utils/RateEstimator";
import { SpmStatPainter } from "../utils/SpmStatPainter";
import { STEP_EVENT } from "../utils/StepCounter";
import { FrameRateLevel } from "../utils/TimeMagic";
import { useLerp } from "../utils/lerp";
import { store } from "./DataManager";
import { eventTarget } from "./EventManager";
import { p1 } from "./JoyConManager";
import { timeLine } from "./StoryManager";
import { timeManager } from "./TimeManager";

export const INFINITE_TIME_KEY = 'alice-run-inf-time';
export const INFINITE_STEP_KEY = 'alice-run-inf-step';

const isInfiniteMode = () => ROUTER_ID.value === '/single/play/infinite';

const A = `255,255,255,`;
const B = `255,0,0,`;

const HIGHEST_POSSIBLE_SPM = 350;
const LOWEST_POSSIBLE_SPM = 80;

export const TRUE_LOW_LIMIT = store.createStore(0);
export const TRUE_HIGH_LIMIT = store.createStore(350);

const normalizeSpeed = (spm: number) => {
    const r = (spm - LOWEST_POSSIBLE_SPM) / (HIGHEST_POSSIBLE_SPM - LOWEST_POSSIBLE_SPM);
    return Math.min(Math.max(0, r), 1);
}

const getBarGradient = (
    lowLimit = 0.15,
    highLimit = 0.75,
    centerAlpha = 0.6,
    edgeSize = 0.2
) => {
    const lowAlpha = lowLimit < edgeSize ? lowLimit / edgeSize : 1;
    const highAlpha = highLimit > 1 - edgeSize ? (1 - highLimit) / edgeSize : 1;

    const p = (x: number) => x * 100 + "%";
    const r = ([rgb, a, stop]: [string, string | number, number]) =>
        `rgba(${rgb}${a}) ${p(stop)}`;

    type GradientStop = [string, string | number, number];

    const gradients: GradientStop[] = [];

    if (lowLimit === 0) {
        gradients.push([A, 0, 0], [A, centerAlpha, edgeSize]);
    } else if (lowLimit < edgeSize) {
        gradients.push(
            [B, 0, 0],
            [B, lowAlpha, lowLimit],
            [A, lowAlpha, lowLimit],
            [A, centerAlpha, edgeSize]
        );
    } else {
        gradients.push(
            [B, 0, 0],
            [B, centerAlpha, edgeSize],
            [B, centerAlpha, lowLimit],
            [A, centerAlpha, lowLimit]
        );
    }

    if (highLimit === 1) {
        gradients.push([A, centerAlpha, 1 - edgeSize], [A, 0, 1]);
    } else if (1 - highLimit < edgeSize) {
        gradients.push(
            [A, centerAlpha, 1 - edgeSize],
            [A, highAlpha, highLimit],
            [B, highAlpha, highLimit],
            [B, 0, 1]
        );
    } else {
        gradients.push(
            [A, centerAlpha, highLimit],
            [B, centerAlpha, highLimit],
            [B, centerAlpha, 1 - edgeSize],
            [B, 0, 1]
        );
    }

    const gradientString = `linear-gradient(0deg, ${gradients.map(r).join(",")})`;

    return `background: ${gradientString};`;
};

const getBarStyle = (lowLimit = 0.15, highLimit = 0.75, spm: number) => {
    const isB = spm < lowLimit || spm > highLimit;

    return `
  top: ${(1 - spm) * 100}%;
  background-color: rgba(${isB ? B : A}0.8);
  box-shadow: 0 0 8px rgba(${isB ? B : A}1);
  border: 1px solid rgba(${isB ? B : A}1);`;
};

const formatTime = (_x: number) => {
    const x = Math.floor(_x);
    const minutes = Math.floor(x / (60 * 1000));
    const seconds = Math.floor(x % (60 * 1000) / 1000);
    return `${minutes.toString().padStart(3, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const $bar = document.querySelector(".right-panel .bar") as HTMLDivElement;
const $val = document.querySelector(".right-panel .current-value") as HTMLDivElement;

const updateBar = (spm: number) => {
    const lowLimit = normalizeSpeed(TRUE_LOW_LIMIT.value);
    const highLimit = normalizeSpeed(TRUE_HIGH_LIMIT.value);
    const _spm = normalizeSpeed(spm);

    $bar.setAttribute("style", getBarGradient(lowLimit, highLimit));
    $val.setAttribute("style", getBarStyle(lowLimit, highLimit, _spm));
};

const parseInt = (x: string | null | undefined) => {
    if (x === null) return 0;
    if (x === undefined) return 0;

    const number = Number.parseFloat(x);

    if (Number.isNaN(number)) return 0;

    return Math.floor(number);
}

export const spmStat = new SpmStatPainter(60 * 2);

export const RunStatManager = () => {
    let logicStartTime = 0;
    let acturalStartTime = 0;
    let lastStepsCount = 0;

    const $time = document.querySelector('.time-value');
    if (!$time) throw new Error('Time element not found');

    const $steps = document.querySelector('.steps-value');
    if (!$steps) throw new Error('Steps element not found');

    const $spm = document.querySelector('.spm-value');
    if (!$spm) throw new Error('SPM element not found');

    const $type = document.querySelector('.type-value');

    const rateEstimator = new RateEstimator();
    const strideRateFilter = new LowPassFilter(0.2);

    const [updateLow] = useLerp(
        () => TRUE_LOW_LIMIT.value,
        (x) => {
            TRUE_LOW_LIMIT.value = x;
        },
        0.005,
    );

    const [updateHigh] = useLerp(
        () => TRUE_HIGH_LIMIT.value,
        (x) => {
            TRUE_HIGH_LIMIT.value = x;
        },
        0.005,
    );

    LOW_LIMIT.subscribe(updateLow);
    HIGH_LIMIT.subscribe(updateHigh);

    let lastSyncTime = 0;
    const tick = () => {
        const deltaTime = isInfiniteMode() ? (Date.now() - logicStartTime) : timeLine.timeLeft;
        $time.textContent = formatTime(deltaTime);
        const spm = strideRateFilter.filter(rateEstimator.estimateRate());
        $spm.textContent = Math.floor(spm).toString().padStart(3, '0');
        SPM.value = spm;
        spmStat.addData(spm);
        updateBar(spm);
    }

    ROUTER_ID.subscribe((id) => {
        if (id.includes('/single/play/')) {
            rateEstimator.reset();
            p1.reset();
            acturalStartTime = Date.now();
            logicStartTime = Date.now();

            LOW_LIMIT.reset(true);
            HIGH_LIMIT.reset(true);
            TRUE_LOW_LIMIT.reset(true);
            TRUE_HIGH_LIMIT.reset(true);
            spmStat.reset();

            if (id === '/single/play/infinite') {
                p1.stepCount = parseInt(localStorage.getItem(INFINITE_STEP_KEY));
                $steps.textContent = p1.stepCount.toString().padStart(4, '0');
                logicStartTime = Date.now() - parseInt(localStorage.getItem(INFINITE_TIME_KEY));
                lastStepsCount = p1.stepCount;
            }

            timeManager.addFn(tick, FrameRateLevel.D3);
        } else {
            timeManager.removeFn(tick);
        }
    });

    eventTarget.addEventListener(STEP_EVENT, ({ detail: { magnitude, total, strideRate, type } }) => {
        if (!ROUTER_ID.value.includes('/single/play/')) return;

        rateEstimator.record();
        $steps.textContent = total.toString().padStart(4, '0');

        if ($type) {
            $type.textContent = type;
        }

        if (isInfiniteMode() && Date.now() - lastSyncTime > 600) {
            const deltaTime = Date.now() - logicStartTime;
            localStorage.setItem(INFINITE_TIME_KEY, deltaTime.toString());
            localStorage.setItem(INFINITE_STEP_KEY, p1.stepCount.toString());
            lastSyncTime = Date.now();
        }
    });

    const $finishTraining = document.querySelector('.finish-training');
    const $spmStat = document.querySelector('.spm-stat');
    const $statChartBackButton = document.querySelector('.stat-chart-back');

    if (!$finishTraining) {
        throw new Error('Training not finished');
    }
    if (!$spmStat) {
        throw new Error('Spm stat not finished');
    }
    if (!$statChartBackButton) {
        throw new Error('statChartBackButton not finished');
    }


    let lineChartProgress = 0;

    const $finalSteps = document.querySelector('.spm-stat .steps-value');
    const $finalTime = document.querySelector('.spm-stat .time-value');
    const $finalSpm = document.querySelector('.spm-stat .spm-value');

    if (!$finalSteps) throw new Error(`Final steps element not found`);
    if (!$finalTime) throw new Error(`Final time element not found`);
    if (!$finalSpm) throw new Error(`Final SPM element not found`);

    let finalSteps = 0;
    let finalTime = 0;
    let finalSpm = 0;

    const [updateLineChartProgress] = useLerp(
        () => lineChartProgress,
        (x) => {
            lineChartProgress = x;
            spmStat.draw(x);

            $finalSteps.textContent = Math.floor(finalSteps * x).toString().padStart(4, '0');
            $finalTime.textContent = formatTime(finalTime * x);
            $finalSpm.textContent = Math.floor(finalSpm * x).toString().padStart(4, '0');
        },
        0.03,
        1e-2,
    );

    $finishTraining.addEventListener('click', () => {
        spmStat.close();
        updateLineChartProgress(0, true);
        spmStat.resizeToParent();
        $spmStat.classList.add('shown');
        window.setTimeout(() => {
            updateLineChartProgress(1);
        }, 100);

        finalSteps = Math.floor(p1.stepCount - lastStepsCount);
        finalTime = Date.now() - acturalStartTime;
        finalSpm = spmStat.getAverageValue();
    });
    
    $statChartBackButton.addEventListener('click', () => {
        $spmStat.classList.remove('shown');
    });
}