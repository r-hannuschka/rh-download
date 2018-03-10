import { Config, Sanitize, Validator } from "rh-utils";
import { DOWNLOAD_TASK_YOUTUBE, IYoutubeFile, YOUTUBE_BASE_URI, IYoutubeData } from '../api';
import {Task, YoutubeFile } from '../model';

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
        const fileName = ( ! this.configProvider.get('download.keepNameAsFilename') )
            ? this.generateFileName()
            : Sanitize.sanitizeFileName(data.name);

        file.setDestination(this.configProvider.get('download.paths.youtube'));
        file.setFileName(fileName);
        file.setImage(data.imageUri);
        file.setName(data.name);
        file.setVideoId(data.video_id);

        return file;
    }

    private generateFileName(): string
    {
        let isUniqe  = true;
        let fileName = '';
        let i        = 0;

        const dest   = this.configProvider.get('download.paths.youtube');
        const max    = 100;

        do {
            fileName = `ytf_${Math.random().toString(32).substr(2)}`;
            isUniqe  = ! Validator.fileExists(fileName, dest, true);
        } while( ! isUniqe || (i++ < max) );

        return fileName;
    }
}