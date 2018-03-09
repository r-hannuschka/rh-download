"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model");
const api_1 = require("../api");
const rh_utils_1 = require("rh-utils");
class YoutubeTaskFactory {
    constructor() {
        this.configProvider = rh_utils_1.Config.getInstance();
    }
    /**
     * create task to download video from youtube
     *
     * @static
     * @param {IYoutubeFileData} data
     * @param {string} [group='global']
     * @returns {DownloadTask}
     * @memberof TaskFactory
     */
    createTask(data, group = 'global') {
        const downloadFile = this.createFile(data);
        // create task
        const task = new model_1.Task();
        task.setFile(downloadFile);
        task.setGroupName(group);
        task.setTaskFile(api_1.DOWNLOAD_TASK_YOUTUBE);
        task.setUri(api_1.YOUTUBE_BASE_URI + data.video_id);
        return task;
    }
    createFile(data) {
        const file = new model_1.YoutubeFile();
        file.setDestination(this.configProvider.get('download.youtube.dir'));
        file.setFileName(rh_utils_1.Sanitize.sanitizeFileName(data.name));
        file.setImage(data.imageUri);
        file.setName(data.name);
        file.setVideoId(data.video_id);
        return file;
    }
}
exports.YoutubeTaskFactory = YoutubeTaskFactory;
