import FFT from 'fft.js';
import { WindowedArray } from '../utils/WindowedArray';
import { connectToNintendoSwitchJoycon, CONNECTED_JOY_CON } from '../utils/joyCon/nintendoSwitch/connect';
import type { JoyConLeft, JoyConRight, IPacket } from '../utils/joyCon/nintendoSwitch/JoyCon';

let connected = false;

const WINDOW_SIZE = 2 * 60;
let lastCalculateDate = Date.now();

const FFT_SIZE = Math.round(
    Math.pow(2, Math.ceil(Math.log2(WINDOW_SIZE)))
);

export const accelerometerY = new WindowedArray(FFT_SIZE);
export const orientationY = new WindowedArray(FFT_SIZE);

const handleHidInput = ({ detail: { actualAccelerometer, actualOrientation, } }: { detail: IPacket }) => {
    if (!actualAccelerometer || !actualOrientation) {
        return;
    }

    accelerometerY.push(actualAccelerometer.y);
    orientationY.push(Number.parseFloat(actualOrientation.beta));

    if (lastCalculateDate + (1000 / 60) * 5 < Date.now()) {
        const fft = new FFT(FFT_SIZE);
        const out: number[] = fft.createComplexArray();
        fft.realTransform(out, orientationY.array);
        // console.log(out.reduce((x, y) => x + y, 0));
        const maxVal = Math.max(...out);
        const maxIndex = out.findIndex((v) => v === maxVal);

        const $freq = document.querySelector('.joycon_freq')!;
        $freq.innerHTML = `Freq: ${maxIndex}, Mang: ${maxVal}`;

        if (maxVal > 400) {
            $freq.classList.add('valid');
        } else {
            $freq.classList.remove('valid');
        }
        lastCalculateDate = Date.now();
    }
};

export const JoyConManager = () => {
    document
        .querySelector('.connect_bt')
        ?.addEventListener('click', async () => {
            if (connected) {
                return;
            }

            await connectToNintendoSwitchJoycon();

            const joyCon = [...CONNECTED_JOY_CON.values()][0] as unknown as JoyConLeft | JoyConRight;

            if (joyCon) {
                connected = true;
            }

            window.setInterval(async () => {
                await joyCon.open();
                await joyCon.enableStandardFullMode();
                await joyCon.enableIMUMode();
                await joyCon.enableVibration();
                // await joyCon.rumble(600, 600, 0.5);
            }, 2000);

            joyCon.addEventListener('hidinput', handleHidInput as unknown as EventListener);
        });
};