export interface ReadIndex {
    (view: DataView, offset: number): number;
}
export declare class WexBimMesh {
    private _array;
    private _view;
    private VersionPos;
    private VertexCountPos;
    private TriangleCountPos;
    private VertexPos;
    constructor(meshData: ArrayBuffer);
    get Version(): number;
    get VertexCount(): number;
    get TriangleCount(): number;
    get FaceCount(): number;
    get Length(): number;
    get Vertices(): Float32Array;
    get Faces(): WexBimMeshFace[];
}
export declare class WexBimMeshFace {
    private _array;
    private _view;
    private _offsetStart;
    private _readIndex;
    private _sizeofIndex;
    constructor(readIndex: ReadIndex, sizeofIndex: number, array: ArrayBuffer, facesOffset: number);
    get TriangleCount(): number;
    get IsPlanar(): boolean;
    get Indices(): Uint32Array;
    get Normals(): Float32Array;
    private unpackNormal;
}
