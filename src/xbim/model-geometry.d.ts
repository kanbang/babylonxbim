import { BinaryReader } from "./binary-reader";
import { State } from "./state";
import { ProductType } from "./product-type";
export declare class ModelGeometry {
    normals: Float32Array;
    indices: Uint32Array;
    products: Float32Array;
    transformations: Float32Array;
    styleIndices: Uint16Array;
    states: Uint8Array;
    vertices: Float32Array;
    matrices: Float32Array;
    styles: Uint8Array;
    bbox: Float32Array;
    meter: number;
    productMaps: {
        [id: number]: ProductMap;
    };
    transparentProductMaps: ProductMap[];
    productTypeMaps: {
        [id: number]: ProductMap[];
    };
    regions: Region[];
    transparentIndex: number;
    productIdLookup: any[];
    getNormal: (normal1: any, normal2: any) => Float32Array;
    packNormal: (normal: any) => number[];
    private getStyleColor;
    private setStyleColor;
    parse(binReader: BinaryReader, styleModifier: any): Promise<void>;
    load(source: any, styleModifier: any): void;
    onloaded: (geometry: ModelGeometry) => void;
    onerror: (message?: string) => void;
}
export declare class ProductMap {
    productID: number;
    renderId: number;
    type: ProductType;
    bBox: Float32Array;
    spans: Array<Int32Array>;
    state: State;
    hasTransparentShapes: Boolean;
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
