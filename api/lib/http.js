/** Normalize Vercel / Vite handler responses. */

export function makeRes(nodeRes) {
  let statusCode = 200;
  const headers = {};

  return {
    status(code) {
      statusCode = code;
      nodeRes.statusCode = code;
      return this;
    },
    setHeader(k, v) {
      headers[k] = v;
      nodeRes.setHeader(k, v);
    },
    json(payload) {
      nodeRes.statusCode = statusCode;
      for (const [k, v] of Object.entries(headers)) nodeRes.setHeader(k, v);
      if (!nodeRes.getHeader?.('Content-Type')) {
        nodeRes.setHeader('Content-Type', 'application/json');
      }
      nodeRes.end(JSON.stringify(payload));
    },
  };
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}
