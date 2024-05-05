import { RENDERING_DETAIL, VISUAL_LOAD } from "../stores/settings";

export const SettingsManager = () => {
    const $visualLoad = document.querySelector('.visual-load') as HTMLInputElement | null;

    if (!$visualLoad) return;

    $visualLoad.value = VISUAL_LOAD.value.toString();

    $visualLoad.addEventListener('change', (event: Event) => {
        const value = parseFloat((event.target as HTMLInputElement).value);
        VISUAL_LOAD.value = value;
    });

    const $renderingDetail = document.querySelector('.rendering-detail') as HTMLInputElement | null;

    if (!$renderingDetail) return;

    $renderingDetail.value = RENDERING_DETAIL.value.toString();

    $renderingDetail.addEventListener('change', (event: Event) => {
        const value = parseFloat((event.target as HTMLInputElement).value);
        RENDERING_DETAIL.value = value;
    });
}
