import { BimBabylon } from "./BimBabylon";
import { StandardMaterial, Color3, ArcRotateCamera } from "babylonjs";


var canvas = document.getElementById("view") as HTMLCanvasElement;
var bim = new BimBabylon(canvas);

canvas.addEventListener("click", ev => {
  var { tag, pid } = bim.bimPick();
  if (pid > 0) {
    bim.setProductColor(tag, pid, Math.random(), Math.random(), Math.random(), 1);
  }
});


bim.loadWexbim(
  "floor9",
  "models/",
  // "LakesideRestaurant.wexbim",
  // "hotel.wexbim",
  "st4.wexbim",
  () => { }
);

bim.loadWexbim(
  "floor10",
  "models/",
  // "LakesideRestaurant.wexbim",
  // "hotel.wexbim",
  "11.wexbim",
  () => {

    //测试剖切
    var box = bim.getBoundingBox();

    box[0] += 20000;
    box[3] -= 20000;

    box[1] += 20000;
    box[4] -= 20000;
    // bim.setClippingBox(box);


    //测试相机 
    (bim.camera as ArcRotateCamera).target.set((box[0] + box[3]) / 2, (box[1] + box[4]) / 2, (box[2] + box[5]) / 2)


    //测试材质
    var bimMet = new StandardMaterial("bimMet", this.scene);

    bimMet.diffuseColor = new Color3(0.5, 0.5, 0.5);
    bimMet.specularColor = new Color3(0.5, 0.5, 0.5);
    bimMet.emissiveColor = new Color3(0.5, 0.5, 0.5);
    // bimMet.alpha = 0.5;
    // bimMet.ambientColor = new Color3(0.23, 0.98, 0.53);

    bimMet.backFaceCulling = false;
    bimMet.wireframe = true;
    // bim.setMaterial("floor10", bimMet);

  });

bim.run();







