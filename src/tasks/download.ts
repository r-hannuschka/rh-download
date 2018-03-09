import { IncomingHttpHeaders, IncomingMessage } from "http";
import * as fs from 'fs';
import { format } from 'util';
import {
    DOWNLOAD_ACTION_CANCEL,
    DOWNLOAD_ACTION_DESTROY,
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_INITIALIZED,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_PROGRESS,
    IMessage,
} from "../api";
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
        process.on('message', this.handleAction.bind(this));
    }

    /**
     * initialize download task
     *
     * @memberof DownloadTask
     */
    public initialize() {
        this.loadProcessParameters();
        this.validateDirectory();
        this.startDownload();
    }

    protected abstract startDownload(): void;

    protected destroy()
    {
        this.fileStream.destroy();
        this.fileStream = null;
        process.exit(0);
    };

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
     * @throws EEXIST
     * @param {IncomingMessage} response
     */
    protected createFileStream(response: IncomingMessage): fs.WriteStream
    {
        const headers: IncomingHttpHeaders = response.headers;
        const total: number = parseInt(headers["content-length"] as string, 10);
        const type = headers['content-type'].split('/');
        const file = `${this.directory}/${this.fileName}.${type[1]}`;

        if ( fs.existsSync(file) ) {
            const data = {
                hasError: true,
                message: {
                    type: 'notice',
                    text: format('Download aborted: File %s allready exists.', file)
                },
                state: DOWNLOAD_STATE_END
            };
            this.update(data);
            return null;
        }

        this.fileName   = `${this.fileName}.${type[1]}`;
        this.fileStream = fs.createWriteStream(file, {flags: 'wx' });
        this.target     = file;
        this.total      = total;

        this.update({state: DOWNLOAD_STATE_INITIALIZED});
        return this.fileStream
    }

    /**
     * 
     * 
     * @protected
     * @memberof DownloadTask
     */
    protected cancel() 
    {
        // remove file 
        if (fs.existsSync(this.target)) {
            fs.unlinkSync(this.target);
        }
        this.update({state: DOWNLOAD_STATE_CANCEL});
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
    protected finish(): void 
    {
        this.update({state: DOWNLOAD_STATE_END});
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
    protected update(data: IMessage): void
    {
        process.send(Object.assign({
            data: {
                file: this.target,
                loaded: this.loaded,
                total: this.total
            },
            hasError: false,
            state: DOWNLOAD_STATE_PROGRESS
        }, data));
    }

    /**
     * 
     * 
     * @private
     * @param {string} action 
     * @memberof DownloadTask
     */
    private handleAction(action: string) {
        switch ( action ) {
            case DOWNLOAD_ACTION_CANCEL: 
                this.cancel();
                break;
            case DOWNLOAD_ACTION_DESTROY: 
                this.destroy();
                break;
            default: 
                this.initialize();
        };
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
