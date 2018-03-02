import * as fs from "fs";
import { IncomingHttpHeaders, IncomingMessage } from "http";
import {
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_START,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_CANCEL
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
            this.validateFile(`${this.directory}/${this.fileName}`);
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
     * video response has been found and start downloading
     *
     * @param {IncomingMessage} response
     */
    protected readResponse(response: IncomingMessage)
    {
        const headers: IncomingHttpHeaders = response.headers;
        const total: number = parseInt(headers["content-length"] as string, 10);

        this.total = total;
        this.updateDownload('Download starting', DOWNLOAD_STATE_START);
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
        if (fs.existsSync(`${this.directory}/${this.fileName}`)) {
            fs.unlinkSync(`${this.directory}/${this.fileName}`);
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

    private validateFile(path: string)
    {
        if ( fs.existsSync(path) ) {
            throw new FileExistsException(`file allready exists: ${this.fileName}`);
        }
    }
}
