import * as BABYLON from "babylonjs"

import { OBJFileLoader } from 'babylonjs-loaders'
import { XbimFileLoader } from './XbimFileLoader'
import { BimScene } from "./BimScene"


class BimBabylon {
  public engine: BABYLON.Engine;
  public scene: BimScene;

  public camera: BABYLON.Camera;
  public light: BABYLON.Light;

  private _view: HTMLCanvasElement;
  private _obj_loader: OBJFileLoader;
  private _xbim_loader: XbimFileLoader;

  constructor(canvas: HTMLCanvasElement) {

    this._obj_loader = new OBJFileLoader();   //必须实例化，才能使用 BABYLON.SceneLoader.LoadAssetContainer( .obj ...)
    this._xbim_loader = new XbimFileLoader(); //必须实例化，才能使用 BABYLON.SceneLoader.LoadAssetContainer( .obj ...)
    this._view = canvas;

    this.engine = new BABYLON.Engine(this._view, true);
    this.scene = new BimScene(this.engine);

    var cam = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3.2,
      80000,
      new BABYLON.Vector3(7000, 1200, 1000),
      this.scene);

    cam.maxZ = 1000000;
    cam.wheelDeltaPercentage = 0.02;
    cam.attachControl(this._view);

    this.camera = cam;

    this.light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      this.scene);



    this._view.addEventListener("click", ev => {
      var pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
      console.log(pickResult);
      if (pickResult.pickedMesh) {
        // var indices = pickResult.pickedMesh.getIndices();
        // console.log(indices);
        console.log('faceId', pickResult.faceId)

        var indice = pickResult.faceId * 3;
        var pid = this.scene.getProductId(indice);
        console.log("pid", pid);

        if (pid > 0) {
          this.scene.setProductColor(pid, Math.random(), Math.random(), Math.random(), 1);
        }
      }
    });
  }

  public loadWexbim(rootUrl: string, sceneFilename?: string | File) {

    BABYLON.SceneLoader.LoadAssetContainer(
      rootUrl,
      sceneFilename,
      this.scene,
      container => {



        var bimMet = new BABYLON.StandardMaterial("bimMet", this.scene); 

        bimMet.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        bimMet.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        bimMet.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        // bimMet.alpha = 0.5;
        // bimMet.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);

        bimMet.backFaceCulling = false;
        // bimMet.wireframe = true;


        for (const mesh of container.meshes) {
          mesh.material = bimMet;
        }

        container.addAllToScene()


        //测试剖切
        var box = this.scene.getBoundingBox();

        (this.camera as BABYLON.ArcRotateCamera).target.set((box[0] + box[3]) / 2, (box[1] + box[4]) / 2, (box[2] + box[5]) / 2)

        box[0] += 20000;
        box[3] -= 20000;

        box[1] += 20000;
        box[4] -= 20000;
        // scene.setClippingBox(box);
      }
    );
  }

  public run() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

}

var canvas = document.getElementById("view") as HTMLCanvasElement;
var bim = new BimBabylon(canvas);
bim.loadWexbim("models/",
// "LakesideRestaurant.wexbim",
// "hotel.wexbim",
"st4.wexbim");
bim.run();


