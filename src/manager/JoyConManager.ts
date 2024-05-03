import { StepCounter } from '../utils/StepCounter';
import { JOYCON_CONNECTED } from '../stores/connection';
import type { JoyConLeft, JoyConRight, IPacket } from '../utils/joyCon/nintendoSwitch/JoyCon';
import { connectToNintendoSwitchJoycon, CONNECTED_JOY_CON } from '../utils/joyCon/nintendoSwitch/connect';


export const stepCounter = new StepCounter(); // Create an instance of StepCounter

const handleHidInput = (event: Event) => {
    const customEvent = event as CustomEvent<IPacket>;

    // Process the packet with our step counter
    stepCounter.processPacket(customEvent.detail);
};

export const JoyConManager = () => {
    document
        .querySelector('.connect_bt')
        ?.addEventListener('click', async () => {
            if (JOYCON_CONNECTED.value) {
                return;
            }

            await connectToNintendoSwitchJoycon();

            const joyCon = [...CONNECTED_JOY_CON.values()][0] as unknown as JoyConLeft | JoyConRight;

            if (joyCon) {
                JOYCON_CONNECTED.value = true;
            }

            window.setInterval(async () => {
                await joyCon.open();
                await joyCon.enableStandardFullMode();
                await joyCon.enableIMUMode();
                await joyCon.enableVibration();
            }, 2000);

            joyCon.addEventListener('hidinput', handleHidInput as unknown as EventListener);
        });

    const $connectJoyconScreen = document.querySelector('.connect_section');
    const $connectedContent = document.querySelector('.connected');

    JOYCON_CONNECTED.subscribe((x) => {
        if (!$connectJoyconScreen) {
            throw new Error('Connect section not found');
        }

        if (!$connectedContent) {
            throw new Error('Connected section not found');
        }

        if (x) {
            $connectJoyconScreen.classList.add('hidden');
            $connectedContent.classList.remove('hidden');
        } else {
            $connectJoyconScreen.classList.remove('hidden');
            $connectedContent.classList.add('hidden');
        }
    });
};