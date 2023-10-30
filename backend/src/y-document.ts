async function handleErrors(request: Request, func: (reques: Request) => Promise<Response> | Response) {
    try {
      return await func(request);
    } catch (err: any) {
        if (request.headers.get("Upgrade") == "websocket") {
            // Annoyingly, if we return an HTTP error in response to a WebSocket request, Chrome devtools
            // won't show us the response body! So... let's send a WebSocket response with an error
            // frame instead.
            let pair = new WebSocketPair();
            pair[1].accept();
            pair[1].send(JSON.stringify({error: err.stack}));
            pair[1].close(1011, "Uncaught exception during session setup");
            return new Response(null, { status: 101, webSocket: pair[0] });
        } else {
            return new Response(err.stack, {status: 500});
        }
    }
  }

  // add cf accept to websocket
declare global {
    interface WebSocket {
        accept(): unknown;
    }
}

export class YDocument implements DurableObject {
    state: DurableObjectState

    #sessions: WebSocket[] = [];

    #messages: any[] = [];

    constructor(state: DurableObjectState) {
      this.state = state;
    }
  
    async fetch(request: Request) {
        if (request.headers.get("Upgrade") === "websocket") {
            return handleErrors(request, this.handleWebsocket.bind(this));
        }

        return new Response(JSON.stringify({ messages: this.#messages }), { 
            status: 200, 
            headers: { "Access-Control-Allow-Origin": "*" }
        })
    }

    handleWebsocket(request: Request) {
        // Get the client's IP address for use with the rate limiter.
        let ip = request.headers.get("cf-Connecting-ip");

        if (!ip) {
            throw new Error("expected ip");
        }

        let pair = new WebSocketPair();

        // We're going to take pair[1] as our end, and return pair[0] to the client.
        this.handleSession(pair[1], ip);

        // Now we return the other end of the pair to the client.
        return new Response(null, { status: 101, webSocket: pair[0] });
    }

    handleSession(websocket: WebSocket, ip: string) {
        console.log("accept", websocket.accept(), ip);

        this.#sessions.push(websocket);

        websocket.addEventListener("message", async (msg) => {
            let data = JSON.parse(msg.data);

            if (data.type === "message") {
                this.#messages.push(data.message);
                this.broadcast({ type: "message", message: data.message }, websocket);
                websocket.send(JSON.stringify({ type: "echo", message: data.message }))
            }
        })
        // On "close" and "error" events, remove the WebSocket from the sessions list and broadcast
        // a quit message.
        let closeHandler = () => {
            console.log("websocket closed");
        };
        websocket.addEventListener("close", closeHandler);
        websocket.addEventListener("error", (e) => {
            console.log("websocket error", e);
        });
    }

    broadcast(data: any, except?: WebSocket) {
        for (let socket of this.#sessions) {
            if (socket === except) continue;
            socket.send(JSON.stringify(data));
        }
    }
  
  }