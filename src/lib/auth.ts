export function requireApiKey(request: Request) {
  const apiKey = process.env.MC_API_KEY;
  if (!apiKey) return null; // no-op if not configured
  const header = request.headers.get('x-api-key');
  if (header !== apiKey) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
