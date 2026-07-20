const REQUIRED_LEAD_FIELDS = ["name", "email", "company"];
const REQUIRED_ANSWER_FIELDS = ["direction", "goal", "revenue", "stage", "timeline", "website"];
const DEFAULT_META_PIXEL_ID = "2154388281488546";
const MIN_FUNNEL_ELAPSED_MS = 7000;
const MIN_LEAD_FORM_ELAPSED_MS = 1200;
const BLOCKED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.de",
  "hotmail.com",
  "hotmail.de",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "gmx.de",
  "gmx.net",
  "web.de",
  "t-online.de",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "yandex.com"
]);

async function sha256(value) {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(String(value || "").trim().toLowerCase()).digest("hex");
}

function json(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function isBusinessEmail(value) {
  const domain = String(value || "").trim().toLowerCase().split("@").pop() || "";
  return Boolean(domain && !BLOCKED_EMAIL_DOMAINS.has(domain));
}

function isValidPhone(value) {
  return /^[+\d][\d\s()./-]{6,}$/.test(String(value || "").trim());
}

function isValidWebsite(value) {
  try {
    const url = new URL(String(value || ""));
    return Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

function detectSpam(payload) {
  const security = payload.security || {};
  if (String(security.honeypot || "").trim()) {
    return "Spam-Schutz ausgelöst.";
  }

  const elapsedMs = Number(security.elapsedMs || 0);
  const leadFormElapsedMs = Number(security.leadFormElapsedMs || 0);

  if (elapsedMs && elapsedMs < MIN_FUNNEL_ELAPSED_MS) {
    return "Bitte nehmen Sie sich kurz Zeit für die Anfrage.";
  }

  if (leadFormElapsedMs && leadFormElapsedMs < MIN_LEAD_FORM_ELAPSED_MS) {
    return "Bitte prüfen Sie Ihre Kontaktdaten noch einmal.";
  }

  return "";
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return "Ungültige Anfrage.";
  if (!payload.lead || typeof payload.lead !== "object") return "Kontaktdaten fehlen.";
  if (!payload.answers || typeof payload.answers !== "object") return "Quiz-Antworten fehlen.";

  const spamError = detectSpam(payload);
  if (spamError) return spamError;

  const missingLeadField = REQUIRED_LEAD_FIELDS.find((field) => !payload.lead[field]);
  if (missingLeadField) return `Pflichtfeld fehlt: ${missingLeadField}.`;
  if (!isValidEmail(payload.lead.email)) return "Bitte eine gültige Business E-Mail eintragen.";
  if (!isBusinessEmail(payload.lead.email)) return "Bitte tragen Sie Ihre geschäftliche E-Mail-Adresse ein.";
  if (payload.lead.phone && !isValidPhone(payload.lead.phone)) return "Bitte eine gültige Telefonnummer eintragen.";

  const missingAnswerField = REQUIRED_ANSWER_FIELDS.find((field) => !payload.answers[field]);
  if (missingAnswerField) return `Quiz-Antwort fehlt: ${missingAnswerField}.`;
  if (!isValidWebsite(payload.answers.website)) return "Bitte eine gültige Website eintragen.";

  return "";
}

function buildWebhookUrls(webhookUrl, apiKey) {
  if (!apiKey) return [webhookUrl];

  const urls = [webhookUrl];
  const queryNames = ["api_key", "apikey", "apiKey", "key", "token"];

  for (const name of queryNames) {
    try {
      const url = new URL(webhookUrl);
      url.searchParams.set(name, apiKey);
      urls.push(url.toString());
    } catch {
      // Keep the original webhook URL if URL parsing ever fails.
    }
  }

  return [...new Set(urls)];
}

function buildWebhookAttempts(webhookUrl, apiKey) {
  const baseHeaders = {
    "Content-Type": "application/json"
  };

  const attempts = buildWebhookUrls(webhookUrl, apiKey).map((url) => ({
    label: url === webhookUrl ? "default" : "query-api-key",
    url,
    headers: baseHeaders
  }));

  if (apiKey) {
    attempts.push(
      {
        label: "x-api-key",
        url: webhookUrl,
        headers: { ...baseHeaders, "X-API-Key": apiKey }
      },
      {
        label: "x-make-apikey",
        url: webhookUrl,
        headers: { ...baseHeaders, "x-make-apikey": apiKey }
      },
      {
        label: "api-key",
        url: webhookUrl,
        headers: { ...baseHeaders, "Api-Key": apiKey }
      }
    );
  }

  return attempts;
}

function getClientIp(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers["x-real-ip"] || request.socket?.remoteAddress || "";
}

async function sendMetaLeadEvent(request, payload) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID || DEFAULT_META_PIXEL_ID;
  if (!accessToken || !pixelId) return;

  const lead = payload.lead || {};
  const tracking = payload.tracking || {};
  const eventId =
    tracking.metaEventId || `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const userData = {
    client_ip_address: getClientIp(request),
    client_user_agent: request.headers["user-agent"] || "",
    em: lead.email ? [await sha256(lead.email)] : undefined,
    ph: lead.phone ? [await sha256(lead.phone.replace(/[^\d+]/g, ""))] : undefined,
    fn: lead.name ? [await sha256(String(lead.name).split(" ")[0] || "")] : undefined,
    ln: lead.name ? [await sha256(String(lead.name).split(" ").slice(1).join(" ") || "")] : undefined,
    fbp: tracking.fbp || undefined,
    fbc: tracking.fbc || undefined
  };

  Object.keys(userData).forEach((key) => {
    if (!userData[key] || (Array.isArray(userData[key]) && !userData[key][0])) {
      delete userData[key];
    }
  });

  const metaPayload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: payload.page || "https://cpi-lead-funnel.vercel.app",
        user_data: userData,
        custom_data: {
          content_name: "Kostenloser Enterprise SaaS-Prototyp",
          content_category: "Lead Funnel",
          company: lead.company || "",
          qualification_direction: payload.answers?.direction || "",
          qualification_revenue: payload.answers?.revenue || ""
        }
      }
    ]
  };

  if (process.env.META_TEST_EVENT_CODE) {
    metaPayload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const metaResponse = await fetch(
    `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(metaPayload)
    }
  );

  if (!metaResponse.ok) {
    const errorBody = await metaResponse.text().catch(() => "");
    console.error("Meta CAPI failed", {
      status: metaResponse.status,
      body: errorBody.slice(0, 500)
    });
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    json(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  const payload = request.body;
  const validationError = validatePayload(payload);
  if (validationError) {
    json(response, 400, { ok: false, error: validationError });
    return;
  }

  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  const apiKey = process.env.CRM_API_KEY;
  if (!webhookUrl) {
    json(response, 500, {
      ok: false,
      error: "CRM_WEBHOOK_URL ist in Vercel noch nicht gesetzt."
    });
    return;
  }

  const crmPayload = {
    source: "cpi-lead-funnel",
    submittedAt: new Date().toISOString(),
    lead: payload.lead,
    qualification: payload.answers,
    apiKey: apiKey || "",
    api_key: apiKey || "",
    apiKeyValue: apiKey || "",
    page: payload.page || "",
    userAgent: request.headers["user-agent"] || "",
    referrer: request.headers.referer || ""
  };

  try {
    await sendMetaLeadEvent(request, payload).catch((error) => {
      console.error("Meta CAPI request error", {
        message: error?.message || "Unknown error"
      });
    });

    let lastError = null;
    const attempts = buildWebhookAttempts(webhookUrl, apiKey);

    for (const attempt of attempts) {
      const crmResponse = await fetch(attempt.url, {
        method: "POST",
        headers: attempt.headers,
        body: JSON.stringify({
          ...crmPayload,
          authAttempt: attempt.label
        })
      });

      if (crmResponse.ok) {
        json(response, 200, { ok: true });
        return;
      }

      const errorBody = await crmResponse.text().catch(() => "");
      lastError = {
        attempt: attempt.label,
        status: crmResponse.status,
        statusText: crmResponse.statusText,
        body: errorBody.slice(0, 500)
      };

      if (![401, 403].includes(crmResponse.status)) break;
    }

    console.error("CRM webhook failed", lastError);
    json(response, 502, {
      ok: false,
      error: `CRM/Webhook hat mit Status ${lastError?.status || "unbekannt"} geantwortet.`
    });
  } catch (error) {
    console.error("CRM webhook request error", {
      message: error?.message || "Unknown error"
    });

    json(response, 502, {
      ok: false,
      error: "Lead konnte nicht an das CRM übertragen werden."
    });
  }
}
