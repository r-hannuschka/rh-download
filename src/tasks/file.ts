import * as fs from "fs";
import * as request from "request";
import { DownloadTask } from './download';
import { DOWNLOAD_STATE_END, DOWNLOAD_STATE_PROGRESS } from "../api";

class FileDownload extends DownloadTask {

    protected startDownload(): void {
        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`);
        const req = request(this.uri);
        req.on("response", this.readResponse.bind(this))
            .on("data", (chunk: Buffer) => {
                this.loaded = this.loaded + chunk.byteLength;
                this.updateDownload("download progressing ...", DOWNLOAD_STATE_PROGRESS);
            })
            .pipe(this.fileStream)
            .on("close", () => {
                this.updateDownload("download finished", DOWNLOAD_STATE_END);
            });
    }
}

new FileDownload();