import { JoyConManager } from './manager/JoyConManager';
import { GroundManager } from './manager/GroundManager2';
import { initializeThreeCanvas } from "./initializeThreeCanvas";
import { timeManager } from './manager/TimeManager';
import { FrameRateLevel } from './utils/TimeMagic';
import { GrassManager } from './manager/GrassManager';
import { DebugManager } from './manager/DebugManager';
import { GroundObjectManager } from './manager/GroundObjectManager';
import { RouterManager } from './manager/RouterManager';
import { DiagnosisManager } from './manager/DiagnosisManager';
import { SettingsManager } from './manager/SettingsManager';
import { AudioManager } from './manager/AudioManager';
import { RunStatManager } from './manager/RunStatManager';
import { ColorManager } from './manager/ColorManager';
import { StoryManager } from './manager/StoryManager';
import { HpManager } from './manager/HpManager';
import { SkyBoxManager } from './manager/SkyBoxManager';

import './utils/setRandomInterval';

const config = initializeThreeCanvas(
  document.querySelector("#app") as HTMLDivElement
);

RouterManager();
DiagnosisManager();
SettingsManager();
AudioManager();
ColorManager();
StoryManager();
RunStatManager();
HpManager(config.effects);
DebugManager(config.camera, config.scene, config.tracker);
GroundManager(config.camera, config.scene, config.tracker);
GrassManager(config.camera, config.scene, config.tracker);
SkyBoxManager(config.camera, config.scene, config.tracker);
GroundObjectManager(config.camera, config.scene, config.tracker, config.renderer);

window.requestAnimationFrame(() => {
  timeManager.addFn(() => config.composer.render(), FrameRateLevel.D0);
  timeManager.play();
});

JoyConManager();