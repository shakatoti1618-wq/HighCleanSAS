export interface Env {
  BACKEND_ORIGIN: string
}

const apiPrefix = '/api/'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (!url.pathname.startsWith(apiPrefix)) {
      return new Response('Not Found', { status: 404 })
    }

    const upstream = new URL(url.pathname + url.search, env.BACKEND_ORIGIN)

    const headers = new Headers(request.headers)
    headers.set('host', upstream.host)
    headers.delete('cf-connecting-ip')

    const response = await fetch(upstream, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
      redirect: 'manual',
    })

    const responseHeaders = new Headers(response.headers)
    if (responseHeaders.has('set-cookie')) {
      const cookies = responseHeaders.getSetCookie()
      responseHeaders.delete('set-cookie')
      for (const cookie of cookies) {
        responseHeaders.append('set-cookie', cookie)
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  },
}