import { store } from '../manager/DataManager';

export const RENDERING_DETAIL = store.createMemorizedStore(
   1,
   'alice-run-rendering-detail',
);
export const VISUAL_LOAD = store.createMemorizedStore(
   1,
   'alice-run-visual-load',
);

export const P1_SENSITIVITY = store.createMemorizedStore(
   1,
   'alice-run-p1-sensitivity',
);

export const P2_SENSITIVITY = store.createMemorizedStore(
   1,
   'alice-run-p2-sensitivity',
);

export const P1_BOT_MODE_ENABLED = store.createStore(false);

export const P2_BOT_MODE_ENABLED = store.createStore(false);

export const DIFFICULTY = store.createMemorizedStore(0, 'alice-run-difficulty');

export const calculateWindowSize = () => ({
   width: Math.ceil(window.innerWidth * RENDERING_DETAIL.value),
   height: Math.ceil(window.innerHeight * RENDERING_DETAIL.value),
});

export const CANVAS_SIZE = store.createStore(calculateWindowSize());

export const updateCanvasSize = () => {
   CANVAS_SIZE.value = calculateWindowSize();
};

RENDERING_DETAIL.subscribe(updateCanvasSize);

export const RENDERING_PIXELATED = store.createMemorizedStore(
   false,
   'alice-run-pixelated',
);
