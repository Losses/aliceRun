import { store } from '../manager/DataManager';

export const ROUTER_ID = store.createStore('/');
export const QUERY_PARAMETER = store.createStore(new URLSearchParams());
