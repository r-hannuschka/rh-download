import { YoutubeTaskFactory } from "./YoutubeTaskFactory";
import { ImageTaskFactory } from "./ImageTaskFactory";

export abstract class TaskFactory {

    public static getYoutubeTaskFactory(): YoutubeTaskFactory
    {
        return new YoutubeTaskFactory();
    }

    public static getImageTaskFactory(): ImageTaskFactory
    {
        return new ImageTaskFactory();
    }
}