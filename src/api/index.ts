import * as path from "path";

export * from "./Download";
export * from "./DownloadData";
export * from "./DownloadTask";
export * from "./FileData";
export * from "./Message";
export * from "./YoutubeFileData";

export const DOWNLOAD_GROUP_YOUTUBE      = 'youtube.download';
export const DOWNLOAD_ACTION_CANCEL      = "cancel";
export const DOWNLOAD_ACTION_DESTROY     = "destroy";
export const DOWNLOAD_STATE_CANCEL       = "cancel";
export const DOWNLOAD_STATE_END          = "end";
export const DOWNLOAD_STATE_ERROR        = "error";
export const DOWNLOAD_STATE_INITIALIZED  = "initialized";
export const DOWNLOAD_STATE_PROGRESS     = "progress";
export const DOWNLOAD_STATE_QUEUED       = "queued";
export const DOWNLOAD_STATE_START        = "start";
export const DOWNLOAD_STATE_UPDATE       = "update";

export const DOWNLOAD_TASK_FILE          = path.join(__dirname, "../tasks/file.js");
export const DOWNLOAD_TASK_YOUTUBE       = path.join(__dirname, "../tasks/ytdl.js");

export const EVENT_DOWNLOAD_FINISHED       = "download:end";
export const EVENT_VIDEO_DOWNLOAD_FINISHED = "download-video:end";

export const YOUTUBE_BASE_URI  = 'https://www.youtube.com/watch?v=';
