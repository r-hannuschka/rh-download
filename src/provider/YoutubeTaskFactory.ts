import {Task, YoutubeFile } from '../model';
import { DOWNLOAD_TASK_YOUTUBE, IYoutubeFile, IYoutubeFileData, YOUTUBE_BASE_URI } from '../api';
import { Config } from 'rh-utils';

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
    public createTask(data: IYoutubeFileData, group = 'global'): Task
    {
        const downloadFile   = this.createFile();

        // create task
        const task = new Task();
        task.setFile(downloadFile)
        task.setGroupName(group);
        task.setTaskFile(DOWNLOAD_TASK_YOUTUBE);
        task.setUri(YOUTUBE_BASE_URI + data.video_id);

        return task;
    }

    private createFile(): IYoutubeFile
    {
        const file: YoutubeFile = new YoutubeFile();
        file.setDestination(this.configProvider.get('download.youtube.dir'));
        file.setType("video");

        return file;
    }
}