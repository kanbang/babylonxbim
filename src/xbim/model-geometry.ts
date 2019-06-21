import { BinaryReader } from "./binary-reader";
import { TriangulatedShape } from "./triangulated-shape";
import { State } from "./state";
import { ProductType } from "./product-type";

import { mat4 } from "./matrix/mat4";
import { vec3 } from "./matrix/vec3";

const tick = () => new Promise(cb => setTimeout(cb, 0))

const EPSILON = 0.01

const approximatelyEqual = (a, b) => Math.abs(a - b) < EPSILON


const computeNormal = triangle => {
    const normal = vec3.cross(
        vec3.create(),
        vec3.sub(vec3.create(), triangle[1], triangle[0]),
        vec3.sub(vec3.create(), triangle[2], triangle[0]),
    )

    const normalizedNormal = vec3.normalize(vec3.create(), normal)
        
    return normalizedNormal
}

const centerOfPoints = points => {
    let acc = vec3.create()
    points.forEach(point => {
        acc = vec3.add(vec3.create(), acc, point)
    })

    return vec3.scale(vec3.create(), acc, 1 / points.length)
}

/*
const sortPolygonPoints = (points) => {
    if (points.length < 3) {
        return points
    }

    const center = centerOfPoints(points)
    const normal = computeNormal([points[0], points[1], center])

    const mvMatrix = mat4.lookAt(mat4.create(), center, vec3.add(vec3.create(), center, normal), [0, 0, 1]);
    const pMatrix = mat4.ortho(mat4.create(), -200, 200, -200, 200, -1, 1)
    const matrix = mat4.multiply(mat4.create(), mvMatrix, pMatrix)

    return points.sort((a, b) => {
        const projA = vec3.transformMat4(vec3.create(), a, mvMatrix)
        const projB = vec3.transformMat4(vec3.create(), b, mvMatrix)
        
        const angleA = Math.atan2(projA[2], projA[0])
        const angleB = Math.atan2(projB[2], projB[0])

        return angleA - angleB
    })
}

const getNormalHash = normal => {
    const x = Math.round(normal[0] * 100) / 100
    const y = Math.round(normal[1] * 100) / 100
    const z = Math.round(normal[2] * 100) / 100

    return `${x.toPrecision(2)} ${y.toPrecision(2)} ${z.toPrecision(2)}`
}


export const getShape = triangles => {
    const normalToTriangles = {}

    // Regroup triangles with similar normal
    triangles.forEach(triangle => {
        const normal = computeNormal(triangle)
        const normalKey = getNormalHash(normal)

        normalToTriangles[normalKey] = normalToTriangles[normalKey] || []
        normalToTriangles[normalKey].push(triangle)
    })
        
    let facesTriangles = []

    // Regroup triangles that share a point
    Object.keys(normalToTriangles).forEach(normalKey => {
        const normalTriangles = normalToTriangles[normalKey]
        const faces = []

        normalTriangles.forEach(normalTriangle => {
            let found = false

            faces.forEach(face => {
                face.forEach(triangle => {
                    triangle.forEach(point => {
                        if (found) {
                            return false
                        }

                        if (
                            vec3.equals(point, normalTriangle[0]) ||
                            vec3.equals(point, normalTriangle[1]) ||
                            vec3.equals(point, normalTriangle[2])
                        ) {
                            face.push(normalTriangle)
                            found = true
                            return false
                        }

                        return true
                    })

                    return !face
                })
            })

            if (!found) {
                faces.push([normalTriangle])
            }
        })

        facesTriangles = [...faces, ...facesTriangles]
    })

    const faces = []

    facesTriangles.forEach(faceTriangles => {
        const face = []

        faceTriangles.forEach(triangle => {
            triangle.forEach(point => {
                let found = false;
                face.forEach(facePoint => {
                    if (vec3.equals(point, facePoint)) {
                        found = true
                    }

                    return !found
                })

                if (!found) {
                    face.push(point)
                }
            })
        })


        faces.push(sortPolygonPoints(face))
    })

    return faces
}
*/

