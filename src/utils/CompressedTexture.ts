import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

export const CompressedTextureLoader = (
   renderer: THREE.WebGLRenderer
) => {

   const loader = new KTX2Loader();
   loader.setTranscoderPath('/basis/').detectSupport(renderer);

   return loader;
}

export interface ICompressedTextureLoadingResult {
   count: number;
   paths: string[];
   textures: Promise<THREE.CompressedTexture>[];
}

export const CompressedTexture = (
   paths: string[],
   loader: KTX2Loader,
): ICompressedTextureLoadingResult => {
   const textures: Promise<THREE.CompressedTexture>[] = [];
   loader.setWorkerLimit(paths.length);

   for (let i = 0; i < paths.length; i += 1) {
      textures.push(
         new Promise<THREE.CompressedTexture>((resolve, reject) => {
            loader.load(
               paths[i],
               (texture) => {
                  texture.encoding = THREE.LinearEncoding;
                  resolve(texture);
               },
               () => { },
               (e) => {
                  reject(e);
               },
            );
         })
      );
   }

   return {
      count: paths.length,
      paths,
      textures,
   };
}