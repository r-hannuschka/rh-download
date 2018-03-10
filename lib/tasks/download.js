"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const util_1 = require("util");
const api_1 = require("../api");
const DirectoryNotExsists_1 = require("../model/exception/DirectoryNotExsists");
class DownloadTask {
    constructor() {
        this.directory = '';
        this.fileName = '';
        this.total = 0;
        this.loaded = 0;
        process.on('message', this.handleAction.bind(this));
    }
    /**
     * initialize download task
     *
     * @memberof DownloadTask
     */
    initialize() {
        this.loadProcessParameters();
        this.validateDirectory();
        this.startDownload();
    }
    destroy() {
        this.fileStream.destroy();
        this.fileStream = null;
        process.exit(0);
    }
    ;
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
     * video response has been found and download started
     *
     * @throws EEXIST
     * @param {IncomingMessage} response
     */
    createFileStream(response) {
        const headers = response.headers;
        const total = parseInt(headers["content-length"], 10);
        const type = headers['content-type'].split('/');
        const file = `${this.directory}/${this.fileName}.${type[1]}`;
        if (fs.existsSync(file)) {
            const data = {
                hasError: true,
                message: {
                    type: 'notice',
                    text: util_1.format('Download aborted: File %s allready exists.', file)
                },
                state: api_1.DOWNLOAD_STATE_END
            };
            this.update(data);
            return null;
        }
        this.fileName = `${this.fileName}.${type[1]}`;
        this.fileStream = fs.createWriteStream(file, { flags: 'wx' });
        this.target = file;
        this.total = total;
        this.update({ state: api_1.DOWNLOAD_STATE_INITIALIZED });
        return this.fileStream;
    }
    /**
     *
     *
     * @protected
     * @memberof DownloadTask
     */
    cancel() {
        // remove file 
        if (fs.existsSync(this.target)) {
            fs.unlinkSync(this.target);
        }
        this.update({ state: api_1.DOWNLOAD_STATE_CANCEL });
        this.destroy();
    }
    /**
     *
     *
     * @protected
     * @param {string} [message=""]
     * @param {any} state
     * @memberof DownloadTask
     */
    finish() {
        this.update({ state: api_1.DOWNLOAD_STATE_END });
        this.destroy();
    }
    /**
     *
     *
     * @protected
     * @param {any} message
     * @param {any} state
     * @memberof DownloadTask
     */
    update(response) {
        process.send(Object.assign({
            data: {
                file: this.target,
                loaded: this.loaded,
                total: this.total
            },
            hasError: false,
            state: api_1.DOWNLOAD_STATE_PROGRESS
        }, response));
    }
    /**
     *
     *
     * @private
     * @param {string} action
     * @memberof DownloadTask
     */
    handleAction(action) {
        switch (action) {
            case api_1.DOWNLOAD_ACTION_CANCEL:
                this.cancel();
                break;
            case api_1.DOWNLOAD_ACTION_DESTROY:
                this.destroy();
                break;
            default:
                this.initialize();
        }
        ;
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
}
exports.DownloadTask = DownloadTask;
