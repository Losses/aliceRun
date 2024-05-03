import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

export const CompressedTexture = (path: string, renderer: THREE.WebGLRenderer) => new Promise<THREE.Texture>((resolve, reject) => {
    const loader = new KTX2Loader();
    loader.setTranscoderPath('/basis/').detectSupport(renderer);

    loader.load(
        path,
        (texture) => {
            resolve(texture);
        },
        () => {},
        (e) => { reject(e) }
    );
})