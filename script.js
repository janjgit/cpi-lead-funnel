const app = document.querySelector("#app");
const screens = [...document.querySelectorAll("[data-screen]")];
const startButtons = document.querySelectorAll("[data-start]");
const restartButton = document.querySelector("[data-restart]");
const stepLabel = document.querySelector("#stepLabel");
const progressBar = document.querySelector("#progressBar");
const questionKicker = document.querySelector("#questionKicker");
const questionTitle = document.querySelector("#questionTitle");
const questionHint = document.querySelector("#questionHint");
const answerArea = document.querySelector("#answerArea");
const backBtn = document.querySelector("#backBtn");
const nextBtn = document.querySelector("#nextBtn");
const leadSummary = document.querySelector("#leadSummary");
const leadForm = document.querySelector("#leadForm");
const cookieBanner = document.querySelector("#cookieBanner");
const cookieAccept = document.querySelector("#cookieAccept");
const formSubmit = document.querySelector(".form-submit");
const formNote = document.querySelector(".form-note");

const questions = [
  {
    id: "direction",
    kicker: "SaaS-Richtung",
    title: "Wo könnte ein SaaS-Prototyp für Ihr Unternehmen den größten Hebel haben?",
    hint: "Wählen Sie den Bereich, in dem CPI am schnellsten eine verwertbare Produktchance sichtbar machen könnte.",
    type: "choice",
    options: [
      ["Kundenportal", "Ein digitaler Zugang für Kunden, Partner oder interne Teams."],
      ["AI-SaaS", "Ein Produkt, das Prozesse automatisiert oder Entscheidungen vorbereitet."],
      ["Dashboard", "Daten, Reports oder Workflows als nutzbares Produkt verpacken."],
      ["Noch offen", "CPI soll aus Website, Umsatzsignal und Geschäftsmodell die beste Richtung ableiten."]
    ]
  },
  {
    id: "goal",
    kicker: "Business-Ziel",
    title: "Was soll der Prototyp geschäftlich bewegen?",
    hint: "So priorisiert CPI, ob Leadgenerierung, Automatisierung oder ein neues digitales Angebot im Vordergrund steht.",
    type: "choice",
    options: [
      ["Mehr Leads", "Ein klares digitales Angebot, das Interessenten schneller aktiviert."],
      ["Automatisierung", "Manuelle Arbeit reduzieren und Prozesse belastbarer machen."],
      ["Neue Umsätze", "Aus Know-how, Daten oder Services ein skalierbares digitales Produkt entwickeln."],
      ["Klarheit", "Schnell verstehen, welche Produktchance wirklich Sinn ergibt."]
    ]
  },
  {
    id: "revenue",
    kicker: "Umsatzsignal",
    title: "Wie hoch ist Ihr monatlicher Umsatz?",
    hint: "Dieses Signal hilft CPI, Potenzial, Priorität und sinnvolle Prototyp-Tiefe realistisch einzuordnen.",
    type: "choice",
    options: [
      ["Unter 25.000 €", "Frühe Phase oder kleineres digitales Vorhaben."],
      ["25.000 bis 100.000 €", "Wachstum ist vorhanden, Tech soll den nächsten Schritt bringen."],
      ["100.000 bis 500.000 €", "Bestehende Nachfrage, Prozesse und Systeme sollen skalieren."],
      ["Über 500.000 €", "Hoher Hebel für Automatisierung, Plattformen und digitale Produkte."]
    ]
  },
  {
    id: "stage",
    kicker: "Ausgangslage",
    title: "Wie konkret ist die Idee bereits?",
    hint: "So erkennt CPI, ob zuerst Produktstrategie, Prototyping oder technische Umsetzung sinnvoll ist.",
    type: "choice",
    options: [
      ["Noch keine Idee", "CPI soll aus Website und Geschäftsmodell eine Produktchance ableiten."],
      ["Erste Idee", "Es gibt ein Zielbild, aber noch keine klare Produktlogik."],
      ["Prototyp vorhanden", "Etwas existiert bereits und soll professioneller werden."],
      ["Bestehendes System", "Ein Tool, Portal oder Prozess soll zu einem besseren Produkt werden."]
    ]
  },
  {
    id: "timeline",
    kicker: "Timing",
    title: "Wann soll der Prototyp auf dem Tisch liegen?",
    hint: "Ein klares Zeitfenster zeigt, wie dringend und konkret das Vorhaben bereits ist.",
    type: "choice",
    options: [
      ["Sofort", "Wir wollen kurzfristig entscheiden und loslegen."],
      ["In 30 Tagen", "Das Thema ist priorisiert und soll vorbereitet werden."],
      ["In 1 bis 3 Monaten", "Wir sammeln Optionen oder technische Klarheit."],
      ["Später", "Frühe Planung, aber mit echtem Interesse."]
    ]
  },
  {
    id: "website",
    kicker: "Website",
    title: "Wie lautet die Website Ihres Unternehmens?",
    hint: "Darüber kann CPI Angebot, Branche, Zielgruppe und SaaS-Potenzial schneller einordnen.",
    type: "url",
    placeholder: "https://ihr-unternehmen.de"
  }
];

