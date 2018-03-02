"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const model_1 = require("../model");
const rh_utils_1 = require("rh-utils");
class TaskFactory {
    static createYoutubeTask(name, uri, group = 'global') {
        const configProvider = rh_utils_1.Config.getInstance();
        // create download file ...
        const download = new model_1.Download();
        download.setName(name);
        download.setFileName(rh_utils_1.Sanitize.sanitizeFileName(name));
        download.setDestination(configProvider.get('download.youtube.destinationDirectory', true));
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
//# sourceMappingURL=TaskFactory.js.map