// Declaração para o build server gerado em `dist/server/server.js`
// Resolve TS7016: "Could not find a declaration file for module '../dist/server/server.js'"
declare module "../dist/server/server.js" {
  const handler: any;
  export default handler;
}
