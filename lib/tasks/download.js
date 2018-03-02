"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const api_1 = require("../api");
const FileExists_1 = require("../model/exception/FileExists");
const DirectoryNotExsists_1 = require("../model/exception/DirectoryNotExsists");
class DownloadTask {
    constructor() {
        this.directory = '';
        this.fileName = '';
        this.total = 0;
        this.loaded = 0;
        process.on('message', (action) => {
            if (action === 'cancel') {
                this.cancelDownload();
                return;
            }
            this.initialize();
        });
    }
    /**
     * initialize download task
     *
     * @memberof DownloadTask
     */
    initialize() {
        try {
            this.loadProcessParameters();
            this.validateDirectory();
            this.validateFile(`${this.directory}/${this.fileName}`);
            this.startDownload();
        }
        catch (exception) {
            if (exception instanceof FileExists_1.FileExistsException) {
                this.finishDownload(exception.message, api_1.DOWNLOAD_STATE_END);
            }
            else {
                this.finishDownload(exception.message || exception, api_1.DOWNLOAD_STATE_ERROR);
            }
        }
        ;
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
     * video response has been found and start downloading
     *
     * @param {IncomingMessage} response
     */
    readResponse(response) {
        const headers = response.headers;
        const total = parseInt(headers["content-length"], 10);
        this.total = total;
        this.updateDownload('Download starting', api_1.DOWNLOAD_STATE_START);
    }
    /**
     *
     *
     * @protected
     * @memberof DownloadTask
     */
    cancelDownload() {
        this.fileStream.destroy();
        this.fileStream = null;
        // remove file 
        if (fs.existsSync(`${this.directory}/${this.fileName}`)) {
            fs.unlinkSync(`${this.directory}/${this.fileName}`);
        }
        this.finishDownload('Download Cancled', api_1.DOWNLOAD_STATE_CANCEL);
    }
    /**
     *
     *
     * @protected
     * @param {string} [message=""]
     * @param {any} state
     * @memberof DownloadTask
     */
    finishDownload(message = "", state) {
        this.updateDownload(message, state);
        process.exit(0);
    }
    /**
     *
     *
     * @protected
     * @param {any} message
     * @param {any} state
     * @memberof DownloadTask
     */
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
exports.DownloadTask = DownloadTask;
