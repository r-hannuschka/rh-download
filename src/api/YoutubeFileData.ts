import { IFileData } from './index'

export interface IYoutubeFileData extends IFileData
{
    description: string; 

    imageUri: string;

    video_id: string;
}
