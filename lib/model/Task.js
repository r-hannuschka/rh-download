"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rh_utils_1 = require("rh-utils");
class Task extends rh_utils_1.Observable {
    getFile() {
        return this.file;
    }
    getGroupName() {
        return this.groupName;
    }
    getTaskId() {
        return this.taskId;
    }
    getError() {
        return this.error;
    }
    getState() {
        return this.state;
    }
    getTaskFile() {
        return this.taskFile;
    }
    getUri() {
        return this.uri;
    }
    setError(error) {
        this.error = error;
    }
    setFile(downloadFile) {
        this.file = downloadFile;
    }
    setGroupName(name) {
        this.groupName = name;
    }
    setState(state) {
        this.state = state;
    }
    setTaskId(id) {
        this.taskId = id;
    }
    setTaskFile(taskFile) {
        this.taskFile = taskFile;
    }
    setUri(uri) {
        this.uri = uri;
    }
    update() {
        this.publish(this.raw());
    }
    raw() {
        return {
            error: "",
            file: this.getFile().raw(),
            group: this.getGroupName(),
            state: this.getState(),
            id: this.getTaskId()
        };
    }
}
exports.Task = Task;
