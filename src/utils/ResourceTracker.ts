// biome-ignore lint/suspicious/noExplicitAny: This is safe
type Any = any;

interface IDisposable extends Any {
   dispose(): void;
}

export class ResourceTracker {
   resources: Set<IDisposable>;
   constructor() {
      this.resources = new Set();
   }
   track(resource: IDisposable) {
      this.resources.add(resource);
      return resource;
   }
   unTrack(resource: IDisposable) {
      this.resources.delete(resource);
   }
   dispose() {
      for (const resource of Array.from(this.resources.values())) {
         resource.dispose();
      }

      this.resources.clear();
   }
}
