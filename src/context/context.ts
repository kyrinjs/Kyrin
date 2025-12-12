/**
 * Kyrin Framework - Context
 * ศูนย์กลางการจัดการ Request/Response
 */

export class Context {
  readonly req: Request;
  private _url?: URL;
  params: Record<string, string>;

  constructor(req: Request, params: Record<string, string> = {}) {
    this.req = req;
    this.params = params;
  }

  // ==================== Request Helpers ====================

  /** HTTP Method */
  get method(): string {
    return this.req.method;
  }

  /** Request path */
  get path(): string {
    return this.url.pathname;
  }

  /** Get request header */
  header(name: string): string | null {
    return this.req.headers.get(name);
  }

  /** All request headers */
  get headers(): Headers {
    return this.req.headers;
  }

  /** Lazy URL parsing */
  private get url(): URL {
    return (this._url ??= new URL(this.req.url));
  }

  /** Get path parameter */
  param(key: string): string | null {
    return this.params[key] ?? null;
  }

  /** Get query parameter */
  query(key: string): string | null {
    return this.url.searchParams.get(key);
  }

  /** Get JSON body */
  async body<T = any>(): Promise<T> {
    return (await this.req.json()) as T;
  }

  /** Get text body */
  async bodyText(): Promise<string> {
    return await this.req.text();
  }

  // ==================== Response Helpers ====================

  /** Send JSON response */
  json<T = any>(data: T, status = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  /** Send text response */
  text(data: string, status = 200): Response {
    return new Response(data, {
      status,
      headers: { "Content-Type": "text/plain" },
    });
  }

  /** Send HTML response */
  html(data: string, status = 200): Response {
    return new Response(data, {
      status,
      headers: { "Content-Type": "text/html" },
    });
  }

  /** Redirect response */
  redirect(url: string, status = 302): Response {
    return new Response(null, {
      status,
      headers: { Location: url },
    });
  }

  /** 404 Not Found response */
  notFound(): Response {
    return new Response("Not Found", { status: 404 });
  }
}
