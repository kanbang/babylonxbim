
import { OBJFileLoader } from 'babylonjs-loaders'
import { XbimFileLoader, BimAssetContainer } from './XbimFileLoader'
import { BimScene } from "./BimScene"
import { Material, AbstractMesh, Plane, Engine, Camera, Light, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader } from "babylonjs";
import { BimMesh } from "./BimMesh";


export class BimBabylon {
    public engine: Engine;
    public scene: BimScene;

    public camera: Camera;
    public light: Light;

    private _view: HTMLCanvasElement;
    private _obj_loader: OBJFileLoader;
    private _xbim_loader: XbimFileLoader;
    private _mapBimMeshs: Map<string, BimMesh>;

    // var canvas = document.getElementById("view") as HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement) {

        this._obj_loader = new OBJFileLoader();   //必须实例化，才能使用 BABYLON.SceneLoader.LoadAssetContainer( .obj ...)
        this._xbim_loader = new XbimFileLoader(); //必须实例化，才能使用 BABYLON.SceneLoader.LoadAssetContainer( .obj ...)
        this._view = canvas;

        this.engine = new Engine(this._view, true);
        this.scene = new BimScene(this, this.engine);
  
        this._mapBimMeshs = new Map<string, BimMesh>();

        // 默认相机
        var cam = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 3.2,
            80000,
            new Vector3(7000, 1200, 1000),
            this.scene);

        cam.maxZ = 1000000;
        cam.wheelDeltaPercentage = 0.02;
        cam.attachControl(this._view);

        this.camera = cam;

        // 默认光源
        this.light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            this.scene);
    }

    // 加载wexbim文件
    public loadWexbim(tag: string, rootUrl: string, sceneFilename?: string | File, onSuccess?: (tag:string) => void) {

        SceneLoader.LoadAssetContainer(
            rootUrl,
            sceneFilename,
            this.scene,
            container => {
                container.addAllToScene();
                this._mapBimMeshs.set(tag, (container as BimAssetContainer).bimmesh);

                // 回调函数
                if(onSuccess){
                    onSuccess(tag);
                }
            }
        );
    }

    public run() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }


    //设置构件颜色、透明度
    public setProductColor(tag: string, pid: number, r: number, g: number, b: number, a: number) {
        if (this._mapBimMeshs.has(tag)) {
            this._mapBimMeshs.get(tag).setProductColor(pid, r, g, b, a);
        }
    }

    //鼠标点选
    public bimPick(): { tag: string, pid: number } {
        var pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        console.log(pickResult);
        if (pickResult.pickedMesh) {
            let { tag, bimmesh } = this._getBimMeshByMesh(pickResult.pickedMesh)

            console.log('tag', tag)
            console.log('faceId', pickResult.faceId)

            var indice = pickResult.faceId * 3;
            var pid = bimmesh.getProductId(indice);
            console.log("pid", pid);

            return { tag: tag, pid: pid };
        }

        return { tag: null, pid: null };
    }


    /**
    * 得到包围盒
    * 返回格式：[x-min, y-min, z-min, x-max, y-max, z-max]
    */
    public getBoundingBox(): number[] {

        var { min, max } = this.scene.getWorldExtends();
        return [min.x, min.y, min.z, max.x, max.y, max.z];
    }

    /**
    * 设置剖切box 
    * box格式：[x-min, y-min, z-min, x-max, y-max, z-max]
    */
    public setClippingBox(box: number[]) {
        //x min
        this.scene.clipPlane = new Plane(-1, 0, 0, box[0]);
        //x max
        this.scene.clipPlane2 = new Plane(1, 0, 0, -box[3]);
        //y min
        this.scene.clipPlane3 = new Plane(0, -1, 0, box[1]);
        //y max
        this.scene.clipPlane4 = new Plane(0, 1, 0, -box[4]);
        //z min
        this.scene.clipPlane5 = new Plane(0, 0, -1, box[2]);
        //z max
        this.scene.clipPlane6 = new Plane(0, 0, 1, -box[5]);
    }

    //取消剖切
    public unBoxClip() {
        this.scene.clipPlane = null;
        this.scene.clipPlane2 = null;
        this.scene.clipPlane3 = null;
        this.scene.clipPlane4 = null;
        this.scene.clipPlane5 = null;
        this.scene.clipPlane6 = null;
    }

    //设置材质
    public setMaterial(tag:string, material:Material){
        if(this._mapBimMeshs.has(tag)){
            this._mapBimMeshs.get(tag).mesh.material = material;
        }
    }
    
    public _AddBimMesh(tag: string, bimmesh: BimMesh) {
        this._mapBimMeshs.set(tag, bimmesh);
    }

    public _DelBimMesh(tag: string) {
        this._mapBimMeshs.delete(tag);
    }

    private _getBimMeshByMesh(mesh: AbstractMesh): { tag: string, bimmesh: BimMesh } {
        for (let [key, value] of this._mapBimMeshs) {
            if (value.hasMesh(mesh)) {
                return { tag: key, bimmesh: value };
            }
        }

        return { tag: null, bimmesh: null };
    }
}