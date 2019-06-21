import * as BABYLON from "babylonjs"

import { SampleMaterial } from "./Materials/SampleMaterial"
import { OBJFileLoader } from 'babylonjs-loaders'
import { XbimFileLoader } from './XbimFileLoader'
import { Vector3 } from 'babylonjs'







const view = document.getElementById("view") as HTMLCanvasElement;

const obj_loader = new OBJFileLoader(); //必须实例化，才能使用 BABYLON.SceneLoader.LoadAssetContainer( .obj ...)
const xbim_loader = new XbimFileLoader(); //必须实例化，才能使用 BABYLON.SceneLoader.LoadAssetContainer( .obj ...)

const engine = new BABYLON.Engine(view, true);

const scene = new BABYLON.Scene(engine);

const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 3.2,
    10000,
    new BABYLON.Vector3(4000,200,1000),
    scene);

camera.attachControl(view);

const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene);

const mesh = BABYLON.MeshBuilder.CreateGround("mesh", {}, scene);

const material =  new SampleMaterial("material", scene);
mesh.material = material;


var bimMet = new BABYLON.StandardMaterial("bimMet", scene);3

bimMet.diffuseColor = new BABYLON.Color3(1, 0, 1);
bimMet.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
bimMet.emissiveColor = new BABYLON.Color3(1, 0, 1);
// bimMet.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);

bimMet.backFaceCulling = false;
//bimMet.wireframe = true;


BABYLON.SceneLoader.LoadAssetContainer(
  "models/",
  "11.wexbim",
  this.scene,
  container => {

    for (const mesh of container.meshes) {
      mesh.material = bimMet;
    }

    container.addAllToScene()
  }
);

/*
  BABYLON.SceneLoader.LoadAssetContainer(
    "models/",
    "romanbustrecalc.obj",
    this.scene,
    container => {
     

      for (const mesh of container.meshes) {
      //  mesh.material = material;
        }
      
      container.addAllToScene()
    }
  );
/**/


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/*
let reader = new BinaryReader();
//let source = "/models/hotel.wexBIM";
let source = "/models/envelop.wexbim";

let errCount = 0;
reader.onerror = e => errCount++;
reader.onloaded = r => {
  var wexbim = WexBimStream.ReadFromStream(r);
  var msg = document.getElementById("message");

  if (reader.isEOF() && errCount == 0) {
    msg.innerHTML = "Everything is all right. Reader didn't crash and did reach the end of the file.";
  }
  else {
    msg.innerHTML = "Not finished... :-(";
  }
};
*/

// AssetContainer

//reader.load(source);

//BABYLON.MeshBuilder.CreatePolyhedron

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////



engine.runRenderLoop(() => {
    scene.render();
});
