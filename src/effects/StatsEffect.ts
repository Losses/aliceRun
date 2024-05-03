import Stats from 'stats.js';

const RAW_ACC_COLOR_A = '#673AB7';
const RAW_ACC_COLOR_D = '#10091d';
const FILTERED_ACC_COLOR_A = '#009688';
const FILTERED_ACC_COLOR_D = '#000d0b';
const RAW_MAGNITUDE_COLOR_A = '#8BC34A';
const RAW_MAGNITUDE_COLOR_D = '#161f0b';

export const stats = new Stats();
stats.showPanel(0);

export const filteredMagnitude = stats.addPanel(new Stats.Panel('Magnitude', FILTERED_ACC_COLOR_A, FILTERED_ACC_COLOR_D));

function animate() {
    stats.end();
    stats.begin();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

document.body.appendChild(stats.dom);