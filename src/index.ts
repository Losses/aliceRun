import { JoyConManager } from './manager/JoyConManager';
import { GroundManager } from './manager/GroundManager2';
import { initializeThreeCanvas } from "./initializeThreeCanvas";
import { timeManager } from './manager/TimeManager';
import { FrameRateLevel } from './utils/TimeMagic';
import { eventTarget } from './manager/EventManager';
import { STEP_EVENT } from './utils/StepCounter';
import { GrassManager } from './manager/GrassManager';
import { DebugManager } from './manager/DebugManager';
import { GroundObjectManager } from './manager/GroundObjectManager';
import { RouterManager } from './manager/RouterManager';

const config = initializeThreeCanvas(
  document.querySelector("#app") as HTMLDivElement
);

RouterManager();
DebugManager(config.camera, config.scene, config.tracker);
GroundManager(config.camera, config.scene, config.tracker);
GrassManager(config.camera, config.scene, config.tracker);
GroundObjectManager(config.camera, config.scene, config.tracker, config.renderer);

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