import { QUERY_PARAMETER, ROUTER_ID } from '../stores/router';
import type { Sparkline } from '../utils/Sparkline';
import { FrameRateLevel } from '../utils/TimeMagic';
import { isP1 } from '../utils/isP1';
import { p1, p2 } from './JoyConManager';
import { timeManager } from './TimeManager';

const WAIT_TIME = 5000;

const InsertSparklines = (className: string, $main: Element) => ([key, sparkline]: [string, Sparkline]) => {
   const $container = document.createElement('div');
   $container.classList.add(className);
   $container.classList.add('diagnosis-sparkline-container');
   const $label = document.createElement('span');
   $label.classList.add('label');
   $label.textContent = key;
   $container.appendChild(sparkline.$canvas);
   $container.appendChild($label);

   $main.appendChild($container);
}

export const DiagnosisManager = () => {
   const $main = document.querySelector('.diagnosis-charts');
   if (!$main) return;

   Object.entries(p1.data).forEach(InsertSparklines('diagnosis-p1', $main));
   Object.entries(p2.data).forEach(InsertSparklines('diagnosis-p2', $main));

   ROUTER_ID.subscribe((id) => {
      const routerMatch = id === '/settings/diagnosis-hid';
      
      const p = isP1() ? p1 : p2;

      p.monitoring = routerMatch;

      if (p === p1) {
         $main.classList.add('p1');
         $main.classList.remove('p2');
      } else {
         $main.classList.remove('p1');
         $main.classList.add('p2');         
      }

      if (routerMatch) {
         timeManager.addFn(p.updateSparklines, FrameRateLevel.D0);
      } else {
         timeManager.removeFn(p1.updateSparklines);
         timeManager.removeFn(p2.updateSparklines);
      }
   });

   let startTime = 0;
   let triggeredRecording = false;
   let trueRecording = false;
   const $recordButton = document.querySelector('.start_record');

   const switchRecording = () => {
      trueRecording = false;
      if (!$recordButton) return;
      if (p1.recording) {
         triggeredRecording = false;
         trueRecording = false;
         $recordButton.textContent = 'Record';
         p1.recording = false;
         p1.dumpRecord();
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
            p1.reset();
            p1.recording = true;
            trueRecording = true;
         }
         $recordButton.textContent = 'Stop';
      }

      const recordingTime = diff - WAIT_TIME;

      if (recordingTime > 60 * 1000) {
         return switchRecording();
      }

      const beginAlpha = now % 800 > 400 ? 0.8 : 0.6;
      const endAlpha = now % 800 > 400 ? 0.4 : 0.1;

      const percent = Math.min((recordingTime / (60 * 1000)) * 100, 100);
      $recordButton.setAttribute(
         'style',
         `background: linear-gradient(90deg, rgba(0,0,0,${beginAlpha}) 0%, rgba(0,0,0,${beginAlpha}) ${
            percent - 0.1
         }%, rgba(0,0,0,${endAlpha}) ${percent}%, rgba(0,0,0,${endAlpha}) ${
            percent + 0.1
         }%);`,
      );
   }, FrameRateLevel.D0);
};
