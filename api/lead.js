const REQUIRED_LEAD_FIELDS = ["name", "email", "company"];
const REQUIRED_ANSWER_FIELDS = ["direction", "goal", "revenue", "stage", "timeline", "website"];

function json(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function isValidWebsite(value) {
  try {
    const url = new URL(String(value || ""));
    return Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") return "Ungültige Anfrage.";
  if (!payload.lead || typeof payload.lead !== "object") return "Kontaktdaten fehlen.";
  if (!payload.answers || typeof payload.answers !== "object") return "Quiz-Antworten fehlen.";

  const missingLeadField = REQUIRED_LEAD_FIELDS.find((field) => !payload.lead[field]);
  if (missingLeadField) return `Pflichtfeld fehlt: ${missingLeadField}.`;
  if (!isValidEmail(payload.lead.email)) return "Bitte eine gültige Business E-Mail eintragen.";

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
