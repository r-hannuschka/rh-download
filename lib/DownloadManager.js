"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async = require("async");
const child_process_1 = require("child_process");
const rh_utils_1 = require("rh-utils");
const api_1 = require("./api");
class DownloadManager extends rh_utils_1.Observable {
    constructor() {
        super();
        if (DownloadManager.instance) {
            throw new Error("use DownloadManager::getInstance()");
        }
        this.logService = rh_utils_1.Log.getInstance();
        this.taskQueue = async.queue((data, done) => {
            this.runTask(data, done);
        }, 2 // max downloads at once
        );
        this.downloadTasks = new Set();
        this.processes = new WeakMap();
    }
    static getInstance() {
        return DownloadManager.instance;
    }
    /**
     *
     *
     * @param {Task} task
     * @param {boolean} [autostart=true]
     * @memberof DownloadManager
     */
    registerDownload(task, autostart = true) {
        task.setTaskId(Math.random().toString(32).substr(2));
        this.downloadTasks.add(task);
        this.logService.log(`initialize download: ${task.getFile().getName()}`, rh_utils_1.Log.LOG_DEBUG);
        if (autostart) {
            this.startDownload(task);
        }
    }
    /**
     *
     *
     * @param {Task} task
     * @memberof DownloadManager
     */
    startDownload(task) {
        const _task = task;
        _task.setState(api_1.DOWNLOAD_STATE_QUEUED);
        this.updateTask(_task);
        this.taskQueue.push(_task);
        this.logService.log(`add download to queue: ${_task.getFile().getName()}`, rh_utils_1.Log.LOG_DEBUG);
    }
    /**
     *
     * @param <Task> task
     */
    cancelDownload(task) {
        if (!task) {
            return;
        }
        if (task.getState() === api_1.DOWNLOAD_STATE_QUEUED) {
            this.taskQueue.remove((item) => {
                if (item.data.taskId !== task.getTaskId()) {
                    return false;
                }
                return true;
            });
            task.setState(api_1.DOWNLOAD_STATE_CANCEL);
            this.updateTask(task);
            return;
        }
        ;
        this.processes.get(task)
            .send(api_1.DOWNLOAD_ACTION_CANCEL);
    }
    /**
     * find task by id
     *
     * @param id
     */
    findTaskById(id) {
        let task = null;
        this.downloadTasks.forEach((t) => {
            if (t.getTaskId() === id) {
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
    getTasks(groupName) {
        let currentTasks = Array.from(this.downloadTasks.values());
        if (groupName && groupName.replace(/^\s*(.*?)\s*$/, "$1").length) {
            currentTasks = currentTasks.filter((task) => {
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
    updateTask(task) {
        const state = task.getState();
        if (state === api_1.DOWNLOAD_STATE_CANCEL ||
            state === api_1.DOWNLOAD_STATE_ERROR ||
            state === api_1.DOWNLOAD_STATE_END) {
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
    removeDownload(task) {
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
    runTask(task, done) {
        const file = task.getFile();
        const name = rh_utils_1.Sanitize.sanitizeFileName(file.getFileName());
        const params = [
            "--dir", file.getDestination(),
            "--name", name,
            "--uri", task.getUri()
        ];
        let childProcess = null;
        childProcess = this.createChildProcess(task.getTaskFile(), params);
        this.processes.set(task, childProcess);
        childProcess.on("message", (response) => {
            this.onTaskMessage(response, task);
        })
            .once("exit", () => {
            childProcess.removeAllListeners();
            done();
        });
        // send message to child process
        childProcess.send("start");
        task.setState(api_1.DOWNLOAD_STATE_START);
        this.updateTask(task);
    }
    /**
     * handle messag from download task
     *
     * @param {IMessage} response
     */
    onTaskMessage(response, task) {
        const file = task.getFile();
        if (response.hasError) {
            task.setError(response.message.text);
            task.setState(api_1.DOWNLOAD_STATE_ERROR);
            this.logService.log(response.message.text, rh_utils_1.Log.LOG_ERROR);
        }
        else {
            file.setLoaded(response.data.loaded);
            file.setSize(response.data.total);
            if (response.state === api_1.DOWNLOAD_STATE_INITIALIZED) {
                file.setFileName(response.data.file.match(/[^\/]+$/)[0] || file.getFileName());
            }
            if (response.state !== api_1.DOWNLOAD_STATE_PROGRESS) {
                this.logService.log(JSON.stringify(response), rh_utils_1.Log.LOG_DEBUG);
            }
        }
        task.setState(response.state);
        this.updateTask(task);
    }
    createChildProcess(task, param) {
        const childProcess = child_process_1.fork(task, param, {
            stdio: [
                "pipe",
                "pipe",
                "pipe",
                "ipc"
            ]
        });
        childProcess.stderr.on('data', (err) => {
            this.logService.log(err.toString(), rh_utils_1.Log.LOG_ERROR);
        });
        return childProcess;
    }
}
/**
 *
 *
 * @private
 * @static
 * @type {DownloadManager}
 * @memberof DownloadManager
 */
DownloadManager.instance = new DownloadManager();
exports.DownloadManager = DownloadManager;
