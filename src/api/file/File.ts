import { IFileData } from "./FileData";

/**
 * Download Data
 */
export interface IFile {

    /**
     *
     *
     * @type {string}
     * @memberof IDownload
     */
    getError(): string;

    /**
     * bytes allready loaded
     *
     * @type {number}
     * @memberof IDownload
     */
    getLoaded(): number;

    /**
     * 
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getUri(): string;

    /**
     * full size of download
     *
     * @type {number}
     * @memberof IDownload
     */
    getSize(): number;

    /**
     * 
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getName(): string;

    /**
     * 
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getFileName(): string;

    /**
     * 
     * 
     * @returns {string} 
     * @memberof IDownload
     */
    getDestination(): string;

    /**
     * 
     * 
     * @returns {IFileData} 
     * @memberof IDownload
     */
    raw(): IFileData;
}
