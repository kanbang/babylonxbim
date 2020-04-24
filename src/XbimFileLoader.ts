import { Nullable } from "babylonjs/types";
import { VertexData, Scene } from "babylonjs";
import { Skeleton } from "babylonjs/Bones/skeleton";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";
import { Mesh } from "babylonjs";
import { SceneLoader } from "babylonjs"
import { ISceneLoaderPlugin } from "babylonjs"
import { ISceneLoaderPluginExtensions } from "babylonjs"

import { AssetContainer } from "babylonjs";
import { ModelGeometry } from './xbim/model-geometry';
import { BimMesh } from "./BimMesh";



/**
 * xbim file type loader.
 * This is a babylon scene loader plugin.
 */

export class BimAssetContainer extends AssetContainer {
    public bimmesh: BimMesh;

    constructor(scene: Scene) {
        super(scene);
    }
}

export class XbimFileLoader implements ISceneLoaderPlugin {

    /**
     * Defines the name of the plugin.
     */
    public name = "wexbim";

    /**
     * Defines the extensions the xbim loader is able to load.
     * force data to come in as an ArrayBuffer
     * we'll convert to string if it looks like it's an ASCII .wexbim
     */
    public extensions: ISceneLoaderPluginExtensions = {
        ".wexbim": { isBinary: true },
    };


    private loadModelGeometry(scene: Scene, data: any, onloaded: (bimmesh: BimMesh) => void) {
        var geometry = new ModelGeometry();

        geometry.onloaded = function () {

            var mesh = new Mesh("xbimmesh", scene);
            mesh.hasVertexAlpha = true;

            // mesh.setVerticesData(VertexBuffer.PositionKind, geometry.vertices);
            // //      mesh.setVerticesData(VertexBuffer.NormalKind, geometry.normals);
            // mesh.setIndices(geometry.indices);
            // mesh.computeWorldMatrix(true);

            var vertexData = new VertexData();

            //Assign positions and indices to vertexData
            vertexData.positions = geometry.vertices;
            vertexData.indices = geometry.indices;

            ////////////////////////////////////////////////////////////////
            //测试 按products随机颜色
            vertexData.colors = new Float32Array(geometry.products.length * 4);

            var colormap = new Map<number, number[]>();
            for (var i = 0; i < geometry.products.length; ++i) {
                var index = geometry.indices[i];
                var pid = Math.floor(geometry.products[i] + 0.5);

                if (colormap.has(pid)) {
                    var clr = colormap.get(pid);
                    vertexData.colors[index * 4] = clr[0];
                    vertexData.colors[index * 4 + 1] = clr[1];
                    vertexData.colors[index * 4 + 2] = clr[2];
                    vertexData.colors[index * 4 + 3] = 0.5;
                }
                else {
                    var clr: number[] = [];
                    clr.push(Math.random());
                    clr.push(Math.random());
                    clr.push(Math.random());
                    clr.push(Math.random());
                    colormap.set(pid, clr);
                    vertexData.colors[index * 4] = clr[0];
                    vertexData.colors[index * 4 + 1] = clr[1];
                    vertexData.colors[index * 4 + 2] = clr[2];
                    vertexData.colors[index * 4 + 3] = 0.5;
                }
            }
            ////////////////////////////////////////////////////////////////


            //法线设置
            var normals = [];
            BABYLON.VertexData.ComputeNormals(geometry.vertices, geometry.indices, normals);
            // BABYLON.VertexData._ComputeSides(BABYLON.Mesh.FRONTSIDE, geometry.vertices, geometry.indices, normals, uvs);


            // vec3 getNormal() {
            //     float U = aNormal[0];
            //     float V = aNormal[1];
            //     float PI = 3.1415926535897932384626433832795;
            //     float lon = U / 252.0 * 2.0 * PI;
            //     float lat = V / 252.0 * PI;

            //     float x = sin(lon) * sin(lat);
            //     float z = cos(lon) * sin(lat);
            //     float y = cos(lat);
            //     return normalize(vec3(x, y, z));
            //    }


            // vertexData.normals = geometry.normals;
            // vertexData.uvs = uvs;
            // vertexData.colors = colors;

            //Apply vertexData to custom mesh
            vertexData.applyToMesh(mesh, true);


            let bimmesh = new BimMesh(mesh, vertexData, geometry.products);
            onloaded(bimmesh);
        };

        geometry.onerror = function (msg) {
            console.error(msg);
        }

        geometry.load(data);
    }


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
    public importMesh(meshesNames: any, scene: Scene, data: any, rootUrl: string, meshes: Nullable<AbstractMesh[]>, particleSystems: Nullable<IParticleSystem[]>, skeletons: Nullable<Skeleton[]>): boolean {
        this.loadModelGeometry(scene, data, (bimmesh: BimMesh) => {
            if (meshes) {
                meshes.push(bimmesh.mesh);
            }
        });

        return true;
    }

    /**
     * Load into a scene.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onError The callback when import fails
     * @returns true if successful or false otherwise
     */
    public load(scene: Scene, data: any, rootUrl: string): boolean {
        var result = this.importMesh(null, scene, data, rootUrl, null, null, null);

        if (result) {
            scene.createDefaultLight();
            scene.createDefaultCameraOrLight();
        }

        return result;
    }

    /**
     * Load into an asset container.
     * @param scene The scene to load into
     * @param data The data to import
     * @param rootUrl The root url for scene and resources
     * @param onError The callback when import fails
     * @returns The loaded asset container
     */
    public loadAssetContainer(scene: Scene, data: string, rootUrl: string, onError?: (message: string, exception?: any) => void): AssetContainer {
        // var container = new BimAssetContainer(scene);
        // this.importMesh(null, scene, data, rootUrl, container.meshes, null, null);
        // container.removeAllFromScene();
        // return container;

        var container = new BimAssetContainer(scene);
        this.loadModelGeometry(scene, data, (bimmesh: BimMesh) => {
            container.meshes.push(bimmesh.mesh);
            container.bimmesh = bimmesh;
        });
        
        container.removeAllFromScene();
        return container;
    }
}

if (SceneLoader) {
    SceneLoader.RegisterPlugin(new XbimFileLoader());
}


