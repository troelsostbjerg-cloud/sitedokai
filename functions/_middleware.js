export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  if (
    url.pathname === "/studio" ||
    url.pathname.startsWith("/studio/") ||
    url.pathname === "/room" ||
    url.pathname.startsWith("/room/") ||
    url.pathname === "/mockups" ||
    url.pathname.startsWith("/mockups/")
  ) {
    return new Response("Not found", {
      status: 404,
      headers: {
        "cache-control": "no-store, max-age=0",
        "content-type": "text/plain; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  return context.next();
}
