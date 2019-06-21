import { Nullable } from "babylonjs/types";
import { Tools } from "babylonjs/Misc/tools";
import { VertexBuffer } from "babylonjs";
import { Skeleton } from "babylonjs/Bones/skeleton";
import { IParticleSystem } from "babylonjs/Particles/IParticleSystem";
import { AbstractMesh } from "babylonjs/Meshes/abstractMesh";
import { Mesh } from "babylonjs";
import { SceneLoader} from "babylonjs"
import { ISceneLoaderPlugin } from "babylonjs"
import { ISceneLoaderPluginExtensions } from "babylonjs"

import { AssetContainer } from "babylonjs";
import { Scene } from "babylonjs/scene";

import { BinaryReader } from "./xbim/binary-reader";
import { WexBimStream } from "./xbim/stream/wexbim-stream";
import { ModelGeometry, Region } from './xbim/model-geometry';



/**
 * xbim file type loader.
 * This is a babylon scene loader plugin.
 */

    
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

       
        // let reader = new BinaryReader();

        // let errCount = 0;
        // reader.onerror = e => errCount++;
        // reader.onloaded = r => {
        //     var wexbim = WexBimStream.ReadFromStream(r);
        //     if (reader.isEOF() && errCount == 0) {


        //     }
        // };

        // reader.load(data);



        var geometry = new ModelGeometry();
        geometry.onloaded = function () {
          //  viewer.addHandle(geometry, tag);

          debugger
        
          var mesh = new Mesh("xbimmesh", scene);
        
          mesh.setVerticesData(VertexBuffer.PositionKind, geometry.vertices);
    //      mesh.setVerticesData(VertexBuffer.NormalKind, geometry.normals);
          mesh.setIndices(geometry.indices);
          mesh.computeWorldMatrix(true);

          if (meshes) {
              meshes.push(mesh);
          }

        };
        geometry.onerror = function (msg) {
            //viewer.error(msg);
        }
        geometry.load(data);


/*
        if (typeof data !== "string") {

            if (this._isBinary(data)) {
                // binary .wexbim
                var babylonMesh = new Mesh("xbimmesh", scene);
                this._parseBinary(babylonMesh, data);
                if (meshes) {
                    meshes.push(babylonMesh);
                }
                return true;
            }

            // ASCII .wexbim

            // convert to string
            var array_buffer = new Uint8Array(data);
            var str = '';
            for (var i = 0; i < data.byteLength; i++) {
                str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
            }
            data = str;
        }

        //if arrived here, data is a string, containing the STLA data.

        while (matches = this.solidPattern.exec(data)) {
            var meshName = matches[1];
            var meshNameFromEnd = matches[3];
            if (meshName != meshNameFromEnd) {
                Tools.Error("Error in xbim, solid name != endsolid name");
                return false;
            }

            // check meshesNames
            if (meshesNames && meshName) {
                if (meshesNames instanceof Array) {
                    if (!meshesNames.indexOf(meshName)) {
                        continue;
                    }
                } else {
                    if (meshName !== meshesNames) {
                        continue;
                    }
                }
            }

            // xbim mesh name can be empty as well
            meshName = meshName || "xbimmesh";

            var babylonMesh = new Mesh(meshName, scene);
            this._parseASCII(babylonMesh, matches[2]);
            if (meshes) {
                meshes.push(babylonMesh);
            }
        }
*/
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
        var container = new AssetContainer(scene);
        this.importMesh(null, scene, data, rootUrl, container.meshes, null, null);
        container.removeAllFromScene();
        return container;
    }

    /*
   

    private _parseBinary(mesh: Mesh, data: ArrayBuffer) {

        var reader = new DataView(data);
        var faces = reader.getUint32(80, true);

        var dataOffset = 84;
        var faceLength = 12 * 4 + 2;

        var offset = 0;

        var positions = new Float32Array(faces * 3 * 3);
        var normals = new Float32Array(faces * 3 * 3);
        var indices = new Uint32Array(faces * 3);
        var indicesCount = 0;

        for (var face = 0; face < faces; face++) {

            var start = dataOffset + face * faceLength;
            var normalX = reader.getFloat32(start, true);
            var normalY = reader.getFloat32(start + 4, true);
            var normalZ = reader.getFloat32(start + 8, true);

            for (var i = 1; i <= 3; i++) {

                var vertexstart = start + i * 12;

                // ordering is intentional to match ascii import
                positions[offset] = reader.getFloat32(vertexstart, true);
                positions[offset + 2] = reader.getFloat32(vertexstart + 4, true);
                positions[offset + 1] = reader.getFloat32(vertexstart + 8, true);

                normals[offset] = normalX;
                normals[offset + 2] = normalY;
                normals[offset + 1] = normalZ;

                offset += 3;
            }
            indices[indicesCount] = indicesCount++;
            indices[indicesCount] = indicesCount++;
            indices[indicesCount] = indicesCount++;
        }

        mesh.setVerticesData(VertexBuffer.PositionKind, positions);
        mesh.setVerticesData(VertexBuffer.NormalKind, normals);
        mesh.setIndices(indices);
        mesh.computeWorldMatrix(true);
    }

    private _parseASCII(mesh: Mesh, solidData: string) {

        var positions = [];
        var normals = [];
        var indices = [];
        var indicesCount = 0;

        //load facets, ignoring loop as the standard doesn't define it can contain more than vertices
        var matches;
        while (matches = this.facetsPattern.exec(solidData)) {
            var facet = matches[1];
            //one normal per face
            var normalMatches = this.normalPattern.exec(facet);
            this.normalPattern.lastIndex = 0;
            if (!normalMatches) {
                continue;
            }
            var normal = [Number(normalMatches[1]), Number(normalMatches[5]), Number(normalMatches[3])];

            var vertexMatch;
            while (vertexMatch = this.vertexPattern.exec(facet)) {
                positions.push(Number(vertexMatch[1]), Number(vertexMatch[5]), Number(vertexMatch[3]));
                normals.push(normal[0], normal[1], normal[2]);
            }
            indices.push(indicesCount++, indicesCount++, indicesCount++);
            this.vertexPattern.lastIndex = 0;
        }

        this.facetsPattern.lastIndex = 0;
        mesh.setVerticesData(VertexBuffer.PositionKind, positions);
        mesh.setVerticesData(VertexBuffer.NormalKind, normals);
        mesh.setIndices(indices);
        mesh.computeWorldMatrix(true);
    }
    */
   
}

if (SceneLoader) {
    SceneLoader.RegisterPlugin(new XbimFileLoader());
}


