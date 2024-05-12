import { StepCounter } from '../utils/StepCounter';
import { P1_JOYCON, P2_JOYCON } from '../stores/connection';
import { type JoyConLeft, type JoyConRight, type IPacket } from '../utils/joyCon/nintendoSwitch/JoyCon';
import { connectToNintendoSwitchJoycon, CONNECTED_JOY_CON } from '../utils/joyCon/nintendoSwitch/connect';

export interface IConnectedDevices {
    p1: JoyConLeft | JoyConRight | null;
    p2: JoyConLeft | JoyConRight | null;
}

export const p1 = new StepCounter(); // Create an instance of StepCounter

const handleHidInput = (event: Event) => {
    const customEvent = event as CustomEvent<IPacket>;

    // Process the packet with our step counter
    p1.processPacket(customEvent.detail);
};

export const JoyConManager = () => {
    const $connectJoyconScreen = document.querySelector('.connect_section');
    const $connectedContent = document.querySelector('.connected');

    if (!$connectJoyconScreen) {
        throw new Error('Connect section not found');
    }

    if (!$connectedContent) {
        throw new Error('Connected section not found');
    }

    document
        .querySelector('.connect_bt')
        ?.addEventListener('click', async () => {
            if (P1_JOYCON.value) return;

            await connectToNintendoSwitchJoycon();

            const joyCon = [...CONNECTED_JOY_CON.values()][0] as unknown as JoyConLeft | JoyConRight;

            if (!joyCon) return;

            P1_JOYCON.value = joyCon;

            $connectJoyconScreen.classList.add('hidden');
            $connectedContent.classList.remove('hidden');

            window.setInterval(async () => {
                await joyCon.open();
                await joyCon.enableStandardFullMode();
                await joyCon.enableIMUMode();
                await joyCon.enableVibration();
            }, 2000);

            joyCon.addEventListener('hidinput', handleHidInput as unknown as EventListener);
        });

    const onDisconnect = (event: HIDConnectionEvent) => {
        if (event.device === P1_JOYCON.value?.device) {
            P1_JOYCON.value = null;
        }

        if (event.device === P2_JOYCON.value?.device) {
            P2_JOYCON.value = null;
        }
    }

    navigator.hid.addEventListener('disconnect', onDisconnect);
};