import * as fs from "fs";
import * as ytdl from "ytdl-core";
import {
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_PROGRESS,
} from "../api";
import { DownloadTask } from './download';

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
        this.processDownload();
    }

    /**
     * processing download
     */
    private async processDownload() {

        await ytdl.getInfo(this.uri);

        // create file for download
        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`, {flags: 'wx' });

        // create youtube download stream
        const stream = ytdl(this.uri);
        stream.on("response", this.readResponse.bind(this));
        stream.on("progress", this.onProgress.bind(this));
        stream.on("end"     , () => {
            stream.removeAllListeners();
            this.finishDownload('Download finished', DOWNLOAD_STATE_END);
        });
        stream.pipe(this.fileStream);
        this.ytdlStream = stream;
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
