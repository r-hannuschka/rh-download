import {Task, YoutubeFile } from '../model';
import { DOWNLOAD_TASK_YOUTUBE, IYoutubeFile, YOUTUBE_BASE_URI, IYoutubeData } from '../api';
import { Config, Sanitize } from 'rh-utils';

export class YoutubeTaskFactory {

    private configProvider: Config;

    public constructor() {
        this.configProvider = Config.getInstance();
    }

    /**
     * create task to download video from youtube
     * 
     * @static
     * @param {IYoutubeFileData} data 
     * @param {string} [group='global'] 
     * @returns {DownloadTask} 
     * @memberof TaskFactory
     */
    public createTask(data: IYoutubeData, group = 'global'): Task
    {
        const downloadFile = this.createFile(data);

        // create task
        const task = new Task();
        task.setFile(downloadFile)
        task.setGroupName(group);
        task.setTaskFile(DOWNLOAD_TASK_YOUTUBE);
        task.setUri(YOUTUBE_BASE_URI + data.video_id);

        return task;
    }

    private createFile(data: IYoutubeData): IYoutubeFile
    {
        const file: YoutubeFile = new YoutubeFile();
        file.setDestination(this.configProvider.get('download.youtube.dir'));
        file.setFileName( Sanitize.sanitizeFileName(data.name) );
        file.setImage(data.imageUri);
        file.setName(data.name);
        file.setVideoId(data.video_id);

        return file;
    }
}