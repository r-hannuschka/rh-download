"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.DOWNLOAD_STATE_CANCEL = "cancel";
exports.DOWNLOAD_STATE_END = "end";
exports.DOWNLOAD_STATE_ERROR = "error";
exports.DOWNLOAD_STATE_INITIALIZED = "initialized";
exports.DOWNLOAD_STATE_PROGRESS = "progress";
exports.DOWNLOAD_STATE_QUEUED = "queued";
exports.DOWNLOAD_STATE_START = "start";
exports.DOWNLOAD_STATE_UPDATE = "update";
exports.DOWNLOAD_TASK_MEDIA = path.join(__dirname, "../tasks/media.js");
exports.DOWNLOAD_TASK_YOUTUBE = path.join(__dirname, "../tasks/ytdl.js");
exports.EVENT_DOWNLOAD_FINISHED = "download:end";
exports.EVENT_VIDEO_DOWNLOAD_FINISHED = "download-video:end";
//# sourceMappingURL=index.js.map