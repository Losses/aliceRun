import { QUERY_PARAMETER, ROUTER_ID } from '../stores/router';

export const RouterManager = () => {
   document.querySelectorAll('[data-to-router]').forEach((x) =>
      x.addEventListener('click', () => {
         const trueValue = (x as HTMLElement).dataset.toRouter ?? '';
         const [routerId, queryParameter] = trueValue.split('?');
         const parameters = new URLSearchParams(queryParameter);
         
         parameters.forEach((value, key) => {
            if (value === '@') {
               parameters.set(key, QUERY_PARAMETER.value.get(key) || '');
            }
         })
         QUERY_PARAMETER.value = parameters;
         ROUTER_ID.value = routerId;
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
