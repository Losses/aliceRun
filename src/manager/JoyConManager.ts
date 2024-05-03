import { StepCounter } from '../utils/StepCounter';
import { FrameRateLevel } from '../utils/TimeMagic';
import type { JoyConLeft, JoyConRight, IPacket } from '../utils/joyCon/nintendoSwitch/JoyCon';
import { connectToNintendoSwitchJoycon, CONNECTED_JOY_CON } from '../utils/joyCon/nintendoSwitch/connect';
import { timeManager } from './TimeManager';

let connected = false;

const stepCounter = new StepCounter(); // Create an instance of StepCounter

const handleHidInput = (event: Event) => {
  const customEvent = event as CustomEvent<IPacket>;

  // Process the packet with our step counter
  stepCounter.processPacket(customEvent.detail);
};

//@ts-ignore
window.step = stepCounter.mockStep;

export const JoyConManager = () => {
    document
        .querySelector('.connect_bt')
        ?.addEventListener('click', async () => {
            if (connected) {
                return;
            }

            await connectToNintendoSwitchJoycon();

            const joyCon = [...CONNECTED_JOY_CON.values()][0] as unknown as JoyConLeft | JoyConRight;

            if (joyCon) {
                connected = true;
            }

            window.setInterval(async () => {
                await joyCon.open();
                await joyCon.enableStandardFullMode();
                await joyCon.enableIMUMode();
                await joyCon.enableVibration();
                // await joyCon.rumble(600, 600, 0.5);
            }, 2000);

            joyCon.addEventListener('hidinput', handleHidInput as unknown as EventListener);
        });
    
    let recording = false;
    const $recordButton = document.querySelector('.start_record');

    if ($recordButton) {
        $recordButton.addEventListener('click', () => {
            if (recording) {
                $recordButton.textContent = 'Record';
                recording = false;
                stepCounter.dumpRecord();
                stepCounter.recording = false;
            } else {
                $recordButton.textContent = 'Stop';
                stepCounter.reset();
                recording = true;
                stepCounter.recording = true;
            }
        });
    }

    timeManager.addFn(() => {
        if (recording) {
            stepCounter.tick();
        }
    }, FrameRateLevel.D0);
};