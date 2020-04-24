import { Scene, Engine, SceneOptions } from "babylonjs";
import { BimMesh } from "./BimMesh";
export declare class BimScene extends Scene {
    private _mapBimMeshs;
    constructor(engine: Engine, options?: SceneOptions);
    _AddBimMesh(tag: string, bimmesh: BimMesh): void;
    _DelBimMesh(tag: string): void;
    private _getBimMeshByMesh;
    setProductColor(tag: string, pid: number, r: number, g: number, b: number, a: number): void;
    bimPick(): {
        tag: string;
        pid: number;
    };
    /**
    * 得到包围盒
    * 返回格式：[x-min, y-min, z-min, x-max, y-max, z-max]
    */
    getBoundingBox(): number[];
    /**
    * 设置剖切box
    * box格式：[x-min, y-min, z-min, x-max, y-max, z-max]
    */
    setClippingBox(box: number[]): void;
    unBoxClip(): void;
}
