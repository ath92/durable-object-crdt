
export interface CloudflareWebsocket extends WebSocket {
    accept(): unknown;
    addEventListener(event: 'close', callbackFunction: (code?: number, reason?: string) => unknown): unknown;
    addEventListener(event: 'error', callbackFunction: (e: unknown) => unknown): unknown;
    addEventListener(event: 'message', callbackFunction: (event: { data: any }) => unknown): unknown;
    
    /**
     * @param code https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
     * @param reason
     */
    close(code?: number, reason?: string): unknown;
    send(message: string|Uint8Array): unknown;
}

export type WebSocketPair = [CloudflareWebsocket, CloudflareWebsocket];
export interface ResponseInit {
    webSocket?: CloudflareWebsocket;
}