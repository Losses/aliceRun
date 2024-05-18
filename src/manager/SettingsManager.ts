import { QUERY_PARAMETER, ROUTER_ID } from '../stores/router';
import {
   DIFFICULTY,
   RENDERING_DETAIL,
   RENDERING_PIXELATED,
   P1_SENSITIVITY,
   VISUAL_LOAD,
   P2_SENSITIVITY,
   P1_BOT_MODE_ENABLED,
   P2_BOT_MODE_ENABLED,
} from '../stores/settings';
import { isP1 } from '../utils/isP1';
import { p1, p2 } from './JoyConManager';

export const SettingsManager = () => {
   const $visualLoad = document.querySelector(
      '.visual-load',
   ) as HTMLInputElement | null;

   if (!$visualLoad) return;

   $visualLoad.value = VISUAL_LOAD.value.toString();

   $visualLoad.addEventListener('change', (event: Event) => {
      const value = Number.parseFloat((event.target as HTMLInputElement).value);
      VISUAL_LOAD.value = value;
   });

   const $renderingDetail = document.querySelector(
      '.rendering-detail',
   ) as HTMLInputElement | null;

   if (!$renderingDetail) return;

   $renderingDetail.value = RENDERING_DETAIL.value.toString();

   $renderingDetail.addEventListener('change', (event: Event) => {
      const value = Number.parseFloat((event.target as HTMLInputElement).value);
      RENDERING_DETAIL.value = value;
   });

   const $pixelated = document.querySelector(
      '.rendering-pixelated',
   ) as HTMLInputElement | null;

   if (!$pixelated) return;

   $pixelated.checked = RENDERING_PIXELATED.value;

   $pixelated.addEventListener('change', (event: Event) => {
      const value = (event.target as HTMLInputElement).checked;
      RENDERING_PIXELATED.value = value;
   });

   RENDERING_PIXELATED.subscribe((x) => {
      if (x) {
         document.body.classList.add('pixelated');
      } else {
         document.body.classList.remove('pixelated');
      }
   }, true);

   const $joyConSensitivity = document.querySelector(
      '.sensitivity',
   ) as HTMLInputElement | null;

   if (!$joyConSensitivity) return;

   
   $joyConSensitivity.addEventListener('change', (event: Event) => {
      const value = Number.parseFloat((event.target as HTMLInputElement).value);

      if (isP1()) {
         P1_SENSITIVITY.value = value;
      } else {
         P2_SENSITIVITY.value = value;
      }
   });

   const $botModeEnabled = document.querySelector(
      '.bot-mode',
   ) as HTMLInputElement | null;

   if (!$botModeEnabled) return;

   ROUTER_ID.subscribe((x) => {
      if (x !== '/settings/joycon') return;
      
      if (isP1()) {
         $joyConSensitivity.value = P1_SENSITIVITY.value.toString();
         $botModeEnabled.checked = P1_BOT_MODE_ENABLED.value;
      } else {
         $joyConSensitivity.value = P2_SENSITIVITY.value.toString();
         $botModeEnabled.checked = P2_BOT_MODE_ENABLED.value;
      }
   })

   $botModeEnabled.addEventListener('change', (event: Event) => {
      const value = $botModeEnabled.checked;

      if (isP1()) {
         P1_BOT_MODE_ENABLED.value = value;
      } else {
         P2_BOT_MODE_ENABLED.value = value;
      }
   });

   P1_BOT_MODE_ENABLED.subscribe((x) => {
      p1.botMode = x;
      if (x) {
         document.body.classList.add('p1-bot');
      } else {
         document.body.classList.remove('p1-bot');
      }
   });

   P2_BOT_MODE_ENABLED.subscribe((x) => {
      p2.botMode = x;
      if (x) {
         document.body.classList.add('p2-bot');
      } else {
         document.body.classList.remove('p2-bot');
      }
   });

   const $difficulty = document.querySelector(
      '.difficulty',
   ) as HTMLInputElement | null;

   if (!$difficulty) return;

   $difficulty.value = DIFFICULTY.value.toString();

   $difficulty.addEventListener('change', (event: Event) => {
      const value = Number.parseFloat((event.target as HTMLInputElement).value);
      DIFFICULTY.value = value;
   });
};
