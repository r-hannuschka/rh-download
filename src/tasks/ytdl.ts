import * as ytdl from "ytdl-core";
import {
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_PROGRESS,
} from "../api";
import { DownloadTask } from './download';
import { IncomingMessage } from "http";

class YoutubeDownloadTask extends DownloadTask
{
    private ytdlStream: any;

    protected cancelDownload() {
        this.ytdlStream.destroy();
        this.ytdlStream = null;
        super.cancelDownload();
    }

    protected startDownload()
    {
        // create youtube download stream
        this.ytdlStream = ytdl(this.uri);
        this.ytdlStream
            .on("response", (message: IncomingMessage) => {
                this.readResponse(message);
                this.ytdlStream.pipe(this.fileStream);
            })
            .on("progress", this.onProgress.bind(this))
            .on("end"     , () => {
                this.ytdlStream.removeAllListeners();
                this.finishDownload('Download finished', DOWNLOAD_STATE_END);
            });
    }

    /**
     * download in progress
     *
     * @param {number} chunk length
     * @param {number} loaded downloaded total
     * @param {number} size total size
     */
    private onProgress(chunk: number, loaded: number)
    {
        this.loaded = loaded;
        this.updateDownload('Download in progress', DOWNLOAD_STATE_PROGRESS);
    };
}

new YoutubeDownloadTask();
