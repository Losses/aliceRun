import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

var ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('/basis/');

export const CompressedTexture = (path: string) => new Promise((resolve, reject) => {
    ktx2Loader.load(
        path,
        (texture) => {
            const material = new THREE.MeshStandardMaterial({ map: texture });
            resolve(material);
        },
        () => {},
        (e) => { reject(e) }
    );
})