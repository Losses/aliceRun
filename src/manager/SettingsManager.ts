import { VISUAL_LOAD } from "../stores/visualLoad";

export const SettingsManager = () => {
    const $visualLoad = document.querySelector('.visual-load') as HTMLInputElement | null;

    if (!$visualLoad) return;

    $visualLoad.value = VISUAL_LOAD.value.toString();

    $visualLoad.addEventListener('change', (event: Event) => {
        const value = parseFloat((event.target as HTMLInputElement).value);
        VISUAL_LOAD.value = value;
    });
}