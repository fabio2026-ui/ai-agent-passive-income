// Simple Router for Cloudflare Workers

export type Handler = (request: Request) => Promise<Response> | Response;

interface Route {
  method: string;
  pattern: RegExp;
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  get(path: string, handler: Handler): void {
    this.addRoute('GET', path, handler);
  }

  post(path: string, handler: Handler): void {
    this.addRoute('POST', path, handler);
  }

  put(path: string, handler: Handler): void {
    this.addRoute('PUT', path, handler);
  }

  delete(path: string, handler: Handler): void {
    this.addRoute('DELETE', path, handler);
  }

  private addRoute(method: string, path: string, handler: Handler): void {
    // Convert route pattern to regex
    // :id becomes a capture group
    const pattern = new RegExp(
      '^' + path.replace(/:([^/]+)/g, '([^/]+)') + '$'
    );
    
    this.routes.push({ method, pattern, handler });
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    for (const route of this.routes) {
      if (route.method !== method) continue;
      
      const match = pathname.match(route.pattern);
      if (match) {
        return await route.handler(request);
      }
    }

    return new Response('Not Found', { status: 404 });
  }
}

export function error(err: unknown): Response {
  const message = err instanceof Error ? err.message : 'Unknown error';
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}
