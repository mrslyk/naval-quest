/**
 * Netlify Function — proxies /api/* to the shared api/router.js handler.
 */
import { handleApi } from '../../api/router.js';

export default async (request) => {
  const url = new URL(request.url);
  const collectedHeaders = {};

  const nodeRes = {
    statusCode: 200,
    setHeader(key, value) {
      collectedHeaders[key] = value;
    },
    getHeader(key) {
      return collectedHeaders[key];
    },
    end(data) {
      this._body = data ?? '';
    },
    _body: '',
  };

  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const text = await request.text();
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }
  }

  const req = {
    url: url.pathname + url.search,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
  };

  try {
    const handled = await handleApi(req, nodeRes);
    if (!handled) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers = new Headers();
    for (const [k, v] of Object.entries(collectedHeaders)) {
      headers.set(k, v);
    }
    if (!headers.has('Content-Type') && nodeRes._body) {
      headers.set('Content-Type', 'application/json');
    }

    return new Response(nodeRes._body, {
      status: nodeRes.statusCode,
      headers,
    });
  } catch (err) {
    console.error('[api]', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
