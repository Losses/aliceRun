import * as THREE from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

export const CompressedTexture = (path: string, renderer: THREE.WebGLRenderer) => new Promise<THREE.MeshBasicMaterial>((resolve, reject) => {
    const loader = new KTX2Loader();
    loader.setTranscoderPath('/basis/').detectSupport(renderer);

    loader.load(
        path,
        (texture) => {
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
            material.side = THREE.DoubleSide;
            texture.center = new THREE.Vector2(0.5, 0.5);
            texture.rotation = Math.PI;
            resolve(material);
        },
        () => {},
        (e) => { reject(e) }
    );
})