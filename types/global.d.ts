// Global ambient declarations
// Declaration to satisfy TypeScript when importing the built server bundle
declare module "../dist/server/server.js" {
  const handler: any;
  export default handler;
}
