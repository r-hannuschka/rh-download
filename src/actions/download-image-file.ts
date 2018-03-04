import { 
    DOWNLOAD_STATE_CANCEL,
    DOWNLOAD_STATE_END,
    DOWNLOAD_STATE_ERROR,
    DownloadManager,
    IDownloadData,
    IDownloadTask,
    IFileData,
    TaskFactory
} from '../index';

import { ISubscription } from 'rh-utils';

export async function downloadImageFile(name: string, uri: string): Promise<IDownloadData>
{
    return new Promise<IDownloadData>( (resolve, reject) => {

        const downloadManager = DownloadManager.getInstance();
        const data: IFileData = { name, type: 'image' };
        const task: IDownloadTask  = TaskFactory.createImageTask(data, uri);

        const sub: ISubscription = task.subscribe( (data: IDownloadData) => {

            if ( data.state === DOWNLOAD_STATE_CANCEL || data.state === DOWNLOAD_STATE_ERROR ) {
                sub.unsubscribe();
                reject(data);
            }

            if ( data.state === DOWNLOAD_STATE_END ) {
                sub.unsubscribe();
                resolve(data);
            }
        });

        downloadManager.registerDownload(task);
    });
}