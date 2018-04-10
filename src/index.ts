export * from './actions';
export * from './api';
export * from './model';
export * from './provider/TaskFactory';
export * from './DownloadManager';

import { config } from "./etc/config";
import { Config } from "rh-utils";

export interface IDownloadConfig {
    keepNameAsFilename: false,
    ytdl?: {
        downloads: string
    },
    image?: {
        downloads: string
    }
}
// import base download config
Config.getInstance().import(config);

export class DownloadModule
{
    public static configure(config: IDownloadConfig)
    {
        Config.getInstance().import({
            DownloadModule: config
        });
    }
}