export class ModelGeometry {
    //all this data is to be fed into GPU as attributes
    normals: Float32Array;
    indices: Uint32Array;
    products: Float32Array;
    transformations: Float32Array;
    styleIndices: Uint16Array;
    states: Uint8Array;
    //this is the only array we need to keep alive on client side to be able to change appearance of the model

    //these will be sent to GPU as the textures
    vertices: Float32Array;
    matrices: Float32Array;
    styles: Uint8Array;
    bbox: Float32Array;

    meter = 1000;

    //this will be used to change appearance of the objects
    //map objects have a format: 
    //map = {
    //	productID: int,
    //	type: int,
    //	bBox: Float32Array(6),
    //	spans: [Int32Array([int, int]),Int32Array([int, int]), ...] //spanning indexes defining shapes of product and it's state
    //};

    public productMaps: { [id: number]: ProductMap; } = {};
    public transparentProductMaps:ProductMap[] = [];
    public productTypeMaps: { [id: number]: ProductMap[] } = {};
 //   public productTypeMaps: Map<number,ProductMap> = {};
    public regions: Region[];
    public transparentIndex: number;
    public productIdLookup = [];

    public getNormal = (normal1, normal2) => {
        const lon = normal1 / 252.0 * 2.0 * Math.PI;
        const lat = normal2 / 252.0 * Math.PI;

        const x = Math.sin(lon) * Math.sin(lat);
        const z = Math.cos(lon) * Math.sin(lat);
        const y = Math.cos(lat);
        return vec3.normalize(vec3.create(), vec3.fromValues(x, y, z));
    }

    public packNormal = normal => {
        const x = normal[0]
        const y = normal[1]
        const z = normal[2]

        const lat = Math.acos(y)
        const lon = (x || z)
            ? Math.atan2(x / Math.sin(lat), z / Math.sin(lat))
            : 0

        return [
            Math.round(252 * (lon / (Math.PI * 2.0))),
            Math.round(252 * (lat / Math.PI)),
        ]
    }

    private getStyleColor(iStyle) {
        const R = this.styles[(iStyle * 4)]
        const G = this.styles[(iStyle * 4) + 1]
        const B = this.styles[(iStyle * 4) + 2]
        const A = this.styles[(iStyle * 4) + 3]

        return [R, G, B, A]
    }
    private setStyleColor(iStyle, color) {
        this.styles[(iStyle * 4)] = color[0]
        this.styles[(iStyle * 4) + 1] = color[1]
        this.styles[(iStyle * 4) + 2] = color[2]
        this.styles[(iStyle * 4) + 3] = color[3]
    }

