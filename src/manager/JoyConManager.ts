import { StepCounter } from '../utils/StepCounter';
import { WindowedArray } from '../utils/WindowedArray';
import type { JoyConLeft, JoyConRight, IPacket } from '../utils/joyCon/nintendoSwitch/JoyCon';
import { connectToNintendoSwitchJoycon, CONNECTED_JOY_CON } from '../utils/joyCon/nintendoSwitch/connect';

let connected = false;

const WINDOW_SIZE = 2 * 60; // 2 seconds at 60 Hz

const accelerometerY = new WindowedArray(WINDOW_SIZE);
const orientationY = new WindowedArray(WINDOW_SIZE);

const stepCounter = new StepCounter(); // Create an instance of StepCounter

const handleHidInput = (event: Event) => {
  const customEvent = event as CustomEvent<IPacket>;
  const { detail: { actualAccelerometer, actualOrientation } } = customEvent;

  if (!actualAccelerometer || !actualOrientation) {
      return;
  }

  accelerometerY.push(actualAccelerometer.y);
  orientationY.push(Number.parseFloat(actualOrientation.beta));

  // Process the packet with our step counter
  stepCounter.processPacket(customEvent.detail);
};

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
};