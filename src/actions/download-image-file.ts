import { DOWNLOAD_STATE_CANCEL, DOWNLOAD_STATE_END, DOWNLOAD_STATE_ERROR, DownloadManager, IFileData, ITask, ITaskData } from '../index';
import { TaskFactory } from '../provider/TaskFactory';
import { ISubscription } from 'rh-utils';

export async function downloadImageFile(name: string, uri: string): Promise<IFileData>
{
    return new Promise<IFileData>( (resolve, reject) => {

        const downloadManager = DownloadManager.getInstance();
        const data: IFileData = { name };
        const task: ITask     = TaskFactory.getImageTaskFactory().createTask(data, uri);

        const sub: ISubscription = task.subscribe( (data: ITaskData) => {

            if ( data.state === DOWNLOAD_STATE_CANCEL || data.state === DOWNLOAD_STATE_ERROR ) {
                sub.unsubscribe();
                reject(data);
            }

            if ( data.state === DOWNLOAD_STATE_END ) {
                sub.unsubscribe();
                resolve(data.file);
            }
        });

        downloadManager.registerDownload(task);
    });
}
