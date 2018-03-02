"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const request = require("request");
const api_1 = require("../api");
class ImageDownload {
    constructor() {
        this.directory = "/tmp";
    }
    /**
     * initialize download task
     *
     * @memberof DownloadTask
     */
    initialize() {
        this.loadProcessParameters();
        process.on("message", (id) => {
            this.processId = id;
            this.processDownload();
        });
    }
    /**
     * processing download
     */
    processDownload() {
        this.fileStream = fs.createWriteStream(`${this.directory}/${this.fileName}`);
        const req = request(this.uri);
        req.on("response", () => {
            process.send({
                data: {
                    loaded: 0,
                    total: 0
                },
                processId: this.processId,
                state: api_1.DOWNLOAD_STATE_START
            });
        })
            .on("data", () => {
            process.send({
                data: {
                    loaded: 0,
                    total: 0
                },
                processId: this.processId,
                state: "progress"
            });
        })
            .pipe(this.fileStream)
            .on("close", () => {
            process.send({
                data: {
                    loaded: 0,
                    total: 0
                },
                processId: this.processId,
                state: api_1.DOWNLOAD_STATE_END
            });
        });
    }
    /**
     * parse process arguments
     */
    loadProcessParameters() {
        const args = process.argv.slice(2);
        for (let i = 0, ln = args.length; i < ln; i++) {
            // tslint:disable-next-line:switch-default
            switch (args[i]) {
                case "--dir":
                    i++;
                    this.directory = args[i];
                    break;
                case "--name":
                    i++;
                    this.fileName = args[i];
                    break;
                case "--uri":
                    i++;
                    this.uri = args[i];
                    break;
            }
        }
    }
}
const downloadTask = new ImageDownload();
downloadTask.initialize();
