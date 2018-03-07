"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ytdl = require("ytdl-core");
const api_1 = require("../api");
const download_1 = require("./download");
class YoutubeDownloadTask extends download_1.DownloadTask {
    startDownload() {
        // create youtube download stream
        this.ytdlStream = ytdl(this.uri);
        this.ytdlStream
            .on("response", (response) => {
            this.ytdlStream.pipe(this.createFileStream(response));
        })
            .on("progress", this.onProgress.bind(this))
            .on("end", () => {
            this.finish();
        });
    }
    destroy() {
        this.ytdlStream.removeAllListeners();
        this.ytdlStream.destroy();
        this.ytdlStream = null;
        super.destroy();
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
        this.update({ state: api_1.DOWNLOAD_STATE_PROGRESS });
    }
    ;
}
new YoutubeDownloadTask();
