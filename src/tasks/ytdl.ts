import * as ytdl from "ytdl-core";
import { DOWNLOAD_STATE_PROGRESS } from "../api";
import { DownloadTask } from './download';
import { IncomingMessage } from "http";

class YoutubeDownloadTask extends DownloadTask
{
    private ytdlStream: any;

    protected startDownload()
    {
        // create youtube download stream
        this.ytdlStream = ytdl(this.uri);
        this.ytdlStream
            .on("response", (response: IncomingMessage) => {
                this.ytdlStream.pipe( 
                    this.createFileStream(response));
            })
            .on("progress", this.onProgress.bind(this))
            .on("end"     , () => {
                this.finish();
            });
    }

    protected destroy() 
    {
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
    private onProgress(chunk: number, loaded: number)
    {
        this.loaded = loaded;
        this.update({state: DOWNLOAD_STATE_PROGRESS});
    };
}

new YoutubeDownloadTask();
