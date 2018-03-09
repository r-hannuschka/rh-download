import {IFileData} from "./file/FileData";

export interface ITaskData {
    error: string;

    group: string; 

    id: string;

    state: string;

    file: IFileData;
}
