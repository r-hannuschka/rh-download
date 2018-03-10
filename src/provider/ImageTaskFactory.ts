import { Task, File } from '../model';
import { DOWNLOAD_TASK_FILE, IFile, IFileData } from '../api';
import { Config, Sanitize, Validator } from 'rh-utils';

export class ImageTaskFactory
{
    private configProvider: Config;

    public constructor() {
        this.configProvider = Config.getInstance();
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
    public createTask(data: IFileData, uri: string, group = 'global'): Task
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

    private createFile(data: IFileData): IFile
    {
        const file: File = new File();
        const fileName = ( ! this.configProvider.get('download.keepNameAsFilename') )
            ? this.generateFileName()
            : Sanitize.sanitizeFileName(data.name);

        file.setName(data.name);
        file.setDestination(data.path  || this.configProvider.get('download.paths.image'));
        file.setFileName(fileName);

        return file;
    }

    private generateFileName(): string
    {
        let isUniqe  = true;
        let fileName = '';
        let i        = 0;

        const dest   = this.configProvider.get('download.paths.image');
        const max    = 100;

        do {
            fileName = `img_${Math.random().toString(32).substr(2)}`;
            isUniqe  = ! Validator.fileExists(fileName, dest, true);
        } while( ! isUniqe || (i++ < max) );

        return fileName;
    }
}