    public async parse(binReader: BinaryReader, styleModifier) {
        console.time('parse')
        var br = binReader;
        var magicNumber = br.readInt32();
        if (magicNumber != 94132117) throw 'Magic number mismatch.';
        var version = br.readByte();
        var numShapes = br.readInt32();
        var numVertices = br.readInt32();
        var numTriangles = br.readInt32();
        var numMatrices = br.readInt32();
        var numProducts = br.readInt32();
        var numStyles = br.readInt32();
        this.meter = br.readFloat32();
        var numRegions = br.readInt16();


        //set size of arrays to be square usable for texture data
        //TODO: reflect support for floating point textures
        var square = function (arity, count) {
            if (typeof (arity) == 'undefined' || typeof (count) == 'undefined') {
                throw 'Wrong arguments';
            }
            if (count == 0) return 0;
            var byteLength = count * arity;
            var imgSide = Math.ceil(Math.sqrt(byteLength / 4));
            //clamp to parity
            while ((imgSide * 4) % arity != 0) {
                imgSide++
            }
            var result = imgSide * imgSide * 4 / arity;
            return result;
        };


        debugger;
        //create target buffers of correct size (avoid reallocation of memory)
//kk      
        this.vertices = new Float32Array(numTriangles * 3 * 3);
    //    this.vertices = new Float32Array(square(4, numVertices * 3));

        this.normals = new Float32Array(numTriangles * 6);
        this.indices = new Uint32Array(numTriangles * 3);
        this.styleIndices = new Uint16Array(numTriangles * 3);
        this.styles = new Uint8Array(square(1, (numStyles + 1) * 4)); //+1 is for a default style
        this.products = new Float32Array(numTriangles * 3);
        this.states = new Uint8Array(numTriangles * 3 * 2); //place for state and restyling
        this.transformations = new Float32Array(numTriangles * 3);
        this.matrices = new Float32Array(square(4, numMatrices * 16));
        this.productMaps = {};
        this.productTypeMaps = {};
        this.regions = new Array<Region>(numRegions);

        var iVertex = 0;
        var iIndexForward = 0;
        var iIndexBackward = numTriangles * 3;
        var iTransform = 0;
        var iMatrix = 0;

        var stateEnum = State;
        var typeEnum = ProductType;

        let xMin = Number.POSITIVE_INFINITY
        let xMax = Number.NEGATIVE_INFINITY

        let yMin = Number.POSITIVE_INFINITY
        let yMax = Number.NEGATIVE_INFINITY

        let zMin = Number.POSITIVE_INFINITY
        let zMax = Number.NEGATIVE_INFINITY

        for (var i = 0; i < numRegions; i++) {
            let region = new Region();
            region.population = br.readInt32();
            region.centre = br.readFloat32Array(3);
            region.bbox = br.readFloat32Array(6);
            this.regions[i] = region;
        }


        var styleMap = [];
        styleMap['getStyle'] = function (id) {
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                if (item.id == id) return item;
            }
            return null;
        };
        var iStyle = 0;
        for (iStyle; iStyle < numStyles; iStyle++) {
            var styleId = br.readInt32();
            var R = br.readFloat32() * 255;
            var G = br.readFloat32() * 255;
            var B = br.readFloat32() * 255;
            var A = br.readFloat32() * 255;
            this.styles.set([R, G, B, A], iStyle * 4);
            styleMap.push({ id: styleId, index: iStyle, transparent: A < 254 });
        }
        this.styles.set([255, 255, 255, 255], iStyle * 4);
        var defaultStyle = { id: -1, index: iStyle, transparent: A < 254 }
        styleMap.push(defaultStyle);

        for (var i = 0; i < numProducts; i++) {
            var productLabel = br.readInt32();
            var prodType = br.readInt16();
            var bBox = br.readFloat32Array(6);

            var map = {
                productID: productLabel,
                renderId: i + 1,
                type: prodType,
                bBox: bBox,
                spans: [],
                state: State.UNDEFINED,
                hasTransparentShapes: false,
            };
            this.productIdLookup[i + 1] = productLabel;
            this.productMaps[productLabel] = map;
            this.productTypeMaps[prodType] = this.productTypeMaps[prodType] || [];
            this.productTypeMaps[prodType].push(map)
        }

