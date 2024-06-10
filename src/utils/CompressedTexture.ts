import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

export const CompressedTextureLoader = (
   renderer: THREE.WebGLRenderer
) => {

   const loader = new KTX2Loader();
   loader.setTranscoderPath('/basis/').detectSupport(renderer);

   return loader;
}

export const CompressedTexture = (
   paths: string[],
   loader: KTX2Loader,
) => {
   return paths.map((path) => new Promise<THREE.Texture>((resolve, reject) => {
      loader.load(
         path,
         (texture) => {
            texture.encoding = THREE.LinearEncoding;
            resolve(texture);
            loader.dispose();
         },
         () => { },
         (e) => {
            reject(e);
         },
      );
   }));
}