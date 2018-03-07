import * as request from "request";
import { DownloadTask } from './download';
import { DOWNLOAD_STATE_PROGRESS } from "../api";
import { IncomingMessage } from "http";

class FileDownload extends DownloadTask {

    protected startDownload(): void {
        const req = request(this.uri);
        req.on("response", (response: IncomingMessage) => {
                req.pipe(this.createFileStream(response))
                    .on('close', () => {
                        req.removeAllListeners();
                        this.finish();
                    })
            })
            .on("data", (chunk: Buffer) => {
                this.loaded = this.loaded + chunk.byteLength;
                this.update({state: DOWNLOAD_STATE_PROGRESS});
            });
    }
}

new FileDownload();