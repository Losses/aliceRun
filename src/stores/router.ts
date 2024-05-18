import { store } from '../manager/DataManager';

export const ROUTER_ID = store.createStore('/');
export const QUERY_PARAMETER = store.createStore(new URLSearchParams());

export const isSingle = () => {
    return ROUTER_ID.value === '/play' && QUERY_PARAMETER.value.get('mode') === 'single';
}

export const isMultiple = () => {
    return ROUTER_ID.value === '/play' && QUERY_PARAMETER.value.get('mode') === 'multiple';
}

export const isInfinite = () => {
    return isSingle() && QUERY_PARAMETER.value.get('mode1') === 'infinite';
}

export const isStory = () => {
    return isSingle() && QUERY_PARAMETER.value.get('mode1') === 'story';
}