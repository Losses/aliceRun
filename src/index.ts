import { JoyConManager } from './manager/JoyConManager';
import { GroundManager } from './manager/GroundManager2';
import { initializeThreeCanvas } from "./initializeThreeCanvas";
import { timeManager } from './manager/TimeManager';
import { FrameRateLevel } from './utils/TimeMagic';
import { eventTarget } from './manager/EventManager';
import { STEP_EVENT } from './utils/StepCounter';
import { GrassManager } from './manager/GrassManager';
import { DebugManager } from './manager/DebugManager';

const config = initializeThreeCanvas(
  document.querySelector("#app") as HTMLDivElement
);

DebugManager(config.camera, config.scene, config.tracker);
GroundManager(config.camera, config.scene, config.tracker, config.renderer);
GrassManager(config.camera, config.scene, config.tracker);

window.requestAnimationFrame(() => {
  timeManager.addFn(() => config.composer.render(), FrameRateLevel.D0);
  timeManager.play();
});

eventTarget.addEventListener(STEP_EVENT, ({detail}) => {
  const $freq = document.querySelector('.joycon_freq');

  if ($freq) {
      $freq.textContent = `Steps: ${detail.total}, Mag: ${detail.magnitude}`;
  }
});


JoyConManager();