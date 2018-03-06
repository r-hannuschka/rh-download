"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const download_1 = require("./download");
const api_1 = require("../api");
class FileDownload extends download_1.DownloadTask {
    startDownload() {
        const req = request(this.uri);
        req.on("response", (message) => {
            this.readResponse(message);
            req.pipe(this.fileStream)
                .on('close', () => {
                this.finishDownload("download success", api_1.DOWNLOAD_STATE_END);
            });
        })
            .on("data", (chunk) => {
            this.loaded = this.loaded + chunk.byteLength;
            this.updateDownload("download progressing ...", api_1.DOWNLOAD_STATE_PROGRESS);
        });
    }
}
new FileDownload();
