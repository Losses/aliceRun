export const PointerManager = () => {
   const body = document.body;
   let mouseTimeout: number | undefined;

   const hideMouse = () => {
      body.style.cursor = 'none';
   };

   const showMouse = () => {
      body.style.cursor = 'default';
   };

   const handleMouseMove = () => {
      showMouse();

      if (mouseTimeout) {
         clearTimeout(mouseTimeout);
      }

      mouseTimeout = window.setTimeout(hideMouse, 5000);
   };

   document.addEventListener('mousemove', handleMouseMove);

   mouseTimeout = window.setTimeout(hideMouse, 5000);
};