        for (var iShape = 0; iShape < numShapes; iShape++) {
            if (iShape % 250 === 0) {
                await tick()
            }

            var repetition = br.readInt32();
            var shapeList = [];
            for (var iProduct = 0; iProduct < repetition; iProduct++) {
                var prodLabel = br.readInt32();
                var instanceTypeId = br.readInt16();
                var instanceLabel = br.readInt32();
                var styleId = br.readInt32();
                var transformation = null;

                if (repetition > 1) {
                    transformation = version === 1 ? br.readFloat32Array(16) : br.readFloat64Array(16);
                    this.matrices.set(transformation, iMatrix);
                    iMatrix += 16;
                }

                var styleItem = styleMap['getStyle'](styleId);
                if (styleItem === null)
                    styleItem = defaultStyle;

                const matrix = mat4.create();
                if (transformation) {
                    for (var i = 0; i < 4; i++) {
                        for (var j = 0; j < 4; j++) {
                            matrix[(i * 4) + j] = transformation[(i * 4) + j];
                        }
                    }
                }

                shapeList.push({
                    pLabel: prodLabel,
                    iLabel: instanceLabel,
                    style: styleItem.index,
                    transparent: styleItem.transparent,
                    transformation: matrix
                });
            }

            //read shape geometry
            var shapeGeom = new TriangulatedShape();
            shapeGeom.parse(br);


            //copy shape data into inner array and set to null so it can be garbage collected
            shapeList.forEach(shape => {
                var iIndex = 0;
                //set iIndex according to transparency either from beginning or at the end
                if (shape.transparent) {
                    iIndex = iIndexBackward - shapeGeom.indices.length;
                } else {
                    iIndex = iIndexForward;
                }

                var begin = iIndex;
                var map = this.productMaps[shape.pLabel];
                if (typeof (map) === "undefined") {
                    //throw "Product hasn't been defined before.";
                    map = {
                        productID: 0,
                        type: typeEnum.IFCOPENINGELEMENT,
                        bBox: new Float32Array(6),
                        renderId: 0,
                        spans: [],
                        state: State.UNDEFINED,
                        hasTransparentShapes: false,
                    };
                    this.productMaps[shape.pLabel] = map;
                }

                // this.normals.set(shapeGeom.normals, iIndex * 2);

                //switch spaces and openings off by default 
                var state = map.type == typeEnum.IFCSPACE || map.type == typeEnum.IFCOPENINGELEMENT
                    ? stateEnum.HIDDEN
                    : 0xFF; //0xFF is for the default state


                let triangle = []

                //fix indices to right absolute position. It is relative to the shape.
                for (var i = 0; i < shapeGeom.indices.length; i++) {
                    this.indices[iIndex] = shapeGeom.indices[i] + iVertex / 3;
                    this.products[iIndex] = map.renderId;
                    this.styleIndices[iIndex] = shape.style;
                    this.states[2 * iIndex] = state; //set state
                    this.states[2 * iIndex + 1] = 0xFF; //default style

                    this.normals[2 * iIndex] = shapeGeom.normals[2 * i]
                    this.normals[(2 * iIndex) + 1] = shapeGeom.normals[(2 * i) + 1]

                    const vertex = vec3.create();
                    vertex[0] = shapeGeom.vertices[3 * shapeGeom.indices[i]];
                    vertex[1] = shapeGeom.vertices[3 * shapeGeom.indices[i] + 1];
                    vertex[2] = shapeGeom.vertices[3 * shapeGeom.indices[i] + 2];

                    const transformedVertex = vec3.transformMat4(vec3.create(), vertex, shape.transformation);

                    if (styleModifier) {
                        const styleColor = this.getStyleColor(shape.style)

                        const newColor = styleModifier(map, styleColor)

                        if (newColor) {
                            this.setStyleColor(shape.style, newColor)
                        }
                    }

                    // Fixing the normals for the doors and windows
                    if (
                        map.type === typeEnum.IFCDOOR ||
                        map.type === typeEnum.IFCDOORSTANDARDCASE ||
                        map.type === typeEnum.IFCWINDOW ||
                        map.type === typeEnum.IFCWINDOWSTANDARDCASE
                    ) {
                        if (!triangle[0]) {
                            triangle[0] = transformedVertex
                        } else if (!triangle[1]) {
                            triangle[1] = transformedVertex
                        } else if (!triangle[2]) {
                            triangle[2] = transformedVertex

                            const computedNormal = computeNormal(triangle)
                            const packedNormal = this.packNormal(computedNormal)
                            
                            this.normals[2 * (iIndex - 2)] = packedNormal[0]
                            this.normals[(2 * (iIndex - 2)) + 1] = packedNormal[1]

                            this.normals[2 * (iIndex - 1)] = packedNormal[0]
                            this.normals[(2 * (iIndex - 1)) + 1] = packedNormal[1]

                            this.normals[2 * iIndex] = packedNormal[0]
                            this.normals[(2 * iIndex) + 1] = packedNormal[1]

                            triangle = []
                        }
                    }

                    if (map.type === typeEnum.IFCSLAB) {
                        transformedVertex[2] += this.meter * 0.02
                    } else if (map.type === typeEnum.IFCWALL || map.type === typeEnum.IFCWALLSTANDARDCASE || map.type === typeEnum.IFCWALLELEMENTEDCASE) {
                        const offsetRatio = this.meter * 0.002;
                        const normal = this.getNormal(this.normals[2 * iIndex], this.normals[(2 * iIndex) + 1])
                        normal[1] = 0
                        transformedVertex[0] += normal[0] * offsetRatio;
                        transformedVertex[1] += normal[1] * offsetRatio;
                        transformedVertex[2] += normal[2] * offsetRatio;
                    }

                    this.vertices[3 * iIndex] = transformedVertex[0];
                    this.vertices[3 * iIndex + 1] = transformedVertex[1];
                    this.vertices[3 * iIndex + 2] = transformedVertex[2];
                    
                    xMin = Math.min(transformedVertex[0], xMin);
                    xMax = Math.max(transformedVertex[0], xMax);

                    yMin = Math.min(transformedVertex[1], yMin);
                    yMax = Math.max(transformedVertex[1], yMax);

                    zMin = Math.min(transformedVertex[2], zMin);
                    zMax = Math.max(transformedVertex[2], zMax);

                    iIndex++;
                }

                var end = iIndex;
                map.spans.push(new Int32Array([begin, end, shape.transparent ? 1 : 0]));

                if (!map.hasTransparentShapes && shape.transparent) {
                    this.transparentProductMaps.push(map)
                }

                map.hasTransparentShapes = map.hasTransparentShapes || shape.transparent

                if (shape.transparent) iIndexBackward -= shapeGeom.indices.length;
                else iIndexForward += shapeGeom.indices.length;
            },
                this);

            //keep track of amount so that we can fix indices to right position
            //this must be the last step to have correct iVertex number above
            iVertex += shapeGeom.vertices.length;
            shapeGeom = null;
        }
        
