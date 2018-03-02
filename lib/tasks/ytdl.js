"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ytdl = require("ytdl-core");
const api_1 = require("../api");
const download_1 = require("./download");
class YoutubeDownloadTask extends download_1.DownloadTask {
    cancelDownload() {
        this.ytdlStream.destroy();
        this.ytdlStream = null;
        super.cancelDownload();
    }
    startDownload() {
        this.processDownload();
    }
    /**
     * processing download
     */
    processDownload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield ytdl.getInfo(this.uri);
            // create file for download
            this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`, { flags: 'wx' });
            // create youtube download stream
            const stream = ytdl(this.uri);
            stream.on("response", this.readResponse.bind(this));
            stream.on("progress", this.onProgress.bind(this));
            stream.on("end", () => {
                stream.removeAllListeners();
                this.finishDownload('Download finished', api_1.DOWNLOAD_STATE_END);
            });
            stream.pipe(this.fileStream);
            this.ytdlStream = stream;
        });
    }
    /**
     * download in progress
     *
     * @param {number} chunk length
     * @param {number} loaded downloaded total
     * @param {number} size total size
     */
    onProgress(chunk, loaded) {
        this.loaded = loaded;
        this.updateDownload('Download in progress', api_1.DOWNLOAD_STATE_PROGRESS);
    }
    ;
}
new YoutubeDownloadTask();
