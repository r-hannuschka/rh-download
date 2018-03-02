"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const request = require("request");
const download_1 = require("./download");
const api_1 = require("../api");
class FileDownload extends download_1.DownloadTask {
    startDownload() {
        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`);
        const req = request(this.uri);
        req.on("response", this.readResponse.bind(this))
            .on("data", (chunk) => {
            this.loaded = this.loaded + chunk.byteLength;
            this.updateDownload("download progressing ...", api_1.DOWNLOAD_STATE_PROGRESS);
        })
            .pipe(this.fileStream)
            .on("close", () => {
            this.updateDownload("download finished", api_1.DOWNLOAD_STATE_END);
        });
    }
}
new FileDownload();
