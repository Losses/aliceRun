import { STEP_EVENT } from "../utils/StepCounter";
import { eventTarget } from "./EventManager";

export const RunStatManager = () => {
    eventTarget.addEventListener(STEP_EVENT, ({detail}) => {
        const $freq = document.querySelector('.joycon_freq');
      
        if ($freq) {
            $freq.textContent = `Steps: ${detail.total}, Mag: ${detail.magnitude}`;
        }
      });
}