import { Event } from '@web-media/event-target';

import { PLAY_SOUND } from './AudioManager';
import { eventTarget } from './EventManager';

import { StepCounter } from '../utils/StepCounter';
import { P1_JOYCON, P2_JOYCON } from '../stores/connection';
import { connectToNintendoSwitchJoycon, CONNECTED_JOY_CON } from '../utils/joyCon/nintendoSwitch/connect';
import { type JoyConLeft, type JoyConRight, type IPacket, type JoyCon } from '../utils/joyCon/nintendoSwitch/JoyCon';
import { timeManager } from './TimeManager';

export const p1 = new StepCounter(); // Create an instance of StepCounter

const handleP1HidInput = (event: CustomEvent<IPacket>) => {
    // Process the packet with our step counter
    p1.processPacket(event.detail);
};

export const JoyConManager = () => {
    const $connectJoyconScreen = document.querySelector('.connect_section');
    const $connectedContent = document.querySelector('.connected');
    const $reconnect = document.querySelector('.reconnect');

    if (!$connectJoyconScreen) {
        throw new Error('Connect section not found');
    }

    if (!$connectedContent) {
        throw new Error('Connected section not found');
    }

    if (!$reconnect) {
        throw new Error('Reconnect section not found');
    }

    document
        .querySelector('.connect_bt')
        ?.addEventListener('click', async () => {
            if (P1_JOYCON.value) return;

            const joyCon = await connectToNintendoSwitchJoycon();

            if (!joyCon) return;

            P1_JOYCON.value = joyCon;

            $connectJoyconScreen.classList.add('hidden');
            $connectedContent.classList.remove('hidden');

            joyCon.addEventListener('hidinput', handleP1HidInput as unknown as EventListener);
        });

    window.setInterval(() => {
        CONNECTED_JOY_CON.forEach(async (joyCon) => {
            await joyCon.open();
            await joyCon.enableStandardFullMode();
            await joyCon.enableIMUMode();
            await joyCon.enableVibration();
        });
    }, 2000);

    const onDisconnect = (event: HIDConnectionEvent) => {
        if (event.device === P1_JOYCON.value?.device) {
            P1_JOYCON.value.removeEventListener('hidinput', handleP1HidInput as EventListenerOrEventListenerObject);
            P1_JOYCON.value = null;
        }

        if (event.device === P2_JOYCON.value?.device) {
            P2_JOYCON.value = null;
        }
    }

    const waitForP1 = async (): Promise<void> => {
        const joyCon = await connectToNintendoSwitchJoycon();
        if (!joyCon) return;
        
        P1_JOYCON.value = joyCon;
        
        $reconnect.classList.add('hidden');
        joyCon.addEventListener('hidinput', handleP1HidInput as unknown as EventListener);
        timeManager.play();
    }

    $reconnect.addEventListener('click', waitForP1);
    
    P1_JOYCON.subscribe(async (x) => {
        if (x) return;
        
        timeManager.pause();
        eventTarget.dispatchEvent(new Event(PLAY_SOUND, 'disconnect.m4a'));
        $reconnect.classList.remove('hidden');
        waitForP1();
    });

    // @ts-ignore
    window.disconnect = () => {
        $reconnect.classList.remove('hidden');
        
        eventTarget.dispatchEvent(new Event(PLAY_SOUND, 'disconnect.m4a'));
        waitForP1();
    }

    navigator.hid.addEventListener('disconnect', onDisconnect);
};