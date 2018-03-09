"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const model_1 = require("../model");
const rh_utils_1 = require("rh-utils");
class TaskFactory {
    /**
     * create task to download video from youtube
     *
     * @static
     * @param {IYoutubeFileData} data
     * @param {string} [group='global']
     * @returns {DownloadTask}
     * @memberof TaskFactory
     */
    static createYoutubeTask(data, group = 'global') {
        const configProvider = rh_utils_1.Config.getInstance();
        const uri = api_1.YOUTUBE_BASE_URI + data.video_id;
        // create download
        const download = TaskFactory.createDownload(data.name, uri, data);
        download.setDestination(configProvider.get('download.youtube.dir'));
        download.setType("video");
        // create task
        const task = new model_1.DownloadTask();
        task.setDownload(download);
        task.setGroupName(group);
        task.setTaskFile(api_1.DOWNLOAD_TASK_YOUTUBE);
        return task;
    }
    /**
     * create download task for an image
     *
     * @static
     * @param {IFileData} data
     * @param {string} uri
     * @param {string} [group='global']
     * @returns {DownloadTask}
     * @memberof TaskFactory
     */
    static createImageTask(data, uri, group = 'global') {
        const configProvider = rh_utils_1.Config.getInstance();
        // create download
        const download = TaskFactory.createDownload(data.name, uri, data);
        download.setDestination(configProvider.get('download.image.dir'));
        download.setType("image");
        // create task
        const task = new model_1.DownloadTask();
        task.setDownload(download);
        task.setGroupName(group);
        task.setTaskFile(api_1.DOWNLOAD_TASK_FILE);
        return task;
    }
    /**
     * create download
     *
     * @private
     * @static
     * @param {string} name
     * @param {string} uri
     * @param {IFileData} raw
     * @returns {Download}
     * @memberof TaskFactory
     */
    static createDownload(name, uri, raw) {
        const download = new model_1.Download();
        download.setName(name);
        download.setFileName(rh_utils_1.Sanitize.sanitizeFileName(name));
        download.setRaw(raw);
        download.setUri(uri);
        return download;
    }
}
exports.TaskFactory = TaskFactory;
