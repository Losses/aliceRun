import {
   DIFFICULTY,
   RENDERING_DETAIL,
   RENDERING_PIXELATED,
   SENSITIVITY,
   VISUAL_LOAD,
} from '../stores/settings';

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

   $joyConSensitivity.value = SENSITIVITY.value.toString();

   $joyConSensitivity.addEventListener('change', (event: Event) => {
      const value = Number.parseFloat((event.target as HTMLInputElement).value);
      SENSITIVITY.value = value;
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
