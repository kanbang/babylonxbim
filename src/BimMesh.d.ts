import { AbstractMesh, Mesh, VertexData } from "babylonjs";
export declare class BimMesh {
    private _mesh;
    private _vertex_data;
    private _indices_product;
    private _map_product_pindexs;
    constructor(mesh: Mesh, vertex_data: VertexData, indices_product: Float32Array);
    setVisible(isVisible: boolean): void;
    setPickable(isPickable: boolean): void;
    set vertex_data(vdata: VertexData);
    set mesh(mesh: Mesh);
    hasMesh(mesh: AbstractMesh): boolean;
    getBoundingBox(): number[];
    getProductId(indice: number): number;
    setProductColor(pid: number, r: number, g: number, b: number, a: number): void;
}
