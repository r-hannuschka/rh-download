import * as request from "request";
import { DownloadTask } from './download';
import { DOWNLOAD_STATE_PROGRESS, DOWNLOAD_STATE_END } from "../api";
import { IncomingMessage } from "http";

class FileDownload extends DownloadTask {

    protected startDownload(): void {
        const req = request(this.uri);
        req.on("response", (message: IncomingMessage) => {
                this.readResponse(message);
                req.pipe(this.fileStream)
                    .on('close', () => {
                        this.finishDownload("download success", DOWNLOAD_STATE_END);
                    })
            })
            .on("data", (chunk: Buffer) => {
                this.loaded = this.loaded + chunk.byteLength;
                this.updateDownload("download progressing ...", DOWNLOAD_STATE_PROGRESS);
            });
    }
}

new FileDownload();