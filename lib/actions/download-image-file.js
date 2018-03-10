"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const TaskFactory_1 = require("../provider/TaskFactory");
function downloadImageFile(name, uri) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const downloadManager = index_1.DownloadManager.getInstance();
            const data = { name };
            const task = TaskFactory_1.TaskFactory.getImageTaskFactory().createTask(data, uri);
            const sub = task.subscribe((data) => {
                if (data.state === index_1.DOWNLOAD_STATE_CANCEL || data.state === index_1.DOWNLOAD_STATE_ERROR) {
                    sub.unsubscribe();
                    reject(data);
                }
                if (data.state === index_1.DOWNLOAD_STATE_END) {
                    sub.unsubscribe();
                    resolve(data.file);
                }
            });
            downloadManager.registerDownload(task);
        });
    });
}
exports.downloadImageFile = downloadImageFile;