        //binary reader should be at the end by now
        if (!br.isEOF()) {
            //throw 'Binary reader is not at the end of the file.';
        }

        this.transparentIndex = iIndexForward;

        this.bbox = new Float32Array([
            xMin,
            yMin,
            zMin,
            xMax - xMin,
            yMax - yMin,
            zMax - zMin,
        ]);

        console.timeEnd('parse')
    }

    //Source has to be either URL of wexBIM file or Blob representing wexBIM file
    public load(source, styleModifier) {
        //binary reading
        var br = new BinaryReader();
        var self = this;
        br.onloaded = async function () {
            
            await self.parse(br, styleModifier);
            if (self.onloaded) {
                self.onloaded(this);
            }
        };
        br.onerror = function (msg) {
            if (self.onerror) self.onerror(msg);
        };
        br.load(source);
    }

    public onloaded: (geometry: ModelGeometry) => void;

    public onerror: (message?: string) => void;
}


export class ProductMap {
    productID: number;
    renderId: number;
    type: ProductType;
    bBox: Float32Array;
    spans: Array<Int32Array>;
    state: State;
    hasTransparentShapes: Boolean;
}

export class Region {
    public population: number = -1;
    public centre: Float32Array = null;
    public bbox: Float32Array = null;

    constructor(region?: Region) {
        if (region) {
            this.population = region.population;
            this.centre = new Float32Array(region.centre);
            this.bbox = new Float32Array(region.bbox);
        }
    }

    /**
     * Returns clone of this region
     */
    public clone(): Region {
        let clone = new Region();

        clone.population = this.population;
        clone.centre = new Float32Array(this.centre);
        clone.bbox = new Float32Array(this.bbox);

        return clone;
    }

    /**
     * Returns new region which is a merge of this region and the argument
     * @param region region to be merged
     */
    public merge(region: Region): Region {
        //if this is a new empty region, return clone of the argument
        if (this.population === -1 && this.centre === null && this.bbox === null)
            return new Region(region);

        let out = new Region();
        out.population = this.population + region.population;

        let x = Math.min(this.bbox[0], region.bbox[0]);
        let y = Math.min(this.bbox[1], region.bbox[1]);
        let z = Math.min(this.bbox[2], region.bbox[2]);

        let x2 = Math.min(this.bbox[0] + this.bbox[3], region.bbox[0] + region.bbox[3]);
        let y2 = Math.min(this.bbox[1] + this.bbox[4], region.bbox[1] + region.bbox[4]);
        let z2 = Math.min(this.bbox[2] + this.bbox[5], region.bbox[2] + region.bbox[5]);

        let sx = x2 - x;
        let sy = y2 - y;
        let sz = z2 - z;

        let cx = (x + x2) / 2.0;
        let cy = (y + y2) / 2.0;
        let cz = (z + z2) / 2.0;

        out.bbox = new Float32Array([x, y, z, sx, sy, sz]);
        out.centre = new Float32Array([cx, cy, cz]);
        return out;
    }
}