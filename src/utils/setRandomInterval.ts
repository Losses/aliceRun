type CallbackFunction = () => void;

function setRandomInterval(
   callback: CallbackFunction,
   centralTime: number,
   randomRange: number,
): () => void {
   let timeoutId: number;

   const run = () => {
      const randomTime = centralTime + (Math.random() * 2 - 1) * randomRange;
      timeoutId = window.setTimeout(() => {
         callback();
         run();
      }, randomTime);
   };

   run();

   return () => clearTimeout(timeoutId);
}

// @ts-ignore
window.setRandomInterval = setRandomInterval;
