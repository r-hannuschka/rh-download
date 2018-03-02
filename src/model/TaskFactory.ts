import { DOWNLOAD_TASK_YOUTUBE, IYoutubeFileData, YOUTUBE_BASE_URI } from '../api';
import { DownloadTask, Download } from '../model';
import { Config, Sanitize } from 'rh-utils';

export abstract class TaskFactory {

    public static createYoutubeTask(data: IYoutubeFileData, group = 'global'): DownloadTask
    {
        const configProvider = Config.getInstance();
        const uri = YOUTUBE_BASE_URI + data.video_id;

        // create download file ...
        const download: Download = new Download();
        download.setDestination(configProvider.get('download.youtube.destinationDirectory'));
        download.setName(data.name);
        download.setFileName(Sanitize.sanitizeFileName(data.name));
        download.setRaw(data);
        download.setUri(uri);

        // create task
        const task = new DownloadTask();
        task.setDownload( download )
        task.setGroupName(group);
        task.setTaskFile(DOWNLOAD_TASK_YOUTUBE);

        return task;
    }
}