import { timeManager } from "../manager/TimeManager";
import { FrameRateLevel, TickCallback } from "./TimeMagic";

export const useRaf = (fn: TickCallback, frameRateLevel?: FrameRateLevel) => {
    const ticker = timeManager;
  
    const wrappedFn: TickCallback = (...x) => {
      fn(...x);
    };
  
    const play = () => {
      ticker.addFn(wrappedFn, frameRateLevel);
    };
  
    const stop = () => {
      ticker.removeFn(wrappedFn);
    };
  
    return [play, stop] as const;
  };
  
  export const useLerp = (
    getCurrentValFn: () => number,
    updateFn: (x: number) => void,
    damping: number = 0.05,
    threshold: number = 1e-5,
    frameRateLevel: FrameRateLevel = FrameRateLevel.D1
  ) => {
    let targetValue = getCurrentValFn();
    let cachedDamping = damping;
  
    const [startLerp, stopLerp] = useRaf((_, __, ticksElapsed) => {
      const currentValue = getCurrentValFn();
      updateFn(
        currentValue + (targetValue - currentValue) * cachedDamping * ticksElapsed
      );
      if (Math.abs(targetValue - currentValue) < threshold) {
        updateFn(targetValue);
        stopLerp();
      }
    }, frameRateLevel);
  
    const updateValue = (x: number) => {
      if (x === getCurrentValFn()) return;
      targetValue = x;
      startLerp();
    };
  
    const updateDamping = (x: number) => {
      cachedDamping = x;
    };
  
    return [updateValue, startLerp, stopLerp, updateDamping] as const;
  };