// 回归测试的 fetch 替身：拦截对 api.github.com 的请求，返回确定性 fixture。
// 通过 `node --import ./tests/mock-fetch.mjs` 预加载生效。
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const REPOS = {
  'test/ok': {
    stargazers_count: 12345,
    language: 'Python',
    pushed_at: new Date(now - 5 * DAY).toISOString(),
  },
  // 105 天 ≈ 3.5 个月：Math.round 会舍入为 3 而漏报「超 3 个月」（回归 H2）
  'test/stale': {
    stargazers_count: 6789,
    language: 'TypeScript',
    pushed_at: new Date(now - 105 * DAY).toISOString(),
  },
};

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'x-ratelimit-remaining': '4999' },
  });

globalThis.fetch = async (url) => {
  const u = String(url);
  if (!u.startsWith('https://api.github.com/repos/')) {
    throw new Error(`mock-fetch: 未预期的请求 ${u}`);
  }
  const slug = u.slice('https://api.github.com/repos/'.length).replace(/\/$/, '');
  const hit = REPOS[slug];
  if (!hit) return jsonResponse(404, { message: 'Not Found' });
  return jsonResponse(200, hit);
};
