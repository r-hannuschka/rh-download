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
        this.logService.log(`add download to queue: ${task.getFile().getName()}`, rh_utils_1.Log.LOG_DEBUG);
        this.updateTask(task, api_1.DOWNLOAD_STATE_QUEUED);
        this.taskQueue.push(task);
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
            this.updateTask(task, api_1.DOWNLOAD_STATE_CANCEL, {});
            return;
        }
        ;
        this.processes.get(task).send(api_1.DOWNLOAD_ACTION_CANCEL);
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
    updateTask(task, state, data = null) {
        const file = task.getFile();
        if (state === api_1.DOWNLOAD_STATE_CANCEL ||
            state === api_1.DOWNLOAD_STATE_ERROR ||
            state === api_1.DOWNLOAD_STATE_END) {
            if (this.processes.has(task)) {
                this.processes.get(task).kill("SIGINT");
            }
            this.removeDownload(task);
        }
        if (state === api_1.DOWNLOAD_STATE_INITIALIZED) {
            file.setFileName(data.file.match(/[^\/]+$/)[0] || file.getFileName());
        }
        data = data || { loaded: 0, size: 0, error: '' };
        file.setLoaded(data.loaded);
        file.setSize(data.size);
        task.setState(state);
        if (data.hasError) {
            task.setError(data.error.message);
            this.logService.log(data.error.message);
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
        console.dir(task.raw());
        const download = task.getFile();
        const name = rh_utils_1.Sanitize.sanitizeFileName(download.getName());
        const params = [
            "--dir", download.getDestination(),
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
        this.updateTask(task, api_1.DOWNLOAD_STATE_START);
    }
    /**
     * handle messag from download task
     *
     * @param {IMessage} response
     */
    onTaskMessage(response, task) {
        const state = response.state || api_1.DOWNLOAD_STATE_ERROR;
        const data = {
            hasError: response.hasError,
            loaded: response.data.loaded || 0,
            size: response.data.total || 0,
            file: response.data.file
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
