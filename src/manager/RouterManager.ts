import { QUERY_PARAMETER, ROUTER_ID } from '../stores/router';

export const RouterManager = () => {
   document.querySelectorAll('[data-to-router]').forEach((x) =>
      x.addEventListener('click', () => {
         const trueValue = (x as HTMLElement).dataset.toRouter ?? '';
         const [routerId, queryParameter] = trueValue.split('?');
         ROUTER_ID.value = routerId;
         QUERY_PARAMETER.value = new URLSearchParams(queryParameter);
      }),
   );

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
};
