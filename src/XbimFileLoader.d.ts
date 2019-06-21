import { Nullable } from "babylonjs/types";
import { Skeleton } from "babylonjs/Bones/skeleton";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";
import { ISceneLoaderPlugin } from "babylonjs";
import { ISceneLoaderPluginExtensions } from "babylonjs";
import { AssetContainer } from "babylonjs";
import { Scene } from "babylonjs/scene";
/**
 * xbim file type loader.
 * This is a babylon scene loader plugin.
 */
export declare class XbimFileLoader implements ISceneLoaderPlugin {
    /**
     * Defines the name of the plugin.
     */
    name: string;
    /**
     * Defines the extensions the xbim loader is able to load.
     * force data to come in as an ArrayBuffer
     * we'll convert to string if it looks like it's an ASCII .wexbim
     */
    extensions: ISceneLoaderPluginExtensions;
    /**
     * Import meshes into a scene.
     * @param meshesNames An array of mesh names, a single mesh name, or empty string for all meshes that filter what meshes are imported
     * @param scene The scene to import into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param meshes The meshes array to import into
     * @param particleSystems The particle systems array to import into
     * @param skeletons The skeletons array to import into
     * @param onError The callback when import fails
     * @returns True if successful or false otherwise
     */
    importMesh(meshesNames: any, scene: Scene, data: any, rootUrl: string, meshes: Nullable<AbstractMesh[]>, particleSystems: Nullable<IParticleSystem[]>, skeletons: Nullable<Skeleton[]>): boolean;
    /**
     * Load into a scene.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onError The callback when import fails
     * @returns true if successful or false otherwise
     */
    load(scene: Scene, data: any, rootUrl: string): boolean;
    /**
     * Load into an asset container.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onError The callback when import fails
     * @returns The loaded asset container
     */
    loadAssetContainer(scene: Scene, data: string, rootUrl: string, onError?: (message: string, exception?: any) => void): AssetContainer;
}
