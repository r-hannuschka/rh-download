export interface ITextMessage
{
    type: string;

    text: string;
}

export interface IMessage {
    data?: {
        loaded: number,
        total : number,
        file  : string
    },
    hasError?: boolean;
    message?: ITextMessage;
    state: string;
};