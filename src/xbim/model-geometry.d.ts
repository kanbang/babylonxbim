import { BinaryReader } from "./binary-reader";
import { ProductType } from "./product-type";
export declare class ModelGeometry {
    normals: Uint8Array;
    indices: Uint32Array;
    products: Float32Array;
    transformations: Float32Array;
    styleIndices: Uint16Array;
    states: Uint8Array;
    vertices: Float32Array;
    matrices: Float32Array;
    styles: Uint8Array;
    meter: number;
    productMaps: {
        [id: number]: ProductMap;
    };
    regions: Region[];
    transparentIndex: number;
    productIdLookup: any[];
    parse(binReader: BinaryReader): void;
    load(source: any): void;
    onloaded: (geometry: ModelGeometry) => void;
    onerror: (message?: string) => void;
}
export declare class ProductMap {
    productID: number;
    renderId: number;
    type: ProductType;
    bBox: Float32Array;
    spans: Array<Int32Array>;
}
export declare class Region {
    population: number;
    centre: Float32Array;
    bbox: Float32Array;
    constructor(region?: Region);
    /**
     * Returns clone of this region
     */
    clone(): Region;
    /**
     * Returns new region which is a merge of this region and the argument
     * @param region region to be merged
     */
    merge(region: Region): Region;
}
