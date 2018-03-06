"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        // create youtube download stream
        this.ytdlStream = ytdl(this.uri);
        this.ytdlStream
            .on("response", (message) => {
            this.readResponse(message);
            this.ytdlStream.pipe(this.fileStream);
        })
            .on("progress", this.onProgress.bind(this))
            .on("end", () => {
            this.ytdlStream.removeAllListeners();
            this.finishDownload('Download finished', api_1.DOWNLOAD_STATE_END);
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
