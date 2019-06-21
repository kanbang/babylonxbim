function xTriangulatedShape() { };

//this will get xBinaryReader on the current position and will parse it's content to fill itself with vertices, normals and vertex indices
xTriangulatedShape.prototype.parse = function (binReader) {
    var self = this;
    var version = binReader.readByte();
    var numVertices = binReader.readInt32();
    var numOfTriangles = binReader.readInt32();
    self.vertices = binReader.readFloat32(numVertices * 3);
    //allocate memory of defined size (to avoid reallocation of memory)
    self.indices = new Uint32Array(numOfTriangles * 3);
    self.normals = new Uint8Array(numOfTriangles * 6);
    //indices for incremental adding of indices and normals
    var iIndex = 0;
    var readIndex;
    if (numVertices <= 0xFF) {
        readIndex = function (count) { return binReader.readByte(count); };
    }
    else if (numVertices <= 0xFFFF) {
        readIndex = function (count) { return binReader.readUint16(count); };
    }
    else {
        readIndex = function (count) { return binReader.readInt32(count); };
    }
    
    var numFaces = binReader.readInt32();

    if (numVertices === 0 || numOfTriangles === 0)
        return;

    for (var i = 0; i < numFaces; i++) {
        var numTrianglesInFace = binReader.readInt32();
        if (numTrianglesInFace == 0) continue;

        var isPlanar = numTrianglesInFace > 0;
        numTrianglesInFace = Math.abs(numTrianglesInFace);
        if (isPlanar) {
            var normal = binReader.readByte(2);
            //read and set all indices
            var planarIndices = readIndex(3 * numTrianglesInFace);
            self.indices.set(planarIndices, iIndex);

            for (var j = 0; j < numTrianglesInFace*3; j++) {
                //add three identical normals because this is planar but needs to be expanded for WebGL
                self.normals[iIndex * 2] = normal[0];
                self.normals[iIndex * 2 + 1] = normal[1];
                iIndex++;
            }
        }
        else {
            for (var j = 0; j < numTrianglesInFace; j++) {
                self.indices[iIndex] = readIndex();//a
                self.normals.set(binReader.readByte(2), iIndex * 2);
                iIndex++;

                self.indices[iIndex] = readIndex();//b
                self.normals.set(binReader.readByte(2), iIndex * 2);
                iIndex++;

                self.indices[iIndex] = readIndex();//c
                self.normals.set(binReader.readByte(2), iIndex * 2);
                iIndex++;
            }
        }
    }
};

//This would load only shape data from binary file
xTriangulatedShape.prototype.load = function (source) {
    //binary reading
    var br = new xBinaryReader();
    var self = this;
    br.onloaded = function () {
        self.parse(br);
        if (self.onloaded) {
            self.onloaded();
        }
    };
    br.load(source);
};


xTriangulatedShape.prototype.vertices = [];
xTriangulatedShape.prototype.indices = [];
xTriangulatedShape.prototype.normals = [];

//this function will get called when loading is finished.
//This won't get called after parse which is supposed to happen in large operation.
xTriangulatedShape.prototype.onloaded = function () { };
