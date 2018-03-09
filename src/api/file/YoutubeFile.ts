import { IFile } from "./File";
import { IYoutubeFileData } from "./YoutubeFileData";

export interface IYoutubeFile extends IFile {

    getDescription(): string;

    getImage(): string;

    getVideoId(): string;

    raw(): IYoutubeFileData
}
