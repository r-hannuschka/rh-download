import { DOWNLOAD_TASK_YOUTUBE } from '../api';
import { DownloadTask, Download } from '../model';
import { Config, Sanitize } from 'rh-utils';

export abstract class TaskFactory {

    public static createYoutubeTask(name, uri, group = 'global'): DownloadTask {

        const configProvider = Config.getInstance();

        // create download file ...
        const download: Download = new Download();
        download.setName(name);
        download.setFileName(Sanitize.sanitizeFileName(name));
        download.setDestination(configProvider.get('download.youtube.destinationDirectory', true));
        download.setUri(uri);

        // create task
        const task = new DownloadTask();
        task.setDownload( download )
        task.setGroupName(group);
        task.setTaskFile(DOWNLOAD_TASK_YOUTUBE);

        return task;
    }
}