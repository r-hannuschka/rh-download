import * as path from "path";

export const config = {
    DownloadModule: {
        keepNameAsFilename: false,
        paths: {
            image: path.resolve( process.cwd(), './downloads/image'),
            ytdl:  path.resolve( process.cwd(), './downloads/ytdl')
        }
    }
}
