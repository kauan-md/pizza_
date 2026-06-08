// Use plain `any` for request/response to avoid depending on @vercel/node types
import { join } from "path";

export default async (req: any, res: any) => {
  try {
    // Tenta importar o handler SSR (suporta ESM) usando caminho absoluto
    const serverPath = join(process.cwd(), "dist", "server", "server.js");
    const handler = await import(serverPath).then((m) => m.default);

    // Monta a URL completa
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const url = `${protocol}://${host}${req.url}`;

    // Cria a Request do Fetch API
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers as HeadersInit),
      body:
        req.method !== "GET" && req.method !== "HEAD" && req.body
          ? typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body)
          : undefined,
    });

    // Chama o handler
    const response = await handler.fetch(request, {}, {});

    // Define o status
    res.status(response.status);

    // Copia os headers
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    // Envia o body
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : String(error),
      details:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.stack
            : String(error)
          : undefined,
    });
  }
};
