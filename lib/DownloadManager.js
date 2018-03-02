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
     * @param {DownloadTask} task
     * @param {boolean} [autostart=true]
     * @memberof DownloadManager
     */
    registerDownload(task, autostart = true) {
        task.setTaskId(Math.random().toString(32).substr(2));
        this.downloadTasks.add(task);
        this.logService.log(`initialize download: ${task.getDownload().getName()}`, rh_utils_1.Log.LOG_DEBUG);
        if (autostart) {
            this.startDownload(task);
        }
    }
    /**
     *
     *
     * @param {DownloadTask} task
     * @memberof DownloadManager
     */
    startDownload(task) {
        this.logService.log(`add download to queue: ${task.getDownload().getName()}`, rh_utils_1.Log.LOG_DEBUG);
        this.updateTask(task, api_1.DOWNLOAD_STATE_QUEUED);
        this.taskQueue.push(task);
    }
    /**
     *
     * @param <DownloadTask> task
     */
    cancelDownload(task) {
        if (!task) {
            return;
        }
        const download = task.getDownload();
        if (download.getState() === api_1.DOWNLOAD_STATE_QUEUED) {
            this.taskQueue.remove((item) => {
                if (item.data.taskId !== task.getTaskId()) {
                    return false;
                }
                return true;
            });
        }
        ;
        this.processes.get(task).send('cancel');
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
    getDownloads(groupName) {
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
     * @param {DownloadTask} task
     * @param {string} state
     * @param {any} [data=null]
     * @memberof DownloadManager
     */
    updateTask(task, state, data = null) {
        if (state === api_1.DOWNLOAD_STATE_CANCEL ||
            state === api_1.DOWNLOAD_STATE_ERROR ||
            state === api_1.DOWNLOAD_STATE_END) {
            if (this.processes.has(task)) {
                this.processes.get(task).kill("SIGINT");
            }
            this.removeDownload(task);
        }
        data = data || { loaded: 0, size: 0, error: '' };
        const download = task.getDownload();
        download.setState(state);
        download.setLoaded(data.loaded);
        download.setSize(data.size);
        download.setError(data.error);
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
        const download = task.getDownload();
        const name = rh_utils_1.Sanitize.sanitizeFileName(download.getName());
        const params = [
            "--dir", download.getDestination(),
            "--name", name,
            "--uri", download.getUri()
        ];
        const childProcess = this.createChildProcess(task.getTaskFile(), params);
        this.processes.set(task, childProcess);
        childProcess.on("message", (response) => {
            this.onDownloadTaskMessage(response, task);
        });
        childProcess.stderr.on('data', (data) => {
            console.log(data.toString());
        });
        childProcess.once("exit", () => {
            childProcess.removeAllListeners();
            done();
        });
        // send message to child process
        childProcess.send("start");
        this.updateTask(task, api_1.DOWNLOAD_STATE_START);
    }
    /**
     * handle messag from download task
     *
     * @param {IMessage} response
     */
    onDownloadTaskMessage(response, task) {
        const state = response.state || api_1.DOWNLOAD_STATE_ERROR;
        const data = {
            error: response.error,
            loaded: response.data.loaded || 0,
            size: response.data.total || 0
        };
        if (response.state !== api_1.DOWNLOAD_STATE_PROGRESS) {
            this.logService.log(JSON.stringify(response), rh_utils_1.Log.LOG_DEBUG);
        }
        this.updateTask(task, state, data);
    }
    createChildProcess(task, param) {
        const childProcess = child_process_1.fork(task, param, {
            stdio: [
                "pipe",
                "pipe",
                "pipe",
                "ipc"
            ],
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
