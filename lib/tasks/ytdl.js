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
const FileExists_1 = require("../model/exception/FileExists");
const DirectoryNotExsists_1 = require("../model/exception/DirectoryNotExsists");
class DownloadTask {
    constructor() {
        this.directory = '';
        this.fileName = "yt-download";
        this.total = 0;
        this.loaded = 0;
    }
    cancel() {
        this.ytdlStream.destroy();
        this.fileStream.destroy();
        this.ytdlStream = null;
        this.fileStream = null;
        // remove file 
        if (fs.existsSync(`${this.directory}/${this.fileName}`)) {
            fs.unlinkSync(`${this.directory}/${this.fileName}`);
        }
        this.finishDownload('Download Cancled', api_1.DOWNLOAD_STATE_CANCEL);
    }
    /**
     * initialize download task
     *
     * @memberof DownloadTask
     */
    initialize() {
        this.loadProcessParameters();
        this.initializeDownload()
            .then(() => {
            this.processDownload();
        })
            .catch((exception) => {
            if (exception instanceof FileExists_1.FileExistsException) {
                this.finishDownload(exception.message, api_1.DOWNLOAD_STATE_END);
            }
            else {
                this.finishDownload(exception.message || exception, api_1.DOWNLOAD_STATE_ERROR);
            }
        });
    }
    /**
     * processing download
     */
    processDownload() {
        // create file for download
        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`, { flags: 'wx' });
        // create youtube download stream
        const stream = ytdl(this.uri);
        stream.on("response", this.onResponse.bind(this));
        stream.on("progress", this.onProgress.bind(this));
        stream.on("end", () => {
            stream.removeAllListeners();
            this.finishDownload('Download finished', api_1.DOWNLOAD_STATE_END);
        });
        stream.pipe(this.fileStream);
        this.ytdlStream = stream;
    }
    /**
     * parse process arguments
     */
    loadProcessParameters() {
        const args = process.argv.slice(2);
        for (let i = 0, ln = args.length; i < ln; i++) {
            // tslint:disable-next-line:switch-default
            switch (args[i]) {
                case "--dir":
                    i++;
                    this.directory = args[i];
                    break;
                case "--name":
                    i++;
                    this.fileName = args[i];
                    break;
                case "--uri":
                    i++;
                    this.uri = args[i];
                    break;
            }
        }
    }
    /**
     *
     *
     * @private
     * @returns {Promise<ytdl.videoInfo>}
     * @memberof DownloadTask
     */
    initializeDownload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateDirectory();
            this.validateFile(`${this.directory}/${this.fileName}`);
            return ytdl.getInfo(this.uri);
        });
    }
    /**
     * video response has been found and start downloading
     *
     * @param {IncomingMessage} response
     */
    onResponse(response) {
        const headers = response.headers;
        const total = parseInt(headers["content-length"], 10);
        this.total = total;
        this.updateDownload('Download starting', api_1.DOWNLOAD_STATE_START);
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
    updateDownload(message, state) {
        process.send({
            data: {
                message,
                file: `${this.directory}/${this.fileName}`,
                loaded: this.loaded,
                total: this.total
            },
            state
        });
    }
    finishDownload(message = "", state) {
        this.updateDownload(message, state);
        process.exit(0);
    }
    /**
     * checks directory exist and if not try to create it
     *
     * @private
     * @memberof DownloadTask
     */
    validateDirectory() {
        if (fs.existsSync(this.directory)) {
            const directoryStats = fs.statSync(this.directory);
            if (!directoryStats.isDirectory()) {
                throw new DirectoryNotExsists_1.DirectoryNotExistsException(`${this.directory} exists but is not an directory.`);
            }
        }
        else {
            fs.mkdirSync(this.directory);
        }
    }
    validateFile(path) {
        if (fs.existsSync(path)) {
            throw new FileExists_1.FileExistsException(`file allready exists: ${this.fileName}`);
        }
    }
}
const downloadTask = new DownloadTask();
process.on('message', (action) => {
    if (action === 'cancel') {
        downloadTask.cancel();
        return;
    }
    downloadTask.initialize();
});
