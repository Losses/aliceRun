import { initializeThreeCanvas } from './initializeThreeCanvas';
import { AudioManager } from './manager/AudioManager';
import { ColorManager } from './manager/ColorManager';
import { DebugManager } from './manager/DebugManager';
import { DiagnosisManager } from './manager/DiagnosisManager';
import { GrassManager } from './manager/GrassManager';
import { GroundManager } from './manager/GroundManager2';
import { GroundObjectManager } from './manager/GroundObjectManager';
import { HpManager } from './manager/HpManager';
import { JoyConManager } from './manager/JoyConManager';
import { RouterManager } from './manager/RouterManager';
import { RunStatManager } from './manager/RunStatManager';
import { SettingsManager } from './manager/SettingsManager';
import { SkyBoxManager } from './manager/SkyBoxManager';
import { StoryManager } from './manager/StoryManager';
import { timeManager } from './manager/TimeManager';
import { FrameRateLevel } from './utils/TimeMagic';

import './utils/setRandomInterval';

const config = initializeThreeCanvas(
   document.querySelector('#app') as HTMLDivElement,
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
GroundObjectManager(
   config.camera,
   config.scene,
   config.tracker,
   config.renderer,
);

window.requestAnimationFrame(() => {
   timeManager.addFn(() => config.composer.render(), FrameRateLevel.D0);
   timeManager.play();
});

JoyConManager();
