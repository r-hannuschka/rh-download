import { Observable } from "rh-utils";

/** 
 *  constants
 */
export const DOWNLOAD_GROUP_YOUTUBE        :string;
export const DOWNLOAD_STATE_CANCEL         :string;
export const DOWNLOAD_STATE_END            :string;
export const DOWNLOAD_STATE_ERROR          :string;
export const DOWNLOAD_STATE_INITIALIZED    :string;
export const DOWNLOAD_STATE_PROGRESS       :string;
export const DOWNLOAD_STATE_QUEUED         :string;
export const DOWNLOAD_STATE_START          :string;
export const DOWNLOAD_STATE_UPDATE         :string;
export const DOWNLOAD_TASK_FILE            :string;
export const DOWNLOAD_TASK_YOUTUBE         :string;
export const EVENT_DOWNLOAD_FINISHED       :string;
export const EVENT_VIDEO_DOWNLOAD_FINISHED :string;
export const YOUTUBE_BASE_URI              :string;

/** 
 * classes
 */
export class DownloadManager extends Observable<IDownloadTask>
{
    public static getInstance(): DownloadManager;

    public registerDownload(task: IDownloadTask, autostart?: boolean);

    public startDownload(task: DownloadTask);

    public cancelDownload(task: IDownloadTask);

    public findTaskById(id: string): IDownloadTask | null;

    public getDownloads(groupName?: string): IDownloadTask[];
}

export class DownloadTask extends Observable<IDownloadData> 
{
    public getDownload(): IDownload;

    public getGroupName(): string;

    public getTaskId(): string;

    public toJSON(): IDownloadData;
}

export class TaskFactory
{
    public static createYoutubeTask(data: IYoutubeFileData, group: string): IDownloadTask

    public static createImageTask(data: IFileData, uri: string, group: string): IDownloadTask
}

/**
 * interfaces 
 */
export interface IDownloadTask extends Observable<IDownloadData>
{
    getDownload(): IDownload;

    getGroupName(): string;

    getTaskId(): string;

    setTaskId(id: string);

    toJSON(): IDownloadData;
}

export interface IDownload 
{
    getDestination(): string;

    getError(): string;

    getFileName(): string;

    getLoaded(): number;

    getName(): string;

    getRaw(): IFileData;

    getSize(): number;

    getState(): string;

    getUri(): string;
}

export interface IDownloadData {

    error: string;

    group: string; 

    loaded: number;

    name: string;

    id: string;

    size: number;

    state: string;
}

export interface IFileData {
    name: string;
    
    type: string;
}

export interface IYoutubeFileData extends IFileData
{
    description: string; 

    imageUri: string;

    video_id: string;
}
