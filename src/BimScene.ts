import { Scene, Engine, SceneOptions, Mesh, VertexData, Plane } from "babylonjs";

export class BimScene extends Scene {
    public indices_product: Float32Array;
    public map_product_pindexs: Map<number, Set<number>>;

    private _mesh: Mesh;
    private _vertex_data: VertexData;

    constructor(engine: Engine, options?: SceneOptions) {
        super(engine, options);

        this.map_product_pindexs = new Map<number, Set<number>>();
    }

    // Mesh.isVisible: boolean;
    // Mesh.isPickable: boolean;

    public set vertex_data(vdata: VertexData) { this._vertex_data = vdata; }
    public set mesh(mesh: Mesh) { this._mesh = mesh; }

    public getProductId(indice: number) {
        if (indice < this.indices_product.length)
            return this.indices_product[indice];
        return 0;
    }

    public setProductColor(pid: number, r: number, g: number, b: number, a: number) {
       
        if (this.map_product_pindexs.has(pid)) {
            let pindexs = this.map_product_pindexs.get(pid);
            for (var i of pindexs ){
                this._vertex_data.colors[i * 4] = r;
                this._vertex_data.colors[i * 4 + 1] = g;
                this._vertex_data.colors[i * 4 + 2] = b;
                this._vertex_data.colors[i * 4 + 3] = a;
            }
            // this._vertex_data.updateMesh(this._mesh);
            this._mesh.updateVerticesData(BABYLON.VertexBuffer.ColorKind, this._vertex_data.colors);
        }
    }

    /**
    * 得到包围盒
    * 返回格式：[x-min, y-min, z-min, x-max, y-max, z-max]
    */
    public getBoundingBox(): number[] {
        var bounding = this._mesh.getBoundingInfo();
        return [bounding.minimum.x, bounding.minimum.y, bounding.minimum.z, bounding.maximum.x, bounding.maximum.y, bounding.maximum.z];
    }

    /**
    * 设置剖切box 
    * box格式：[x-min, y-min, z-min, x-max, y-max, z-max]
    */
    public setClippingBox(box: number[]) {

        //x min
        this.clipPlane  = new Plane(-1, 0, 0, box[0]);
		
		//x max
		this.clipPlane2 = new Plane(1, 0, 0, -box[3]);

		//y min
		this.clipPlane3 = new Plane(0, -1, 0, box[1]);

		//y max
		this.clipPlane4 = new Plane(0, 1, 0, -box[4]);

		//z min
		this.clipPlane5 = new Plane(0, 0, -1, box[2]);

		//z max
        this.clipPlane6 = new Plane(0, 0, 1, -box[5]);
    }

    //取消剖切
    public unBoxClip() {
        this.clipPlane = null;
        this.clipPlane2 = null;
        this.clipPlane3 = null;
        this.clipPlane4 = null;
        this.clipPlane5 = null;
        this.clipPlane6 = null;
    }

}