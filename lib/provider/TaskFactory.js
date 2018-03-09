"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const YoutubeTaskFactory_1 = require("./YoutubeTaskFactory");
const ImageTaskFactory_1 = require("./ImageTaskFactory");
class TaskFactory {
    static getYoutubeTaskFactory() {
        return new YoutubeTaskFactory_1.YoutubeTaskFactory();
    }
    static getImageTaskFactory() {
        return new ImageTaskFactory_1.ImageTaskFactory();
    }
}
exports.TaskFactory = TaskFactory;
