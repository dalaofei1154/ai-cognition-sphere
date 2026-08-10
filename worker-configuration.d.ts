// Cloudflare runtime bindings available to the application Worker.
declare namespace Cloudflare {
  interface Env {
    ASSETS: Fetcher;
  }
}
