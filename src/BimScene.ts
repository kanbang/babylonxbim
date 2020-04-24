import { Scene, Engine, SceneOptions } from "babylonjs";
import { BimBabylon } from "./BimBabylon";


export class BimScene extends Scene {

    public bimBabylon: BimBabylon;

    constructor(bimBabylon: BimBabylon, engine: Engine, options?: SceneOptions) {
        super(engine, options);
        this.bimBabylon = bimBabylon;
    }
}