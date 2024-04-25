import { JoyConManager } from './manager/JoyConManager';
import { GroundManager } from './manager/GroundManager2';
import { prepareVisualObjects } from "./prepareVisualObjects";
import { initializeThreeCanvas, action } from "./initializeThreeCanvas";
import { timeManager } from './manager/TimeManager';
import { FrameRateLevel } from './utils/TimeMagic';

const config = initializeThreeCanvas(
  document.querySelector("#app") as HTMLDivElement
);

prepareVisualObjects(config.scene, config.tracker);
const { step } = GroundManager(config.camera, config.scene, config.tracker);

// @ts-ignore
window.step = step;

window.requestAnimationFrame(() => {
  timeManager.addFn(() => config.composer.render(), FrameRateLevel.D0);
  timeManager.play();
});


JoyConManager();