import { AbstractMesh, Mesh, VertexData } from "babylonjs";

export class BimMesh {

    private _mesh: Mesh;
    private _vertex_data: VertexData;
    private _indices_product: Float32Array;
    private _map_product_pindexs: Map<number, Set<number>>;

    constructor(mesh: Mesh, vertex_data: VertexData, indices_product: Float32Array) {
        this._mesh = mesh;
        this._vertex_data = vertex_data;
        this._indices_product = indices_product;

        this._map_product_pindexs = new Map<number, Set<number>>();

        for (var i = 0; i < this._indices_product.length; ++i) {
            var index = this._vertex_data.indices[i];
            var pid = Math.floor(this._indices_product[i] + 0.5);
            if (this._map_product_pindexs.has(pid)) {
                this._map_product_pindexs.get(pid).add(index);
            }
            else {
                this._map_product_pindexs.set(pid, new Set([index]));
            }
        }
    }

    // Mesh.isVisible: boolean;
    // Mesh.isPickable: boolean;

    public setVisible(isVisible: boolean) {
        this._mesh.isVisible = isVisible;
    }

    public setPickable(isPickable: boolean) {
        this._mesh.isPickable = isPickable;
    }

    public set vertex_data(vdata: VertexData) { this._vertex_data = vdata; }
    public set mesh(mesh: Mesh) { this._mesh = mesh; }
    public get mesh(): Mesh { return this._mesh; }

    public hasMesh(mesh: AbstractMesh): boolean {
        return this._mesh === mesh;
    }

    public getBoundingBox(): number[] {
        var bounding = this._mesh.getBoundingInfo();
        return [bounding.minimum.x, bounding.minimum.y, bounding.minimum.z, bounding.maximum.x, bounding.maximum.y, bounding.maximum.z];
    }

    public getProductId(indice: number) {
        if (indice < this._indices_product.length)
            return this._indices_product[indice];
        return 0;
    }

    public setProductColor(pid: number, r: number, g: number, b: number, a: number) {

        if (this._map_product_pindexs.has(pid)) {
            let pindexs = this._map_product_pindexs.get(pid);
            for (var i of pindexs) {
                this._vertex_data.colors[i * 4] = r;
                this._vertex_data.colors[i * 4 + 1] = g;
                this._vertex_data.colors[i * 4 + 2] = b;
                this._vertex_data.colors[i * 4 + 3] = a;
            }
            // this._vertex_data.updateMesh(this._mesh);
            this._mesh.updateVerticesData(BABYLON.VertexBuffer.ColorKind, this._vertex_data.colors);
        }
    }
}