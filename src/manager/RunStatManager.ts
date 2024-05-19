import { P2_JOYCON } from '../stores/connection';
import {
   QUERY_PARAMETER,
   ROUTER_ID,
   isInfinite,
   isMultiple,
   isSingle,
} from '../stores/router';
import { HIGH_LIMIT, LOW_LIMIT, P1_SPM, P2_SPM } from '../stores/runStat';
import { LowPassFilter } from '../utils/LowPassFilter';
import { RateEstimator } from '../utils/RateEstimator';
import { SpmStatPainter } from '../utils/SpmStatPainter';
import { STEP_EVENT } from '../utils/StepCounter';
import { FrameRateLevel } from '../utils/TimeMagic';
import { forceSelect } from '../utils/forceSelect';
import { useLerp } from '../utils/lerp';
import { MULTIPLE_PLAYER_COLOR_PROGRESS, THEME_ID } from './ColorManager';
import { store } from './DataManager';
import { p1, p2 } from './JoyConManager';
import { timeLine } from './StoryManager';
import { timeManager } from './TimeManager';

export const INFINITE_TIME_KEY = 'alice-run-inf-time';
export const INFINITE_STEP_KEY = 'alice-run-inf-step';

const A = '255,255,255,';
const B = '255,0,0,';

const HIGHEST_POSSIBLE_SPM = 350;
const LOWEST_POSSIBLE_SPM = 80;

export const SMOOTHED_LOW_LIMIT = store.createStore(0, false);
export const SMOOTHED_HIGH_LIMIT = store.createStore(350);

const normalizeSpeed = (spm: number) => {
   const r =
      (spm - LOWEST_POSSIBLE_SPM) /
      (HIGHEST_POSSIBLE_SPM - LOWEST_POSSIBLE_SPM);
   return Math.min(Math.max(0, r), 1);
};

const getBarGradient = (
   lowLimit = 0.15,
   highLimit = 0.75,
   centerAlpha = 0.6,
   edgeSize = 0.2,
) => {
   const lowAlpha = lowLimit < edgeSize ? lowLimit / edgeSize : 1;
   const highAlpha = highLimit > 1 - edgeSize ? (1 - highLimit) / edgeSize : 1;

   const p = (x: number) => `${x * 100}%`;
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
         [A, centerAlpha, edgeSize],
      );
   } else {
      gradients.push(
         [B, 0, 0],
         [B, centerAlpha, edgeSize],
         [B, centerAlpha, lowLimit],
         [A, centerAlpha, lowLimit],
      );
   }

   if (highLimit === 1) {
      gradients.push([A, centerAlpha, 1 - edgeSize], [A, 0, 1]);
   } else if (1 - highLimit < edgeSize) {
      gradients.push(
         [A, centerAlpha, 1 - edgeSize],
         [A, highAlpha, highLimit],
         [B, highAlpha, highLimit],
         [B, 0, 1],
      );
   } else {
      gradients.push(
         [A, centerAlpha, highLimit],
         [B, centerAlpha, highLimit],
         [B, centerAlpha, 1 - edgeSize],
         [B, 0, 1],
      );
   }

   const gradientString = `linear-gradient(0deg, ${gradients
      .map(r)
      .join(',')})`;

   return `background: ${gradientString};`;
};

