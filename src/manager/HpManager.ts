import { timeManager } from './TimeManager';

import type { Effects } from '../initializeThreeCanvas';
import { P1_JOYCON } from '../stores/connection';
import { HP } from '../stores/hp';
import { ROUTER_ID } from '../stores/router';
import { SPM } from '../stores/runStat';
import { useLerp } from '../utils/lerp';
import { TRUE_HIGH_LIMIT, TRUE_LOW_LIMIT } from './RunStatManager';

export const HpManager = (effects: Effects) => {
   let lastCalculateTime = 0;
   let trueHp = 100;

   const [updateHp] = useLerp(
      () => HP.value,
      (x) => {
         HP.value = x;
      },
   );

   const $hpBar = document.querySelector('.hp-bar');
   const $hpVal = document.querySelector('.hp-bar-val');

   if (!$hpBar) {
      throw new Error(`HP not found`);
   }

   if (!$hpVal) {
      throw new Error(`HP not found`);
   }

   HP.subscribe((x) => {
      if (x === trueHp || trueHp > HP.value) {
         $hpVal.setAttribute(
            'style',
            `width: ${HP.value}%; background: linear-gradient(90deg, rgba(255, 255, 255, 0.0), rgba(255, 255, 255, 0.7))`,
         );
      } else {
         $hpVal.setAttribute(
            'style',
            `width: ${HP.value}%; background: linear-gradient(90deg, rgba(255, 0, 0, 0.0), rgba(255, 0, 0, 0.8))`,
         );
      }
   });

   const tick = (time: number) => {
      if (!lastCalculateTime) {
         lastCalculateTime = time;
         return;
      }

      const effectProgress = Math.min(1, HP.value / 75);
      const effectFactor = 1 - effectProgress;
      const enableEffect = effectFactor > 0;

      effects.filmPass.enabled = enableEffect;
      effects.sepiaPass.enabled = enableEffect;
      effects.vignettePass.enabled = enableEffect;

      effects.sepiaPass.uniforms['amount'].value = Math.min(
         1,
         1 * effectFactor * 2,
      );
      (effects.filmPass.uniforms as { nIntensity: any })['nIntensity'].value =
         0.8 * effectFactor;
      effects.vignettePass.uniforms['offset'].value = 3 * effectFactor;
      effects.vignettePass.uniforms['darkness'].value = 4 * effectFactor;

      if (time - lastCalculateTime > 400) {
         const bleeding =
            SPM.value < TRUE_LOW_LIMIT.value ||
            SPM.value > TRUE_HIGH_LIMIT.value;

         effects.glitchPass.enabled = bleeding;

         if (bleeding) {
            trueHp = Math.max(0, trueHp - 0.5);
            updateHp(trueHp);
            P1_JOYCON.value?.rumble(600, 600, 0.5);
            lastCalculateTime = time;
         } else {
            trueHp = Math.min(100, trueHp + 0.3);
         }
      }
   };

   ROUTER_ID.subscribe((id) => {
      if (!id.includes('/single/play/')) {
         trueHp = 100;
         HP.reset();
         effects.filmPass.enabled = false;
         effects.glitchPass.enabled = false;
         effects.sepiaPass.enabled = false;
         effects.vignettePass.enabled = false;
      }

      if (id === '/single/play/story') {
         timeManager.addFn(tick);
         $hpBar.classList.remove('hidden');
      } else {
         timeManager.removeFn(tick);
         $hpBar.classList.add('hidden');
      }
   }, true);
};
