import { Observable } from "rh-utils";
import { IFile, ITask, ITaskData } from "../api";

export class Task extends Observable<ITaskData>
    implements ITask
{
    private file: IFile;

    private taskFile: string;

    private groupName: string;

    private taskId: string;

    private state: string;

    private error: string;

    private uri: string;

    public getFile(): IFile {
        return this.file;
    }

    public getGroupName(): string {
        return this.groupName;
    }

    public getTaskId(): string {
        return this.taskId;
    }


    public getError(): string
    {
        return this.error;
    }

    public getState(): string
    {
        return this.state;
    }

    public getTaskFile() {
        return this.taskFile;
    }

    public getUri() {
        return this.uri;
    }

    public setError(error: string) {
        this.error = error;
    }

    public setFile(downloadFile: IFile) {
        this.file = downloadFile
    }

    public setGroupName(name: string) {
        this.groupName = name;
    }

    public setState(state: string) {
        this.state = state;
    }

    public setTaskId(id: string) {
        this.taskId = id;
    }

    public setTaskFile(taskFile: string) {
        this.taskFile = taskFile;
    }

    public setUri(uri: string) {
        this.uri = uri;
    }

    public update() {
        this.publish(this.raw());
    }

    public raw(): ITaskData {
        return {
            error: "",
            file: this.getFile().raw(),
            group: this.getGroupName(),
            state: this.getState(),
            id: this.getTaskId()
        };
    }
}
