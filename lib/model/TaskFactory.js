"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const model_1 = require("../model");
const rh_utils_1 = require("rh-utils");
class TaskFactory {
    static createYoutubeTask(data, group = 'global') {
        const configProvider = rh_utils_1.Config.getInstance();
        const uri = api_1.YOUTUBE_BASE_URI + data.video_id;
        // create download file ...
        const download = new model_1.Download();
        download.setDestination(configProvider.get('download.youtube.destinationDirectory'));
        download.setName(data.name);
        download.setFileName(rh_utils_1.Sanitize.sanitizeFileName(data.name));
        download.setRaw(data);
        download.setUri(uri);
        // create task
        const task = new model_1.DownloadTask();
        task.setDownload(download);
        task.setGroupName(group);
        task.setTaskFile(api_1.DOWNLOAD_TASK_YOUTUBE);
        return task;
    }
}
exports.TaskFactory = TaskFactory;
