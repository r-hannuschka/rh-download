"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.config = {
    DownloadModule: {
        keepNameAsFilename: false,
        paths: {
            image: path.resolve(process.cwd(), './downloads/image'),
            ytdl: path.resolve(process.cwd(), './downloads/ytdl')
        }
    }
};
