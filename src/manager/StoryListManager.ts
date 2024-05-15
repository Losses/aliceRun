import { ROUTER_ID } from "../stores/router";

const MINIMAL_SCALE = 0.5;

export const StoryListManager = () => {
   const $list = document.querySelector('.story-list') as HTMLDivElement | null;

   if (!$list) throw new Error('Story list not found');

   window.addEventListener('pointermove', (event) => {
      if (ROUTER_ID.value !== '/single/list') return;
      const listCount = $list.querySelectorAll('li').length;
      const listWidth = $list.clientWidth;
      const windowWidth = document.body.clientWidth;
      const pointerPositoin = event.pageX;
      const pointerRatio = pointerPositoin / windowWidth;

      const totalDistance = windowWidth * 0.5 + listWidth * 0.5;
      const listPosition = windowWidth * 0.5 - totalDistance * pointerRatio;
      const pointerRelativePosition = pointerPositoin - listPosition;
      const pointerRelativeRatio = pointerRelativePosition / listWidth;

      console.log(pointerRelativeRatio);

      $list.style.transform = `translate(${-(pointerRatio * 100)}%, -50%)`;

      for (let i = 0; i < listCount; i += 1) {

      }
   });
}