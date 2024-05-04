import { ROUTER_ID } from "../stores/router"
import { FrameRateLevel } from "../utils/TimeMagic";
import { stepCounter } from "./JoyConManager";
import { timeManager } from "./TimeManager";

export const DiagnosisManager = () => {
    const $main = document.querySelector('.diagnosis-charts');
    if (!$main) return;

    Object.entries(stepCounter.data).forEach(([key, sparkline]) => {
        const $container = document.createElement('div');
        $container.classList.add('diagnosis-sparkline-container');
        const $label = document.createElement('span');
        $label.classList.add('label');
        $label.textContent = key;
        $container.appendChild(sparkline.$canvas);
        $container.appendChild($label);

        $main.appendChild($container);
    });

    ROUTER_ID.subscribe((id) => {
        const routerMatch = id === '/settings/diagnosis-hid';
        stepCounter.monitoring = routerMatch;

        if (routerMatch) {
            timeManager.addFn(stepCounter.updateSparklines, FrameRateLevel.D0);
        } else {
            timeManager.removeFn(stepCounter.updateSparklines);
        }
    });
}