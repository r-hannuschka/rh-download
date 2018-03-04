import {IDownload, IDownloadData} from './index';
import { IObservable } from 'rh-utils';

export interface IDownloadTask extends IObservable
{
    getDownload(): IDownload;

    getGroupName(): string;

    getTaskId(): string;

    setTaskId(id: string);

    toJSON(): IDownloadData;

    update(): void;
}