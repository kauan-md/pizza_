import type { VercelRequest, VercelResponse } from "@vercel/node";
import { join } from "path";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    // Tenta importar o handler SSR
    let handler;
    try {
      // Em desenvolvimento/build local
      handler = require("../dist/server/server.js").default;
    } catch {
      try {
        // No Vercel, pode estar em um caminho diferente
        handler = require("./dist/server/server.js").default;
      } catch {
        // Fallback: buscar no caminho absoluto
        const path = join(process.cwd(), "dist/server/server.js");
        handler = require(path).default;
      }
    }

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
          ? JSON.stringify(req.body)
          : undefined,
    });

    // Chama o handler
    const response = await handler.fetch(request, {}, {});

    // Define o status
    res.status(response.status);

    // Copia os headers
    response.headers.forEach((value, key) => {
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
    });
  }
};
