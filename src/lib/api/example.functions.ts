export async function getGreeting({ data: { name } }: { data: { name: string } }) {
  return {
    greeting: `Hello, ${name}!`,
    mode: "client",
  };
}
