// Forwards Vapi end-of-call-report JSON to Cursor automation webhook with Bearer auth.
// Env (Vercel only - never commit secrets):
//   HAWKINS_CALL_WEBHOOK_URL  - Cursor automation webhook URL (required)
//   HAWKINS_CALL_WEBHOOK_KEY  - Bearer token for Cursor (required)
//   HAWKINS_VAPI_SHARED_SECRET - optional; if set, require Authorization Bearer or X-Vapi-Secret
// Always responds 200 to Vapi for processed reports (informational webhook), even if upstream fails.

const TARGET = ""; // placeholder - set HAWKINS_CALL_WEBHOOK_URL in Vercel env

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Vapi-Secret"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const shared = process.env.HAWKINS_VAPI_SHARED_SECRET;
  if (shared) {
    const auth = String(req.headers.authorization || "");
    const bearer = auth.toLowerCase().startsWith("bearer ")
      ? auth.slice(7).trim()
      : "";
    const headerSecret = String(req.headers["x-vapi-secret"] || "").trim();
    if (bearer !== shared && headerSecret !== shared) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
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

  const msgType =
    (body.message && body.message.type) || body.type || "";
  if (msgType && msgType !== "end-of-call-report") {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const url = (process.env.HAWKINS_CALL_WEBHOOK_URL || TARGET || "").trim();
  const key = (process.env.HAWKINS_CALL_WEBHOOK_KEY || "").trim();
  if (!url) {
    return res.status(200).json({ ok: false, error: "missing_webhook_url" });
  }
  if (!key) {
    return res.status(200).json({ ok: false, error: "missing_webhook_key" });
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
    const text = await upstream.text();
    // Vapi only needs 200 for informational end-of-call-report webhooks
    return res.status(200).json({
      ok: upstream.ok,
      status: upstream.status,
      detail: text.slice(0, 500),
    });
  } catch (err) {
    return res.status(200).json({
      ok: false,
      error: "upstream_failed",
      detail: String(err && err.message ? err.message : err).slice(0, 200),
    });
  }
};