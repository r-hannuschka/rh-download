import { DOWNLOAD_TASK_YOUTUBE, DOWNLOAD_TASK_FILE, IFileData, IYoutubeFileData, YOUTUBE_BASE_URI } from '../api';
import { DownloadTask, Download } from '../model';
import { Config, Sanitize } from 'rh-utils';

export abstract class TaskFactory {

    /**
     * create task to download video from youtube
     * 
     * @static
     * @param {IYoutubeFileData} data 
     * @param {string} [group='global'] 
     * @returns {DownloadTask} 
     * @memberof TaskFactory
     */
    public static createYoutubeTask(data: IYoutubeFileData, group = 'global'): DownloadTask
    {
        const configProvider = Config.getInstance();
        const uri = YOUTUBE_BASE_URI + data.video_id;
        const download = TaskFactory.createDownload(data.name, uri, data);
        download.setDestination(configProvider.get('download.youtube.dir'));

        // create task
        const task = new DownloadTask();
        task.setDownload( download )
        task.setGroupName(group);
        task.setTaskFile(DOWNLOAD_TASK_YOUTUBE);

        return task;
    }

    /**
     * create download task for an image
     * 
     * @static
     * @param {IFileData} data 
     * @param {string} uri 
     * @param {string} [group='global'] 
     * @returns {DownloadTask} 
     * @memberof TaskFactory
     */
    public static createImageTask(data: IFileData, uri: string, group = 'global'): DownloadTask
    {
        const configProvider = Config.getInstance();
        const download = TaskFactory.createDownload(data.name, uri, data);
        download.setDestination(configProvider.get('download.image.dir'));

        // create task
        const task = new DownloadTask();
        task.setDownload( download )
        task.setGroupName(group);
        task.setTaskFile(DOWNLOAD_TASK_FILE);

        return task;
    }

    /**
     * create download
     * 
     * @private
     * @static
     * @param {string} name 
     * @param {string} uri 
     * @param {IFileData} raw 
     * @returns {Download} 
     * @memberof TaskFactory
     */
    private static createDownload(name: string, uri: string, raw: IFileData): Download
    {
        const download: Download = new Download();

        download.setName(name);
        download.setFileName(Sanitize.sanitizeFileName(name));
        download.setRaw(raw);
        download.setUri(uri);

        return download;
    }
}