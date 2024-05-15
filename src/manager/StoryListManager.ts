import { ROUTER_ID } from '../stores/router';

export const StoryListManager = () => {
   const $list = document.querySelector('.story-list') as HTMLDivElement | null;

   if (!$list) throw new Error('Story list not found');

   window.addEventListener('pointermove', (event) => {
      if (ROUTER_ID.value !== '/single/list') return;
      const $$list = $list.querySelectorAll(
         'li > div',
      ) as NodeListOf<HTMLDivElement>;
      const listCount = $$list.length;
      const listWidth = $list.clientWidth;
      const windowWidth = document.body.clientWidth;
      const pointerPositoin = event.pageX;
      const pointerRatio = pointerPositoin / windowWidth;

      const listPosition = $list.getBoundingClientRect().x;
      const pointerRelativePosition = pointerPositoin - listPosition;
      const pointerRelativeRatio = pointerRelativePosition / listWidth;

      $list.style.transform = `translate(${-(pointerRatio * 100)}%, -50%)`;

      const elementUnitRatio = 1 / listCount;
      for (let elementIndex = 0; elementIndex < listCount; elementIndex += 1) {
         const elementCentralRatio =
            elementUnitRatio * elementIndex + elementUnitRatio * 0.5;
         const directionalRatio = pointerRelativeRatio - elementCentralRatio;
         const relativeRatio = 1 - Math.abs(directionalRatio);
         $$list[elementIndex].style.transform = `rotate(45deg) scale(${
            relativeRatio ** 4
         })`;
         $$list[elementIndex].style.fontWeight = (
            50 +
            750 * relativeRatio ** 6
         ).toString();
      }
   });
};
