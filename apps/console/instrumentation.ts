export async function register() {
  if (process.env["NEXT_RUNTIME"] === "nodejs") {
    const { bootstrapApp } = await import("./src/lib/bootstrap");
    await bootstrapApp();
  }
}
