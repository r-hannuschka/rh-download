import {IFile, IFileData} from '../api';

export class File implements IFile {

    private uri: string;

    private error: string;

    private loaded: number = 0;

    private size: number = 0;

    private name: string;

    private destination: string;

    private fileName: string;

    public getDestination() {
        return this.destination;
    }

    public getError(): string {
        return this.error;
    }

    public getFileName(): string {
        return this.fileName;
    }

    public getLoaded(): number {
        return this.loaded;
    }

    public getName(): string {
        return this.name;
    }

    public getSize(): number {
        return this.size;
    }

    public getUri(): string {
        return this.uri;
    }

    /**
     * set file destination path
     * 
     * @param {string} dest 
     * @memberof File
     */
    public setDestination( dest: string) {
        this.destination = dest;
    }

    public setError(error: string) {
        this.error = error;
    }

    public setFileName(name: string) {
        this.fileName = name;
    }

    public setLoaded(loaded: number) {
        this.loaded = loaded;
    }

    public setName(name: string) {
        this.name = name;
    }

    public setSize(size: number) {
        this.size = size;
    }

    public setUri(uri: string) {
        this.uri = uri;
    }

    public raw(): IFileData
    {
        return {
            fileName: this.getFileName(),
            loaded: this.getLoaded(),
            path: this.getDestination(),
            size: this.getSize(),
            name: this.getName()
        }
    }
}
