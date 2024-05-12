import { store } from "../manager/DataManager";

export const LOW_LIMIT = store.createStore(0);
export const HIGH_LIMIT = store.createStore(350);
export const SPM = store.createStore(0);