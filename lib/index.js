"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./actions"));
__export(require("./api"));
__export(require("./model"));
__export(require("./provider/TaskFactory"));
__export(require("./DownloadManager"));
const config_1 = require("./etc/config");
const rh_utils_1 = require("rh-utils");
// import base download config
rh_utils_1.Config.getInstance().import(config_1.config);
class DownloadModule {
    static configure(config) {
        rh_utils_1.Config.getInstance().import({
            DownloadModule: config
        });
    }
}
exports.DownloadModule = DownloadModule;
