import * as BABYLON from "babylonjs";
import { BimScene } from "./BimScene";
export declare class BimBabylon {
    engine: BABYLON.Engine;
    scene: BimScene;
    camera: BABYLON.Camera;
    light: BABYLON.Light;
    private _view;
    private _obj_loader;
    private _xbim_loader;
    private _mapTagMeshs;
    constructor(canvas: HTMLCanvasElement);
    loadWexbim(tag: string, rootUrl: string, sceneFilename?: string | File): void;
    run(): void;
}
