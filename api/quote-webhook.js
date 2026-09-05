// Forwards FormSubmit JSON to Cursor automation webhook with Bearer auth.
// Secret: HAWKINS_QUOTE_WEBHOOK_KEY (Vercel env). Never commit the key.

const TARGET =
  "https://api2.cursor.sh/automations/webhook/7b3db172-61f3-518a-b97a-6e4df25218f1";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const key = process.env.HAWKINS_QUOTE_WEBHOOK_KEY || process.env.HAWKINS_QUOTE_HOOK_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, error: "missing_webhook_key" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (_) {
      body = { raw: body };
    }
  }
  if (!body || typeof body !== "object") {
    body = {};
  }

  try {
    const upstream = await fetch(TARGET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    return res.status(upstream.ok ? 200 : 502).json({
      ok: upstream.ok,
      status: upstream.status,
      detail: text.slice(0, 500),
    });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: "upstream_failed",
      detail: String(err && err.message ? err.message : err).slice(0, 200),
    });
  }
};
