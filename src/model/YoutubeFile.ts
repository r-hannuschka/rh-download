import { File } from './File';
import { IYoutubeFile, IYoutubeFileData} from '../api';

export class YoutubeFile extends File implements IYoutubeFile {

    private desc: string;

    private image: string;

    private videoId: string;

    public setDescription(desc: string) {
        this.desc = desc;
    }

    public setImage(image: string) {
        this.image = image;
    }

    public setVideoId(id: string) {
        this.videoId = id;
    }

    public getDescription(): string {
        return this.desc;
    }

    public getImage(): string {
        return this.image;
    }

    public getVideoId(): string {
        return this.videoId;
    }

    public raw(): IYoutubeFileData 
    {
        return Object.assign(super.raw(), {
            description: "",
            imageUri: "",
            video_id: ""
        });
    }
}