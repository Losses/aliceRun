import { Event } from '@web-media/event-target';

import { PLAY_SOUND } from './AudioManager';
import { eventTarget } from './EventManager';

import { StepCounter } from '../utils/StepCounter';
import type { IPacket } from '../utils/joyCon/nintendoSwitch/JoyCon';
import { P1_JOYCON, P2_JOYCON } from '../stores/connection';
import {
   CONNECTED_JOY_CON,
   connectToNintendoSwitchJoycon,
} from '../utils/joyCon/nintendoSwitch/connect';
import { timeManager } from './TimeManager';
import { P1_BOT_MODE_ENABLED, P2_BOT_MODE_ENABLED } from '../stores/settings';
import { isP1 } from '../utils/isP1';
import { forceSelect } from '../utils/forceSelect';

export const p1 = new StepCounter();
export const p2 = new StepCounter();

type HIDPacketHandler = (event: CustomEvent<IPacket>) => void;

const HandleJoyConInput = (p: StepCounter) => (event: CustomEvent<IPacket>) => {
   // Process the packet with our step counter
   p.processPacket(event.detail);
};

const handleP1HidInput = HandleJoyConInput(p1);
const handleP2HidInput = HandleJoyConInput(p2);

const HandleConnectButtonContextMenu = (P: typeof P1_BOT_MODE_ENABLED | typeof P2_BOT_MODE_ENABLED) => (x: MouseEvent) => {
   x.preventDefault();
   P.value = !P.value;
}

const handleP1ConnectButtonContextMenu = HandleConnectButtonContextMenu(P1_BOT_MODE_ENABLED);
const handleP2ConnectButtonContextMenu = HandleConnectButtonContextMenu(P2_BOT_MODE_ENABLED);

const ConnectJoyCon =
   (store: typeof P1_JOYCON | typeof P2_JOYCON, handler: HIDPacketHandler) =>
   async () => {
      if (store.value) {
         store.value.removeEventListener(
            'hidinput',
            handler as unknown as EventListener,
         );
      }

      const joyCon = await connectToNintendoSwitchJoycon();

      if (!joyCon) return;

      store.value = joyCon;

      joyCon.addEventListener('hidinput', handler as unknown as EventListener);
   };

const connectP1 = ConnectJoyCon(P1_JOYCON, handleP1HidInput);
const connectP2 = ConnectJoyCon(P2_JOYCON, handleP2HidInput);

export const JoyConManager = () => {
   const $connectJoyconScreen = forceSelect<HTMLDivElement>('.connect_section');
   const $connectedContent = forceSelect<HTMLDivElement>('.connected');
   const $reconnect = forceSelect<HTMLDivElement>('.reconnect');
   const $connectBt = forceSelect<HTMLButtonElement>('.connect_bt');

   $connectBt.addEventListener('click', async () => {
      await connectP1();

      if (!P1_JOYCON.value) return;

      $connectJoyconScreen.classList.add('hidden');
      $connectedContent.classList.remove('hidden');
   });

   $connectBt.addEventListener('contextmenu', (event) => {
      event.preventDefault();

      P1_BOT_MODE_ENABLED.value = true;
      $connectJoyconScreen.classList.add('hidden');
      $connectedContent.classList.remove('hidden');
   });

   window.setInterval(() => {
      CONNECTED_JOY_CON.forEach(async (joyCon) => {
         await joyCon.open();
         await joyCon.enableStandardFullMode();
         await joyCon.enableIMUMode();
         await joyCon.enableVibration();
      });
   }, 1000);

   P1_JOYCON.subscribe(async (x) => {
      if (x) {
         document.body.classList.add('p1-connected');
         return;
      }

      document.body.classList.remove('p1-connected');

      timeManager.pause();
      eventTarget.dispatchEvent(new Event(PLAY_SOUND, 'disconnect.m4a'));
      $reconnect.classList.remove('hidden');
      waitForP1();
   });

   P2_JOYCON.subscribe((x) => {
      if (x) {
         document.body.classList.add('p2-connected');
      } else {
         document.body.classList.remove('p2-connected');
      }
   });

   const onDisconnect = (event: HIDConnectionEvent) => {
      if (event.device === P1_JOYCON.value?.device) {
         P1_JOYCON.value.removeEventListener(
            'hidinput',
            handleP1HidInput as EventListenerOrEventListenerObject,
         );
         P1_JOYCON.value = null;
      }

      if (event.device === P2_JOYCON.value?.device) {
         P2_JOYCON.value.removeEventListener(
            'hidinput',
            handleP2HidInput as EventListenerOrEventListenerObject,
         );
         P2_JOYCON.value = null;
      }
   };

   const waitForP1 = async (): Promise<void> => {
      const joyCon = await connectToNintendoSwitchJoycon();
      if (!joyCon) return;

      P1_JOYCON.value = joyCon;

      $reconnect.classList.add('hidden');
      joyCon.addEventListener(
         'hidinput',
         handleP1HidInput as unknown as EventListener,
      );
      timeManager.play();
   };

   $reconnect.addEventListener('click', waitForP1);

   const $settingsP1 = forceSelect<HTMLButtonElement>('.settings-p1-button');
   const $settingsP2 = forceSelect<HTMLButtonElement>('.settings-p2-button');
   const $connectP2 = forceSelect<HTMLButtonElement>('.connect-p2-button');
   const $changeController = forceSelect<HTMLButtonElement>('.change-controller');

   $settingsP1.addEventListener('contextmenu', handleP1ConnectButtonContextMenu);
   $settingsP2.addEventListener('contextmenu', handleP2ConnectButtonContextMenu);
   $connectP2.addEventListener('contextmenu', handleP2ConnectButtonContextMenu);
   $connectP2.addEventListener('click', connectP2);

   $changeController.addEventListener('click', () => {
      if (isP1()) connectP1();
      else connectP2();
   });

   navigator.hid.addEventListener('disconnect', onDisconnect);
};
