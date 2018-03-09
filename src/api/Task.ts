import {IFile, ITaskData} from './index';
import { IObservable } from 'rh-utils';

export interface ITask extends IObservable
{
    getError(): string;

    getFile(): IFile;

    getGroupName(): string;

    getState(): string;

    getTaskId(): string;

    getUri(): string;

    setTaskId(id: string);

    raw(): ITaskData;

    update(): void;
}