"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const File_1 = require("./File");
class YoutubeFile extends File_1.File {
    setDescription(desc) {
        this.desc = desc;
    }
    setImage(image) {
        this.image = image;
    }
    setVideoId(id) {
        this.videoId = id;
    }
    getDescription() {
        return this.desc;
    }
    getImage() {
        return this.image;
    }
    getVideoId() {
        return this.videoId;
    }
    raw() {
        return Object.assign(super.raw(), {
            description: this.getDescription(),
            imageUri: this.getImage(),
            video_id: this.getVideoId()
        });
    }
}
exports.YoutubeFile = YoutubeFile;
