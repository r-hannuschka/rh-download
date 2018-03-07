export interface ITextMessage
{
    type: 'error' | 'notice' | 'warning';

    text: string;
}

export interface IMessage {
    data: {
        loaded: number,
        total : number,
        file  : string
    },
    error?: {
        message: string
    },
    hasError: boolean,
    messages: ITextMessage[]
    state: string
};