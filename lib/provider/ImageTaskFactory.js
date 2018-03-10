"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("../model");
const api_1 = require("../api");
const rh_utils_1 = require("rh-utils");
class ImageTaskFactory {
    constructor() {
        this.configProvider = rh_utils_1.Config.getInstance();
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
    createTask(data, uri, group = 'global') {
        // create download
        const downloadFile = this.createFile(data);
        // create task
        const task = new model_1.Task();
        task.setFile(downloadFile);
        task.setGroupName(group);
        task.setTaskFile(api_1.DOWNLOAD_TASK_FILE);
        task.setUri(uri);
        return task;
    }
    createFile(data) {
        const file = new model_1.File();
        const fileName = (!this.configProvider.get('download.keepNameAsFilename'))
            ? this.generateFileName()
            : rh_utils_1.Sanitize.sanitizeFileName(data.name);
        file.setName(data.name);
        file.setDestination(data.path || this.configProvider.get('download.paths.image'));
        file.setFileName(fileName);
        return file;
    }
    generateFileName() {
        let isUniqe = true;
        let fileName = '';
        let i = 0;
        const dest = this.configProvider.get('download.paths.image');
        const max = 100;
        do {
            fileName = `img_${Math.random().toString(32).substr(2)}`;
            isUniqe = !rh_utils_1.Validator.fileExists(fileName, dest, true);
        } while (!isUniqe || (i++ < max));
        return fileName;
    }
}
exports.ImageTaskFactory = ImageTaskFactory;
