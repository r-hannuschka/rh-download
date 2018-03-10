"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class File {
    constructor() {
        this.loaded = 0;
        this.size = 0;
    }
    getDestination() {
        return this.destination;
    }
    getError() {
        return this.error;
    }
    getFileName() {
        return this.fileName;
    }
    getLoaded() {
        return this.loaded;
    }
    getName() {
        return this.name;
    }
    getSize() {
        return this.size;
    }
    getUri() {
        return this.uri;
    }
    /**
     * set file destination path
     *
     * @param {string} dest
     * @memberof File
     */
    setDestination(dest) {
        this.destination = dest;
    }
    setError(error) {
        this.error = error;
    }
    setFileName(name) {
        this.fileName = name;
    }
    setLoaded(loaded) {
        this.loaded = loaded;
    }
    setName(name) {
        this.name = name;
    }
    setSize(size) {
        this.size = size;
    }
    setUri(uri) {
        this.uri = uri;
    }
    raw() {
        return {
            fileName: this.getFileName(),
            loaded: this.getLoaded(),
            path: this.getDestination(),
            size: this.getSize(),
            name: this.getName()
        };
    }
}
exports.File = File;
