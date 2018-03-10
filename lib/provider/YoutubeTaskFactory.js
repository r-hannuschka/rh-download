"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rh_utils_1 = require("rh-utils");
const api_1 = require("../api");
const model_1 = require("../model");
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
        const fileName = (!this.configProvider.get('download.keepNameAsFilename'))
            ? this.generateFileName()
            : rh_utils_1.Sanitize.sanitizeFileName(data.name);
        file.setDestination(this.configProvider.get('download.paths.youtube'));
        file.setFileName(fileName);
        file.setImage(data.imageUri);
        file.setName(data.name);
        file.setVideoId(data.video_id);
        return file;
    }
    generateFileName() {
        let isUniqe = true;
        let fileName = '';
        let i = 0;
        const dest = this.configProvider.get('download.paths.youtube');
        const max = 100;
        do {
            fileName = `ytf_${Math.random().toString(32).substr(2)}`;
            isUniqe = !rh_utils_1.Validator.fileExists(fileName, dest, true);
        } while (!isUniqe || (i++ < max));
        return fileName;
    }
}
exports.YoutubeTaskFactory = YoutubeTaskFactory;
