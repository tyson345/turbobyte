declare module "cloudflare:node" {
  import type { Server } from "node:http";

  export interface HttpServerWorkerHandler {
    fetch(
      request: Request,
      env?: unknown,
      ctx?: unknown,
    ): Promise<Response>;
  }

  export function httpServerHandler(
    server: Server | { port: number },
  ): HttpServerWorkerHandler;
}