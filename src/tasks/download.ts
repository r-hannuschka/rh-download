import { IncomingHttpHeaders, IncomingMessage } from "http";
import * as fs from 'fs';
import {
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_INITIALIZED
} from "../api";
import { FileExistsException } from '../model/exception/FileExists';
import { DirectoryNotExistsException } from '../model/exception/DirectoryNotExsists';

export abstract class DownloadTask
{
    protected directory: string = '';

    protected fileName: string = '';

    protected fileStream: fs.WriteStream;

    protected total: number = 0;

    protected loaded: number = 0;

    protected uri: string;

    private target: fs.PathLike;

    public constructor() 
    {
        process.on('message', (action) => {
            if ( action === 'cancel') {
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
    public initialize() {
        try {
            this.loadProcessParameters();
            this.validateDirectory();
            this.startDownload();
        } catch(exception) {
            if ( exception instanceof FileExistsException ) {
                this.finishDownload(exception.message, DOWNLOAD_STATE_END);
            } else {
                this.finishDownload(exception.message || exception, DOWNLOAD_STATE_ERROR);
            }
        };
    }

    protected abstract startDownload(): void;

    protected createFileStream(headers: IncomingHttpHeaders)
    {
        const type = headers['content-type'].split('/');
        this.target = `${this.directory}/${this.fileName}.${type[1]}`;
        this.fileStream = fs.createWriteStream(this.target, {flags: 'wx' });
    }

    /**
     * parse process arguments
     */
    protected loadProcessParameters() {
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
     * @param {IncomingMessage} response
     */
    protected readResponse(response: IncomingMessage)
    {
        const headers: IncomingHttpHeaders = response.headers;
        const total: number = parseInt(headers["content-length"] as string, 10);
        this.total = total;
        this.createFileStream(headers);
        this.updateDownload('download initialized', DOWNLOAD_STATE_INITIALIZED);
    }

    /**
     * 
     * 
     * @protected
     * @memberof DownloadTask
     */
    protected cancelDownload() 
    {
        this.fileStream.destroy();
        this.fileStream = null;

        // remove file 
        if (fs.existsSync(this.target)) {
            fs.unlinkSync(this.target);
        }
        this.finishDownload('Download Cancled', DOWNLOAD_STATE_CANCEL);
    }

    /**
     * 
     * 
     * @protected
     * @param {string} [message=""] 
     * @param {any} state 
     * @memberof DownloadTask
     */
    protected finishDownload(message: string = "", state): void 
    {
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
    protected updateDownload(message, state): void
    {
        process.send({
            data: {
                message,
                file: this.target,
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
    private validateDirectory()
    {
        if ( fs.existsSync(this.directory) ) {
            const directoryStats = fs.statSync(this.directory);
            if ( ! directoryStats.isDirectory() ) {
                throw new DirectoryNotExistsException(`${this.directory} exists but is not an directory.`);
            }
        } else {
            fs.mkdirSync(this.directory);
        }
    }
}
