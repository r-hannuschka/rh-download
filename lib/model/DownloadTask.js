"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rh_utils_1 = require("rh-utils");
class DownloadTask extends rh_utils_1.Observable {
    getDownload() {
        return this.download;
    }
    getGroupName() {
        return this.groupName;
    }
    getTaskId() {
        return this.taskId;
    }
    /**
     *
     *
     * @private
     * @param {string} taskFile
     * @memberof DownloadTask
     */
    getTaskFile() {
        return this.taskFile;
    }
    /**
     *
     *
     * @param {Download} download
     * @memberof DownloadTask
     */
    setDownload(download) {
        this.download = download;
    }
    /**
     *
     *
     * @param {string} name
     * @memberof DownloadTask
     */
    setGroupName(name) {
        this.groupName = name;
    }
    setTaskId(id) {
        this.taskId = id;
    }
    /**
     *
     *
     * @private
     * @param {string} taskFile
     * @memberof DownloadTask
     */
    setTaskFile(taskFile) {
        this.taskFile = taskFile;
    }
    /**
     *
     *
     * @memberof DownloadTask
     */
    update() {
        this.publish(this.toJSON());
    }
    toJSON() {
        const download = this.getDownload();
        return {
            error: download.getError(),
            file: {
                name: download.getFileName(),
                path: download.getDestination(),
                type: download.getType(),
            },
            group: this.getGroupName(),
            id: this.getTaskId(),
            loaded: download.getLoaded(),
            name: download.getName(),
            size: download.getSize(),
            state: download.getState()
        };
    }
}
exports.DownloadTask = DownloadTask;
