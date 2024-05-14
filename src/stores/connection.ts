import { store } from '../manager/DataManager';
import type {
   JoyConLeft,
   JoyConRight,
} from '../utils/joyCon/nintendoSwitch/JoyCon';

export const P1_JOYCON = store.createStore<JoyConLeft | JoyConRight | null>(
   null,
);
export const P2_JOYCON = store.createStore<JoyConLeft | JoyConRight | null>(
   null,
);
