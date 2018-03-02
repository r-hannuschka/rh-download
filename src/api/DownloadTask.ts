import {IDownload, IDownloadData} from './index';

export interface IDownloadTask
{
    getDownload(): IDownload;

    getGroupName(): string;

    getTaskId(): string;

    setTaskId(id: string);

    toJSON(): IDownloadData;

    update(): void;
}