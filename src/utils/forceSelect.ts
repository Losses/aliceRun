export const forceSelect = <T>(
   selector: string,
   root: Element | Document = document,
) => {
   const $ = root.querySelector(selector);

   if (!$) {
      throw new Error(`${selector} not found`);
   }

   return $ as T;
};
