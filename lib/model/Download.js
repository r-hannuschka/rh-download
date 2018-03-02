"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Download {
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
    getRaw() {
        return this.raw;
    }
    getSize() {
        return this.size;
    }
    getState() {
        return this.state;
    }
    getUri() {
        return this.uri;
    }
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
    setRaw(data) {
        this.raw = data;
    }
    setSize(size) {
        this.size = size;
    }
    setState(state) {
        this.state = state;
    }
    setUri(uri) {
        this.uri = uri;
    }
}
exports.Download = Download;
