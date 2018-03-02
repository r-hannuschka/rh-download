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
    getLoaded() {
        return this.loaded;
    }
    getName() {
        return this.name;
    }
    getFileName() {
        return this.fileName;
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
    setFileName(name) {
        this.fileName = name;
    }
    setError(error) {
        this.error = error;
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
    setState(state) {
        this.state = state;
    }
    setUri(uri) {
        this.uri = uri;
    }
}
exports.Download = Download;
//# sourceMappingURL=Download.js.map