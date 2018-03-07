import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { Log, Observable, Sanitize } from 'rh-utils';
import { Download, DownloadTask } from "./model";
import {
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_INITIALIZED,
    DOWNLOAD_STATE_QUEUED,
    DOWNLOAD_STATE_START,
    DOWNLOAD_STATE_PROGRESS,
    IDownload,
    IDownloadTask,
    IMessage,
    DOWNLOAD_ACTION_CANCEL,
} from "./api";

export class DownloadManager extends Observable<IDownloadTask> {

    private taskQueue: any;

    /**
     * all download task
     * 
     * @private
     * @type {Set<DownloadTask>}
     * @memberof DownloadManager
     */
    private downloadTasks: Set<IDownloadTask>;

    /**
     * all running download tasks 
     * 
     * @private
     * @type {WeakMap<DownloadTask, ChildProcess>}
     * @memberof DownloadManager
     */
    private processes: WeakMap<IDownloadTask, ChildProcess>

    /**
     * Log Service
     *
     * @private
     * @type {Log}
     * @memberof DownloadManager
     */
    private logService: Log;

    /**
     * 
     * 
     * @private
     * @static
     * @type {DownloadManager}
     * @memberof DownloadManager
     */
    private static readonly instance: DownloadManager = new DownloadManager();

    public constructor() {

        super();

        if (DownloadManager.instance) {
            throw new Error("use DownloadManager::getInstance()");
        }

        this.logService = Log.getInstance();

        this.taskQueue = async.queue(
            (data, done) => {
                this.runTask(data, done);
            },
            2 // max downloads at once
        );

        this.downloadTasks = new Set();
        this.processes     = new WeakMap();
    }

    public static getInstance(): DownloadManager {
        return DownloadManager.instance;
    }

    /**
     * 
     * 
     * @param {DownloadTask} task 
     * @param {boolean} [autostart=true] 
     * @memberof DownloadManager
     */
    public registerDownload(task: IDownloadTask, autostart = true)
    {
        task.setTaskId(Math.random().toString(32).substr(2));
        this.downloadTasks.add(task);

        this.logService.log(
            `initialize download: ${task.getDownload().getName()}`,
            Log.LOG_DEBUG
        );

        if ( autostart ) {
            this.startDownload(task);
        }
    }

    /**
     * 
     * 
     * @param {DownloadTask} task 
     * @memberof DownloadManager
     */
    public startDownload(task: IDownloadTask)
    {
        this.logService.log(
            `add download to queue: ${task.getDownload().getName()}`,
            Log.LOG_DEBUG
        );

        this.updateTask(task, DOWNLOAD_STATE_QUEUED);
        this.taskQueue.push(task);
    }

    /**
     * 
     * @param <DownloadTask> task
     */
    public cancelDownload(task: IDownloadTask) {

        if ( ! task ) {
            return;
        }

        const download: Download = task.getDownload() as Download;

        if (download.getState() === DOWNLOAD_STATE_QUEUED) {
            this.taskQueue.remove((item: any) => {
                if (item.data.taskId !== task.getTaskId() ) {
                    return false;
                }
                return true;
            });

            this.updateTask(task, DOWNLOAD_STATE_CANCEL, {});
            return;
        };

        this.processes.get(task).send(DOWNLOAD_ACTION_CANCEL);
    }

    /**
     * find task by id
     * 
     * @param id 
     */
    public findTaskById(id: string): DownloadTask | null
    {
        let task: DownloadTask | null = null;
        this.downloadTasks.forEach( (t: DownloadTask) => {
            if ( t.getTaskId() === id ) {
                task = t;
            }
        });
        return task;
    }

    /**
     * get all downloads
     *
     * @param {String} groupname
     */
    public getDownloads(groupName?: string): IDownloadTask[]
    {

        let currentTasks = Array.from(this.downloadTasks.values());

        if (groupName && groupName.replace(/^\s*(.*?)\s*$/, "$1").length) {
            currentTasks = currentTasks.filter((task: DownloadTask) => {
                return task.getGroupName() === groupName;
            });
        }

        return currentTasks;
    }

    /**
     * update download task notify observers
     * 
     * @private
     * @param {DownloadTask} task 
     * @param {string} state 
     * @param {any} [data=null] 
     * @memberof DownloadManager
     */
    private updateTask(task: IDownloadTask, state: string, data = null): void {

        const download: Download = task.getDownload() as Download;

        if (state === DOWNLOAD_STATE_CANCEL ||
            state === DOWNLOAD_STATE_ERROR ||
            state === DOWNLOAD_STATE_END) {

            if (this.processes.has(task)) {
                this.processes.get(task).kill("SIGINT");
            }
            this.removeDownload(task);
        }

        if ( state === DOWNLOAD_STATE_INITIALIZED ) {
            download.setFileName(data.file.match(/[^\/]+$/)[0] || download.getFileName());
        }

        data = data || { loaded: 0, size: 0, error: '' };

        download.setState(state);
        download.setLoaded(data.loaded);
        download.setSize(data.size);

        if ( data.hasError ) {
            download.setError(data.error.message);
            this.logService.log(data.error.message, );
        }

        task.update();
        this.publish(task, task.getGroupName());
    }

    /**
     * remove download
     * 
     * @private
     * @param {any} task 
     * @memberof DownloadManager
     */
    private removeDownload(task) {

        if (this.downloadTasks.has(task)) {
            this.downloadTasks.delete(task);
        }
    }

    /**
     *
     *
     * @private
     * @param {any} data
     * @param {any} done
     * @memberof Download
     */
    private runTask(task: DownloadTask, done) {

        const download: IDownload = task.getDownload();
        const name = Sanitize.sanitizeFileName(download.getName());
        const params = [
            "--dir" , download.getDestination(),
            "--name", name,
            "--uri" , download.getUri()
        ];

        let childProcess = null;

        childProcess = this.createChildProcess(task.getTaskFile(), params);
        this.processes.set(task, childProcess);

        childProcess.on("message",  (response: IMessage) => {
            this.onDownloadTaskMessage(response, task);
        })
        .once("exit", () => {
            childProcess.removeAllListeners();
            done();
        });

        // send message to child process
        childProcess.send("start");

        this.updateTask(task, DOWNLOAD_STATE_START);
    }

    /**
     * handle messag from download task
     *
     * @param {IMessage} response
     */
    private onDownloadTaskMessage(response: IMessage, task: DownloadTask) {

        const state = response.state || DOWNLOAD_STATE_ERROR;
        const data = {
            error : response.error,
            loaded: response.data.loaded || 0,
            size  : response.data.total  || 0,
            file  : response.data.file
        };

        if ( response.state !== DOWNLOAD_STATE_PROGRESS ) {
            this.logService.log(JSON.stringify(response), Log.LOG_DEBUG);
        }

        this.updateTask(task, state, data);
    }

    private createChildProcess(task, param): ChildProcess {
        const childProcess: ChildProcess = fork(
            task,
            param,
            {
                stdio: [
                    "pipe",
                    "pipe",
                    "pipe",
                    "ipc"
                ]
            }
        );
        return childProcess;
    }
}
