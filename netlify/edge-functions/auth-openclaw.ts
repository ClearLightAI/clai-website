import type { Context } from "https://edge.netlify.com";

const REALM = "OpenClaw Intel";

export default async (request: Request, context: Context) => {
  const expectedUser = Netlify.env.get("OPENCLAW_USER");
  const expectedPass = Netlify.env.get("OPENCLAW_PASSWORD");

  if (!expectedUser || !expectedPass) {
    return new Response("Server misconfigured: auth credentials not set", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const auth = request.headers.get("authorization") ?? "";

  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const sep = decoded.indexOf(":");
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (user === expectedUser && pass === expectedPass) {
        return context.next();
      }
    } catch {
      // fall through to 401
    }
  }

  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};

export const config = {
  path: ["/openclaw-biz-intel", "/openclaw-biz-intel/*"],
};
