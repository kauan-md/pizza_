import type { VercelRequest, VercelResponse } from "@vercel/node";

// Importa o handler do servidor TanStack Start
const handler = require("../dist/server/index.js").default;

export default async (req: VercelRequest, res: VercelResponse) => {
  const response = await handler.fetch(
    new Request(
      new URL(
        `${req.url}`,
        `https://${req.headers.host}`
      ).toString(),
      {
        method: req.method,
        headers: req.headers as HeadersInit,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      }
    ),
    {}, // env
    {} // ctx
  );

  res.status(response.status);
  
  // Copia headers da response
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // Envia o body
  const buffer = await response.arrayBuffer();
  res.send(Buffer.from(buffer));
};
