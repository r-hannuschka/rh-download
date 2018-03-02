import {IDownload, IFileData} from '../api';

export class Download implements IDownload {

    private uri: string;

    private error: string;

    private loaded: number = 0;

    private size: number = 0;

    private name: string;

    private destination: string;

    private fileName: string;

    private state: string;

    private raw: IFileData ;

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

    public getRaw(): IFileData {
        return this.raw;
    }

    public getSize(): number {
        return this.size;
    }

    public getState(): string {
        return this.state;
    }

    public getUri(): string {
        return this.uri;
    }

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

    public setRaw(data: IFileData) {
        this.raw = data;
    }

    public setSize(size: number) {
        this.size = size;
    }

    public setState(state: string) {
        this.state = state;
    }

    public setUri(uri: string) {
        this.uri = uri;
    }
}