let currentStep = 0;
let answers = {};
let redirectTimer;

function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === id);
  });
  window.location.hash = id === "intro" ? "" : id;
  window.clearTimeout(redirectTimer);
  if (id === "done") {
    redirectTimer = window.setTimeout(() => {
      window.location.href = "https://www.cpitech.io/de";
    }, 6500);
  }
}

function startFunnel(event) {
  currentStep = 0;
  renderQuestion();
  showScreen("quiz");
}

function renderQuestion() {
  const question = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  stepLabel.textContent = `Frage ${currentStep + 1} von ${questions.length}`;
  progressBar.style.width = `${progress}%`;
  questionKicker.textContent = question.kicker;
  questionTitle.textContent = question.title;
  questionHint.textContent = question.hint;
  backBtn.disabled = currentStep === 0;
  backBtn.classList.toggle("is-disabled", currentStep === 0);
  nextBtn.disabled = !answers[question.id];
  answerArea.innerHTML = "";

  if (question.type === "choice") {
    answerArea.className = "answer-area";
    question.options.forEach(([label, detail]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-btn";
      button.classList.toggle("is-selected", answers[question.id] === label);
      button.innerHTML = `<strong>${label}</strong><span>${detail}</span>`;
      button.addEventListener("click", () => {
        answers[question.id] = label;
        nextBtn.disabled = false;
        document.querySelectorAll(".answer-btn").forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        window.setTimeout(nextQuestion, 220);
      });
      answerArea.append(button);
    });
    return;
  }

  answerArea.className = "input-step";
  const input = document.createElement("input");
  input.type = "url";
  input.inputMode = "url";
  input.placeholder = question.placeholder;
  input.value = answers[question.id] || "";
  input.required = true;
  input.addEventListener("input", () => {
    answers[question.id] = input.value.trim();
    nextBtn.disabled = !answers[question.id];
    const error = document.querySelector(".field-error");
    if (error) error.textContent = "";
  });
  input.addEventListener("keydown", (keyboardEvent) => {
    if (keyboardEvent.key === "Enter") nextQuestion();
  });
  const error = document.createElement("p");
  error.className = "field-error";
  answerArea.append(input, error);
  window.setTimeout(() => input.focus(), 120);
}

function normalizedUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidUrl(value) {
  try {
    const url = new URL(normalizedUrl(value));
    return Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
}

function canContinue() {
  const question = questions[currentStep];
  const value = answers[question.id];
  if (question.type === "url") {
    const error = document.querySelector(".field-error");
    if (!isValidUrl(value || "")) {
      error.textContent = "Bitte eine gültige Unternehmenswebsite eintragen.";
      return false;
    }
    answers[question.id] = normalizedUrl(value);
    return true;
  }
  return Boolean(value);
}

function nextQuestion() {
  if (!canContinue()) return;
  if (currentStep < questions.length - 1) {
    currentStep += 1;
    renderQuestion();
    return;
  }
  renderLeadSummary();
  showScreen("lead");
}

function previousQuestion() {
  if (currentStep === 0) return;
  currentStep -= 1;
  renderQuestion();
}

function renderLeadSummary() {
  const rows = [
    ["SaaS-Richtung", answers.direction],
    ["Ziel", answers.goal],
    ["Monatsumsatz", answers.revenue],
    ["Status", answers.stage],
    ["Timing", answers.timeline],
    ["Website", answers.website]
  ];

  leadSummary.innerHTML = rows
    .map(([label, value]) => `<div class="summary-row"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
}

function setFormState(state, message) {
  if (formNote) formNote.textContent = message;
  if (!formSubmit) return;
  formSubmit.disabled = state === "loading";
  formSubmit.classList.toggle("is-loading", state === "loading");
}

async function submitLead(event) {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const submission = {
    createdAt: new Date().toISOString(),
    answers,
    lead: Object.fromEntries(formData.entries()),
    page: window.location.href
  };

  setFormState("loading", "Ihre Anfrage wird sicher übertragen...");

  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(submission)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Lead konnte nicht übertragen werden.");
    }

    localStorage.setItem("cpi-lead-funnel-submission", JSON.stringify(submission));
    leadForm.reset();
    showScreen("done");
  } catch (error) {
    setFormState(
      "error",
      "Die Übertragung ist gerade nicht möglich. Bitte versuchen Sie es in einem Moment erneut."
    );
  }
}

function restart() {
  answers = {};
  currentStep = 0;
  renderQuestion();
  showScreen("intro");
}

function initCookieBanner() {
  if (localStorage.getItem("cpi-cookie-consent") === "accepted") {
    cookieBanner?.classList.add("is-hidden");
    return;
  }

  cookieAccept?.addEventListener("click", () => {
    localStorage.setItem("cpi-cookie-consent", "accepted");
    cookieBanner.classList.add("is-hidden");
  });
}

document.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--y", `${event.clientY}px`);
});

startButtons.forEach((button) => button.addEventListener("click", startFunnel));
restartButton?.addEventListener("click", restart);
nextBtn.addEventListener("click", nextQuestion);
backBtn.addEventListener("click", previousQuestion);
leadForm.addEventListener("submit", submitLead);

renderQuestion();
initCookieBanner();
