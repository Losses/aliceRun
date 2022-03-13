import * as THREE from 'three';

import { GROUND_SIZE, Ground } from '../components/Ground';
import { ResourceTracker } from '../ResourceTracker';

interface IGroundDefinition {
    x: number;
    y: number;
    mesh: THREE.Mesh;
}

const GROUND_TILES: Set<IGroundDefinition> = new Set();

export const GroundManager = (camera: THREE.Camera, scene: THREE.Scene, tracker: ResourceTracker) => {
    const updateGroundTiles = () => {
        const { x, z } = camera.position;
        const tileX = Math.round(x / GROUND_SIZE);
        const tileY = Math.round(z / GROUND_SIZE);

        const existedTiles = [...GROUND_TILES.values()];

        const tileToBeDestroied = existedTiles.filter((tile) => {
            const { x, y } = tile;

            return (
                Math.abs(x - tileX) > 1 ||
                Math.abs(y - tileY) > 1
            );
        });

        const existedTileSet = new Set(tileToBeDestroied);

        const tilesNotBeingDestoried = existedTiles.filter((tile) => {
            return !existedTileSet.has(tile);
        });

        tileToBeDestroied.forEach((tile) => {
            scene.remove(tile.mesh);
            GROUND_TILES.delete(tile);
            tile.mesh.geometry.dispose();
        });

        for (let x = tileX - 1; x <= tileX + 1; x++) {
            for (let y = tileY - 1; y <= tileY + 1; y++) {
                const existedGroundTile = tilesNotBeingDestoried.find(
                    ({ x: existedX, y: existedY }) => existedX === x && existedY === y
                );

                if (!existedGroundTile) {
                    const groundTile = Ground(x, y, tracker);

                    scene.add(groundTile);
                    GROUND_TILES.add({ x, y, mesh: groundTile });
                }
            }
        }
    }

    return updateGroundTiles;
}