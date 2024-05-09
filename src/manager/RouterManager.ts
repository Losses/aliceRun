import { ROUTER_ID } from "../stores/router"

export const RouterManager = () => {
    document.querySelectorAll('[data-to-router]').forEach((x) => x.addEventListener(
        'click', 
        () => {
            ROUTER_ID.value = (x as HTMLElement).dataset.toRouter ?? ''
        }
    ));

    ROUTER_ID.subscribe((id) => {
        const $$elements = document.querySelectorAll('[data-router]');

        $$elements.forEach((x) => {
            if ((x as HTMLElement).dataset.router?.split('|')?.includes(id)) {
                x.classList.remove('hidden');
            } else {
                x.classList.add('hidden');
            }
        });
    });

    ROUTER_ID.value = '/';
}