import * as async from "async";
import { ChildProcess, fork } from "child_process";
import { Log, Observable, Sanitize } from 'rh-utils';
import { File, Task } from "./model";
import {
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
    DOWNLOAD_STATE_INITIALIZED,
    DOWNLOAD_STATE_QUEUED,
    DOWNLOAD_STATE_START,
    DOWNLOAD_STATE_PROGRESS,
    IFile,
    IMessage,
    ITask,
    DOWNLOAD_ACTION_CANCEL,
} from "./api";

export class DownloadManager extends Observable<ITask> {

    private taskQueue: any;

    /**
     * all download task
     * 
     * @private
     * @type {Set<Task>}
     * @memberof DownloadManager
     */
    private downloadTasks: Set<ITask>;

    /**
     * all running download tasks 
     * 
     * @private
     * @type {WeakMap<Task, ChildProcess>}
     * @memberof DownloadManager
     */
    private processes: WeakMap<ITask, ChildProcess>

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
     * @param {Task} task 
     * @param {boolean} [autostart=true] 
     * @memberof DownloadManager
     */
    public registerDownload(task: ITask, autostart = true)
    {
        task.setTaskId(Math.random().toString(32).substr(2));
        this.downloadTasks.add(task);

        this.logService.log(
            `initialize download: ${task.getFile().getName()}`,
            Log.LOG_DEBUG
        );

        if ( autostart ) {
            this.startDownload(task);
        }
    }

    /**
     * 
     * 
     * @param {Task} task 
     * @memberof DownloadManager
     */
    public startDownload(task: ITask)
    {
        this.logService.log(
            `add download to queue: ${task.getFile().getName()}`,
            Log.LOG_DEBUG
        );

        this.updateTask(task as Task, DOWNLOAD_STATE_QUEUED);
        this.taskQueue.push(task);
    }

    /**
     * 
     * @param <Task> task
     */
    public cancelDownload(task: ITask) {

        if ( ! task ) {
            return;
        }

        if (task.getState() === DOWNLOAD_STATE_QUEUED) {
            this.taskQueue.remove((item: any) => {
                if (item.data.taskId !== task.getTaskId() ) {
                    return false;
                }
                return true;
            });

            this.updateTask(task as Task, DOWNLOAD_STATE_CANCEL, {});
            return;
        };

        this.processes.get(task).send(DOWNLOAD_ACTION_CANCEL);
    }

    /**
     * find task by id
     * 
     * @param id 
     */
    public findTaskById(id: string): ITask | null
    {
        let task: Task | null = null;
        this.downloadTasks.forEach( (t: Task) => {
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
    public getTasks(groupName?: string): ITask[]
    {
        let currentTasks = Array.from(this.downloadTasks.values());

        if (groupName && groupName.replace(/^\s*(.*?)\s*$/, "$1").length) {
            currentTasks = currentTasks.filter((task: Task) => {
                return task.getGroupName() === groupName;
            });
        }

        return currentTasks;
    }

    /**
     * update download task notify observers
     * 
     * @private
     * @param {Task} task 
     * @param {string} state 
     * @param {any} [data=null] 
     * @memberof DownloadManager
     */
    private updateTask(task: Task, state: string, data = null): void {

        const file: File = task.getFile() as File;

        if (state === DOWNLOAD_STATE_CANCEL ||
            state === DOWNLOAD_STATE_ERROR ||
            state === DOWNLOAD_STATE_END) {

            if (this.processes.has(task)) {
                this.processes.get(task).kill("SIGINT");
            }
            this.removeDownload(task);
        }

        if ( state === DOWNLOAD_STATE_INITIALIZED ) {
            file.setFileName(data.file.match(/[^\/]+$/)[0] || file.getFileName());
        }

        data = data || { loaded: 0, size: 0, error: '' };

        file.setLoaded(data.loaded);
        file.setSize(data.size);

        task.setState(state);

        if ( data.hasError ) {
            task.setError(data.error.message);
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
    private runTask(task: Task, done) {

        const download: IFile = task.getFile();
        const name = Sanitize.sanitizeFileName(download.getName());
        const params = [
            "--dir" , download.getDestination(),
            "--name", name,
            "--uri" , task.getUri()
        ];

        let childProcess = null;

        childProcess = this.createChildProcess(task.getTaskFile(), params);
        this.processes.set(task, childProcess);

        childProcess.on("message",  (response: IMessage) => {
            this.onTaskMessage(response, task);
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
    private onTaskMessage(response: IMessage, task: Task) {

        const state = response.state || DOWNLOAD_STATE_ERROR;
        const data = {
            hasError : response.hasError,
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

        childProcess.stderr.on('data', (err) => {
            this.logService.log(err.toString(), Log.LOG_ERROR);
        });

        return childProcess;
    }
}
