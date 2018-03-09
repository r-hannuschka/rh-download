import { Task, File } from '../model';
import { DOWNLOAD_TASK_FILE, IFile, IFileData } from '../api';
import { Config, Sanitize } from 'rh-utils';

export class ImageTaskFactory
{

    private configProvider: Config;

    public constructor() {
        this.configProvider = Config.getInstance();
    }

    private createFile(data: IFileData): IFile
    {
        const file: File = new File();

        file.setName(data.title);
        file.setType("image");
        file.setDestination(data.path  || this.configProvider.get('download.image.dir'));
        file.setFileName(data.fileName || Sanitize.sanitizeFileName(data.title) );

        return file;
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
    public createImageTask(data: IFileData, uri: string, group = 'global'): Task
    {
        // create download
        const downloadFile = this.createFile(data);

        // create task
        const task = new Task();
        task.setFile(downloadFile);
        task.setGroupName(group);
        task.setTaskFile(DOWNLOAD_TASK_FILE);
        task.setUri(uri);

        return task;
    }
}
