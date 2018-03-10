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
    IFile,
    IMessage,
    ITask,
    DOWNLOAD_ACTION_CANCEL,
    DOWNLOAD_STATE_PROGRESS,
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
        const _task: Task = task as Task;

        _task.setState(DOWNLOAD_STATE_QUEUED);
        this.updateTask(_task);
        this.taskQueue.push(_task);

        this.logService.log(
            `add download to queue: ${_task.getFile().getName()}`,
            Log.LOG_DEBUG
        );
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

            (task as Task).setState(DOWNLOAD_STATE_CANCEL);
            this.updateTask(task as Task);
            return;
        };

        this.processes.get(task)
            .send(DOWNLOAD_ACTION_CANCEL);
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
    private updateTask(task: Task): void {

        const state = task.getState(); 

        if (state === DOWNLOAD_STATE_CANCEL ||
            state === DOWNLOAD_STATE_ERROR ||
            state === DOWNLOAD_STATE_END) {

            if (this.processes.has(task)) {
                this.processes.get(task).kill("SIGINT");
            }
            this.removeDownload(task);
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

        const file: IFile = task.getFile();
        const name        = Sanitize.sanitizeFileName(file.getFileName());
        const params = [
            "--dir" , file.getDestination(),
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

        task.setState(DOWNLOAD_STATE_START);
        this.updateTask(task);
    }

    /**
     * handle messag from download task
     *
     * @param {IMessage} response
     */
    private onTaskMessage(response: IMessage, task: Task) {

        const file: File = task.getFile() as File;

        if ( response.hasError) {
            task.setError(response.message.text);
            task.setState( DOWNLOAD_STATE_ERROR );
            this.logService.log(response.message.text, Log.LOG_ERROR );
        } else {
            file.setLoaded(response.data.loaded);
            file.setSize(response.data.total);

            if ( response.state === DOWNLOAD_STATE_INITIALIZED ) {
                file.setFileName(response.data.file.match(/[^\/]+$/)[0] || file.getFileName());
            }

            if ( response.state !== DOWNLOAD_STATE_PROGRESS ) {
                this.logService.log( JSON.stringify(response), Log.LOG_DEBUG );
            }
        }

        task.setState(response.state);
        this.updateTask(task);
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