const getBarStyle = (lowLimit = 0.15, highLimit = 0.75, spm = 0) => {
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
   const seconds = Math.floor((x % (60 * 1000)) / 1000);
   return `${minutes.toString().padStart(3, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
};

const formatNumber = (x: number, n: number) => {
   return Math.floor(x).toString().padStart(n, '0');
};

const $bar = document.querySelector('.right-panel .bar') as HTMLDivElement;
const $val = document.querySelector(
   '.right-panel .current-value',
) as HTMLDivElement;

const updateBar = (spm: number) => {
   const lowLimit = normalizeSpeed(SMOOTHED_LOW_LIMIT.value);
   const highLimit = normalizeSpeed(SMOOTHED_HIGH_LIMIT.value);
   const _spm = normalizeSpeed(spm);

   $bar.setAttribute('style', getBarGradient(lowLimit, highLimit));
   $val.setAttribute('style', getBarStyle(lowLimit, highLimit, _spm));
};

const safeParseInt = (x: string | null | undefined) => {
   if (x === null) return 0;
   if (x === undefined) return 0;

   const number = Number.parseFloat(x);

   if (Number.isNaN(number)) return 0;

   return Math.floor(number);
};

export const p1SpmStat = new SpmStatPainter(60 * 2, 'spm-chart-p1');
export const p2SpmStat = new SpmStatPainter(
   60 * 2,
   'spm-chart-p2',
   '244, 67, 54',
);

export const RunStatManager = () => {
   let logicStartTime = 0;
   let acturalStartTime = 0;
   let lastStepsCount = 0;
   let stopTiming = false;

   const $time = forceSelect<HTMLDivElement>('.stat .time-value');
   const $p1Steps = forceSelect<HTMLDivElement>('.stat .p1.steps-value');
   const $p1Spm = forceSelect<HTMLDivElement>('.stat .p1.spm-value');
   const $p2Steps = forceSelect<HTMLDivElement>('.stat .p2.steps-value');
   const $p2Spm = forceSelect<HTMLDivElement>('.stat .p2.spm-value');
   const $type = forceSelect<HTMLDivElement>('.stat .type-value');

   const p1RateEstimator = new RateEstimator();
   const p1StrideRateFilter = new LowPassFilter(0.2);
   const p2RateEstimator = new RateEstimator();
   const p2StrideRateFilter = new LowPassFilter(0.2);

   const [updateLow,,stopSmoothLow] = useLerp(
      () => SMOOTHED_LOW_LIMIT.value,
      (x) => {
         SMOOTHED_LOW_LIMIT.value = x;
      },
      0.005
   );

   const [updateHigh] = useLerp(
      () => SMOOTHED_HIGH_LIMIT.value,
      (x) => {
         SMOOTHED_HIGH_LIMIT.value = x;
      },
      0.005,
   );

   LOW_LIMIT.subscribe(updateLow);
   HIGH_LIMIT.subscribe(updateHigh);

   let lastSyncTime = 0;

   const tickSystem = () => {
      const deltaTime =
         isInfinite() || isMultiple()
            ? Date.now() - logicStartTime
            : timeLine.timeLeft;

      if (!stopTiming) {
         $time.textContent = formatTime(deltaTime);
      }

      updateBar(P1_SPM.value);
   };

   const tickP1 = () => {
      const p1Spm = p1StrideRateFilter.filter(p1RateEstimator.estimateRate());
      $p1Spm.textContent = formatNumber(p1Spm, 3);
      P1_SPM.value = p1Spm;
      p1SpmStat.addData(p1Spm);
   };

   const tickP2 = () => {
      if (!P2_JOYCON.value && !p2.botMode) return;

      const p2Spm = p2StrideRateFilter.filter(p2RateEstimator.estimateRate());
      $p2Spm.textContent = formatNumber(p2Spm, 3);
      P2_SPM.value = p2Spm;
      p2SpmStat.addData(p2Spm);
      MULTIPLE_PLAYER_COLOR_PROGRESS.value = Math.max(
         0,
         Math.min((p2Spm - 180) / (320 - 180), 1),
      );

      if (!isMultiple()) return;
      LOW_LIMIT.value = P2_SPM.value;
   };

   ROUTER_ID.subscribe(() => {
      if (isSingle() || isMultiple()) {
         p1RateEstimator.reset();
         p1.reset();
         acturalStartTime = Date.now();
         logicStartTime = Date.now();
         stopTiming = false;

         LOW_LIMIT.reset(true);
         HIGH_LIMIT.reset(true);
         SMOOTHED_LOW_LIMIT.reset(true);
         SMOOTHED_HIGH_LIMIT.reset(true);
         p1SpmStat.reset();

         timeManager.addFn(tickSystem, FrameRateLevel.D3);
         timeManager.addFn(tickP1, FrameRateLevel.D3);
      } else {
         timeManager.removeFn(tickSystem);
      }

      if (isSingle()) {
         THEME_ID.value = 'clear';
         timeManager.removeFn(tickP2);
      }

      if (isMultiple()) {
         p2RateEstimator.reset();
         p2.reset();
         p2SpmStat.reset();
         timeManager.addFn(tickP2, FrameRateLevel.D3);
      }

      // `!isSingle()` means we can cover the case when user is in menu router.
      if (!isSingle() && !isMultiple()) {
         timeManager.addFn(tickP2, FrameRateLevel.D3);
         timeManager.removeFn(tickP1);
         stopSmoothLow();
      }

      if (isInfinite()) {
         p1.stepCount = safeParseInt(localStorage.getItem(INFINITE_STEP_KEY));
         $p1Steps.textContent = formatNumber(p1.stepCount, 4);
         logicStartTime =
            Date.now() - safeParseInt(localStorage.getItem(INFINITE_TIME_KEY));
         lastStepsCount = p1.stepCount;
      }
   }, true);

   p1.addEventListener(STEP_EVENT, ({ detail: { total, type } }) => {
      if (!isSingle() && !isMultiple()) return;

      p1RateEstimator.record();
      $p1Steps.textContent = formatNumber(total, 4);

      if ($type) {
         $type.textContent = type;
      }

      if (isInfinite() && Date.now() - lastSyncTime > 600) {
         const deltaTime = Date.now() - logicStartTime;
         localStorage.setItem(INFINITE_TIME_KEY, deltaTime.toString());
         localStorage.setItem(INFINITE_STEP_KEY, p1.stepCount.toString());
         lastSyncTime = Date.now();
      }
   });

   p2.addEventListener(STEP_EVENT, ({ detail: { total } }) => {
      p2RateEstimator.record();

      if (!isMultiple()) return;
      $p2Steps.textContent = formatNumber(total, 4);
   });

   const $finishTraining = forceSelect<HTMLDivElement>('.finish-training');
   const $spmStat = forceSelect<HTMLDivElement>('.spm-stat');
   const $statChartBackButton = forceSelect<HTMLDivElement>('.stat-chart-back');

   let lineChartProgress = 0;

   const $p1FinalSteps = forceSelect<HTMLDivElement>(
      '.spm-stat .p1.steps-value',
   );
   const $p1FinalTime = forceSelect<HTMLDivElement>('.spm-stat .time-value');
   const $p1FinalSpm = forceSelect<HTMLDivElement>('.spm-stat .p1.spm-value');
   const $p2FinalSteps = forceSelect<HTMLDivElement>(
      '.spm-stat .p2.steps-value',
   );
   const $p2FinalSpm = forceSelect<HTMLDivElement>('.spm-stat .p2.spm-value');

   let p1FinalSteps = 0;
   let p1FinalTime = 0;
   let p1FinalSpm = 0;
   let p2FinalSteps = 0;
   let p2FinalSpm = 0;

   const [updateLineChartProgress] = useLerp(
      () => lineChartProgress,
      (x) => {
         const m = isMultiple();

         lineChartProgress = x;
         p1SpmStat.draw(x);

         if (m) {
            p2SpmStat.draw(x);
         }

         $p1FinalSteps.textContent = formatNumber(p1FinalSteps * x, 4);
         $p1FinalTime.textContent = formatTime(p1FinalTime * x);
         $p1FinalSpm.textContent = formatNumber(p1FinalSpm * x, 4);

         if (m) {
            $p2FinalSteps.textContent = formatNumber(p2FinalSteps * x, 4);
            $p2FinalSpm.textContent = formatNumber(p2FinalSpm * x, 4);
         }
      },
      0.03,
      1e-3,
   );

   $finishTraining.addEventListener('click', () => {
      stopTiming = true;
      p1SpmStat.close();
      updateLineChartProgress(0, true);
      p1SpmStat.resizeToParent();
      $spmStat.classList.add('shown');
      window.setTimeout(() => {
         updateLineChartProgress(1);
      }, 100);

      p1FinalSteps = Math.floor(p1.stepCount - lastStepsCount);
      p1FinalTime = Date.now() - acturalStartTime;
      p1FinalSpm = p1SpmStat.getAverageValue();

      if (isMultiple()) {
         p2SpmStat.close();
         p2FinalSteps = Math.floor(p2.stepCount - lastStepsCount);
         p2FinalSpm = p2SpmStat.getAverageValue();
         p2SpmStat.resizeToParent();
      }
   });

   $statChartBackButton.addEventListener('click', () => {
      $spmStat.classList.remove('shown');
   });
};
