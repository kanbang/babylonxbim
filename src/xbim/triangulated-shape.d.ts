import { BinaryReader } from "./binary-reader";
export declare class TriangulatedShape {
    parse(binReader: BinaryReader): void;
    load: (source: any) => void;
    vertices: Float32Array;
    indices: Uint32Array;
    normals: Uint8Array;
    isPlanar: boolean;
    onloaded: (shape: TriangulatedShape) => void;
}
