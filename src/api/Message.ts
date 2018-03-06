export interface IMessage {
    data?: {
        loaded: number,
        total : number,
        file  : string
    },
    error?: string,
    processId: string,
    state: string
};