const jumpButtons = document.querySelectorAll("[data-jump]");
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
const doneSection = document.querySelector("#done");

const questions = [
  {
    id: "direction",
    kicker: "SaaS-Richtung",
    title: "Welche SaaS-Richtung wäre für Ihr Unternehmen am spannendsten?",
    hint: "Wählen Sie die Richtung, aus der CPI den Prototyp ableiten soll.",
    type: "choice",
    options: [
      ["Kundenportal", "Ein digitaler Zugang für Kunden, Partner oder interne Teams."],
      ["AI-SaaS", "Ein Produkt, das Prozesse mit AI automatisiert oder Entscheidungen unterstützt."],
      ["Dashboard", "Daten, Reports oder Workflows als Softwareprodukt verpacken."],
      ["Noch offen", "CPI soll aus Website und Geschäftsmodell eine passende SaaS-Idee ableiten."]
    ]
  },
  {
    id: "goal",
    kicker: "Business-Ziel",
    title: "Was soll der Prototyp auslösen?",
    hint: "Der Prototyp soll nicht nur gut aussehen, sondern wirtschaftlich Sinn ergeben.",
    type: "choice",
    options: [
      ["Mehr Leads", "Ein greifbares SaaS-Angebot für Sales und Marketing."],
      ["Automatisierung", "Weniger manuelle Arbeit, weniger Fehler, mehr Geschwindigkeit."],
      ["Neue Umsätze", "Aus Know-how, Daten oder Services ein skalierbares Produkt bauen."],
      ["Klarheit", "Sehen, was realistisch ist, bevor Budget verbrannt wird."]
    ]
  },
  {
    id: "revenue",
    kicker: "Umsatzsignal",
    title: "Wie hoch ist Ihr monatlicher Umsatz?",
    hint: "Pflichtsignal für Lead-Qualität, Priorität und realistischen Projektumfang.",
    type: "choice",
    options: [
      ["Unter 25.000 EUR", "Frühe Phase oder kleineres digitales Vorhaben."],
      ["25.000 bis 100.000 EUR", "Wachstum vorhanden, Tech soll den nächsten Schritt bringen."],
      ["100.000 bis 500.000 EUR", "Bestehende Nachfrage, Prozesse und Systeme müssen skalieren."],
      ["Über 500.000 EUR", "Hoher Hebel für Automatisierung und digitale Produkte."]
    ]
  },
  {
    id: "stage",
    kicker: "Ausgangslage",
    title: "Wie konkret ist die Idee bereits?",
    hint: "So erkennt CPI, ob Strategie, Prototyping oder Umsetzung zuerst kommt.",
    type: "choice",
    options: [
      ["Noch keine Idee", "CPI soll aus Website und Geschäftsmodell eine SaaS-Chance ableiten."],
      ["Erste Idee", "Es gibt ein Zielbild, aber noch keine klare Produktlogik."],
      ["Prototyp vorhanden", "Etwas existiert bereits und soll professioneller werden."],
      ["Bestehendes System", "Ein Tool, Portal oder Prozess soll zu einem besseren Produkt werden."]
    ]
  },
  {
    id: "timeline",
    kicker: "Timing",
    title: "Wann soll der Prototyp auf dem Tisch liegen?",
    hint: "Gute Leads haben ein klares Zeitfenster.",
    type: "choice",
    options: [
      ["Sofort", "Wir wollen jetzt entscheiden und starten."],
      ["In 30 Tagen", "Das Thema ist priorisiert und soll vorbereitet werden."],
      ["In 1 bis 3 Monaten", "Wir sammeln Optionen oder technische Klarheit."],
      ["Später", "Frühe Planung, aber mit echtem Interesse."]
    ]
  },
  {
    id: "website",
    kicker: "Website",
    title: "Wie lautet die Website Ihres Unternehmens?",
    hint: "Pflichtfrage: Daraus kann CPI Angebot, Branche und SaaS-Potenzial schneller einordnen.",
    type: "url",
    placeholder: "https://ihr-unternehmen.de"
  }
];

let currentStep = 0;
let answers = {};

function scrollToTarget(selector) {
  const target = document.querySelector(selector);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
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
  backBtn.style.opacity = currentStep === 0 ? "0.44" : "1";
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
        renderQuestion();
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
    const error = document.querySelector(".field-error");
    if (error) error.textContent = "";
  });
  const error = document.createElement("p");
  error.className = "field-error";
  answerArea.append(input, error);
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
  scrollToTarget("#lead");
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

function submitLead(event) {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const submission = {
    createdAt: new Date().toISOString(),
    answers,
    lead: Object.fromEntries(formData.entries())
  };
  localStorage.setItem("cpi-lead-funnel-submission", JSON.stringify(submission));
  leadForm.reset();
  doneSection.classList.add("is-visible");
  scrollToTarget("#done");
}

document.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--y", `${event.clientY}px`);
});

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => scrollToTarget(button.dataset.jump));
});

nextBtn.addEventListener("click", nextQuestion);
backBtn.addEventListener("click", previousQuestion);
leadForm.addEventListener("submit", submitLead);
renderQuestion();
document.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--y", `${event.clientY}px`);
});
const screens = Array.from(document.querySelectorAll("[data-screen]"));
const startButtons = document.querySelectorAll("[data-start]");
const restartButtons = document.querySelectorAll("[data-restart]");
const stepLabel = document.querySelector("#stepLabel");
const progressBar = document.querySelector("#progressBar");
const questionKicker = document.querySelector("#questionKicker");
const questionTitle = document.querySelector("#questionTitle");
const questionHint = document.querySelector("#questionHint");
const answerArea = document.querySelector("#answerArea");
const backBtn = document.querySelector("#backBtn");
const nextBtn = document.querySelector("#nextBtn");
const signalTitle = document.querySelector("#signalTitle");
const signalText = document.querySelector("#signalText");
const leadSummary = document.querySelector("#leadSummary");
const leadForm = document.querySelector("#leadForm");

const questions = [
  {
    id: "projectType",
    kicker: "SaaS-Richtung",
    title: "Welche Art von SaaS-Prototyp wäre für Ihr Unternehmen am spannendsten?",
    hint: "Wählen Sie die Richtung, aus der CPI einen ersten Enterprise-Prototyp ableiten soll.",
    type: "choice",
    options: [
      ["Kundenportal oder Plattform", "Ein digitaler Zugang für Kunden, Partner oder interne Teams."],
      ["AI-SaaS oder Agent", "Ein Produkt, das Prozesse mit AI automatisiert oder Entscheidungen unterstützt."],
      ["Dashboard oder Datenprodukt", "Daten, Reports oder Workflows als nutzbares Softwareprodukt verpacken."],
      ["Noch offen", "CPI soll aus Website und Geschäftsmodell eine passende SaaS-Idee ableiten."]
    ]
  },
  {
    id: "goal",
    kicker: "Business-Ziel",
    title: "Was soll der SaaS-Prototyp vor allem auslösen?",
    hint: "Der Prototyp soll nicht nur technisch gut aussehen, sondern geschäftlich Sinn ergeben.",
    type: "choice",
    options: [
      ["Mehr Leads oder Umsatz", "Ein SaaS-Angebot, das im Vertrieb greifbar wird."],
      ["Prozesse automatisieren", "Weniger manuelle Arbeit, weniger Fehler, mehr Geschwindigkeit."],
      ["Neue digitale Einnahmen", "Aus Know-how, Daten oder Services ein skalierbares Produkt bauen."],
      ["Technische Klarheit", "Sehen, was realistisch ist, bevor Budget verbrannt wird."]
    ]
  },
  {
    id: "revenue",
    kicker: "Umsatzsignal",
    title: "Wie hoch ist Ihr monatlicher Umsatz?",
    hint: "Diese Frage ist wichtig, damit CPI Budget, Hebel und Projektumfang realistisch einschätzen kann.",
    type: "choice",
    options: [
      ["Unter 25.000 EUR", "Frühe Phase oder kleineres digitales Vorhaben."],
      ["25.000 bis 100.000 EUR", "Wachstum vorhanden, Tech soll den nächsten Schritt bringen."],
      ["100.000 bis 500.000 EUR", "Bestehende Nachfrage, Prozesse und Systeme müssen skalieren."],
      ["Über 500.000 EUR", "Größeres Unternehmen mit hohem Hebel für Automatisierung und Plattformen."]
    ]
  },
  {
    id: "stage",
    kicker: "Ausgangslage",
    title: "Wie konkret ist die SaaS-Idee bereits?",
    hint: "So lässt sich einschätzen, ob CPI zuerst eine Richtung, einen Prototyp oder die Umsetzung vorbereiten sollte.",
    type: "choice",
    options: [
      ["Noch keine Idee", "CPI soll aus Website und Geschäftsmodell eine SaaS-Chance ableiten."],
      ["Erste Idee vorhanden", "Es gibt ein Zielbild, aber noch keine klare Produktlogik."],
      ["Prototyp vorhanden", "Etwas existiert bereits, soll aber professioneller werden."],
      ["Bestehendes System", "Ein Tool, Portal oder Prozess soll zu einem besseren SaaS-Produkt werden."]
    ]
  },
  {
    id: "timeline",
    kicker: "Timing",
    title: "Wann soll der SaaS-Prototyp auf dem Tisch liegen?",
    hint: "Gute Leads haben oft ein klares Zeitfenster. Wählen Sie das realistischste.",
    type: "choice",
    options: [
      ["Sofort", "Wir wollen jetzt entscheiden und starten."],
      ["In den nächsten 30 Tagen", "Das Projekt ist priorisiert und soll vorbereitet werden."],
      ["In 1 bis 3 Monaten", "Wir sammeln Angebote, Optionen oder technische Klarheit."],
      ["Später im Jahr", "Noch frühe Planung, aber mit echtem Interesse."]
    ]
  },
  {
    id: "website",
    kicker: "Unternehmenswebsite",
    title: "Wie lautet die Website Ihres Unternehmens?",
    hint: "Pflichtfrage: CPI nutzt die Website, um Branche, Angebot und Digital-Reife schneller einzuordnen.",
    type: "url",
    placeholder: "https://ihr-unternehmen.de"
  }
];

const insightCopy = {
  projectType: ["SaaS-Richtung erkannt", "CPI sieht, welche Prototyp-Logik für Ihr Unternehmen spannend ist."],
  goal: ["Business-Hebel gesetzt", "Jetzt wird klar, welche Wirkung der SaaS-Prototyp erzeugen soll."],
  revenue: ["Lead-Qualität steigt", "Umsatz hilft, Budget und Priorität schneller einzuschätzen."],
  stage: ["Ausgangslage verortet", "CPI erkennt, ob Konzept, MVP oder Skalierung gefragt ist."],
  timeline: ["Timing geklärt", "Ein klares Zeitfenster trennt echte Projekte von losem Interesse."],
  website: ["Website-Signal bereit", "Branche, Angebot und digitale Reife können geprüft werden."]
};

let currentStep = 0;
let answers = {};

function setScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
  window.location.hash = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startQuiz() {
  currentStep = 0;
  renderQuestion();
  setScreen("quiz");
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
  backBtn.style.opacity = currentStep === 0 ? "0.42" : "1";
  answerArea.innerHTML = "";

  const insight = insightCopy[question.id];
  signalTitle.textContent = insight[0];
  signalText.textContent = insight[1];

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
        renderQuestion();
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
    document.querySelector(".field-error").textContent = "";
  });
  const error = document.createElement("p");
  error.className = "field-error";
  answerArea.append(input, error);
  setTimeout(() => input.focus(), 80);
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
  setScreen("lead");
}

function previousQuestion() {
  if (currentStep === 0) return;
  currentStep -= 1;
  renderQuestion();
}

function renderLeadSummary() {
  const rows = [
    ["Projekt", answers.projectType],
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

function submitLead(event) {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const submission = {
    createdAt: new Date().toISOString(),
    answers,
    lead: Object.fromEntries(formData.entries())
  };
  localStorage.setItem("cpi-lead-funnel-submission", JSON.stringify(submission));
  leadForm.reset();
  setScreen("done");
}

function restart() {
  answers = {};
  currentStep = 0;
  setScreen("intro");
}

document.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--y", `${event.clientY}px`);
});

startButtons.forEach((button) => button.addEventListener("click", startQuiz));
restartButtons.forEach((button) => button.addEventListener("click", restart));
nextBtn.addEventListener("click", nextQuestion);
backBtn.addEventListener("click", previousQuestion);
leadForm.addEventListener("submit", submitLead);

if (window.location.hash === "#quiz") {
  startQuiz();
} else if (window.location.hash === "#lead") {
  renderLeadSummary();
  setScreen("lead");
} else {
  setScreen("intro");
}
const screens = Array.from(document.querySelectorAll("[data-screen]"));
const startButtons = document.querySelectorAll("[data-start]");
const restartButtons = document.querySelectorAll("[data-restart]");
const stepLabel = document.querySelector("#stepLabel");
const progressBar = document.querySelector("#progressBar");
const questionKicker = document.querySelector("#questionKicker");
const questionTitle = document.querySelector("#questionTitle");
const questionHint = document.querySelector("#questionHint");
const answerArea = document.querySelector("#answerArea");
const backBtn = document.querySelector("#backBtn");
const nextBtn = document.querySelector("#nextBtn");
const signalTitle = document.querySelector("#signalTitle");
const signalText = document.querySelector("#signalText");
const leadSummary = document.querySelector("#leadSummary");
const leadForm = document.querySelector("#leadForm");

const questions = [
  {
    id: "projectType",
    kicker: "Projektart",
    title: "Welcher Prototyp würde Ihr Unternehmen wirklich nach vorne bringen?",
    hint: "Wählen Sie den Bereich, der Ihrem Vorhaben am nächsten kommt.",
    type: "choice",
    options: [
      ["AI-Agent oder Automatisierung", "Prozesse beschleunigen, Support oder Sales mit AI skalieren."],
      ["SaaS oder Plattform", "Ein digitales Produkt, Portal oder Dashboard entwickeln."],
      ["MCP, Daten oder Integration", "Systeme verbinden und AI direkt in bestehende Tools bringen."],
      ["Blockchain oder Web3", "Tokenisierung, Smart Contracts oder neue digitale Infrastruktur."]
    ]
  },
  {
    id: "goal",
    kicker: "Business-Ziel",
    title: "Welcher Hebel ist gerade am wichtigsten?",
    hint: "Der Funnel bewertet nicht nur Technik, sondern vor allem Wirkung.",
    type: "choice",
    options: [
      ["Mehr Umsatz", "Neue digitale Einnahmen, bessere Conversion oder schnellerer Vertrieb."],
      ["Weniger manuelle Arbeit", "Zeit sparen, Fehler reduzieren und Teams entlasten."],
      ["Schneller launchen", "MVP, Relaunch oder Produktidee schneller in den Markt bringen."],
      ["Mehr technische Klarheit", "Architektur, Machbarkeit und Roadmap sauber entscheiden."]
    ]
  },
  {
    id: "revenue",
    kicker: "Qualifizierung",
    title: "Wie hoch ist Ihr monatlicher Umsatz?",
    hint: "Diese Frage ist wichtig, damit CPI Budget, Hebel und Projektumfang realistisch einschätzen kann.",
    type: "choice",
    options: [
      ["Unter 25.000 EUR", "Frühe Phase oder kleineres digitales Vorhaben."],
      ["25.000 bis 100.000 EUR", "Wachstum vorhanden, Tech soll den nächsten Schritt bringen."],
      ["100.000 bis 500.000 EUR", "Bestehende Nachfrage, Prozesse und Systeme müssen skalieren."],
      ["Über 500.000 EUR", "Größeres Unternehmen mit hohem Hebel für Automatisierung und Plattformen."]
    ]
  },
  {
    id: "stage",
    kicker: "Ausgangslage",
    title: "Wo steht das Projekt aktuell?",
    hint: "So lässt sich einschätzen, ob Strategie, Prototyping oder Umsetzung zuerst kommt.",
    type: "choice",
    options: [
      ["Nur Idee", "Es gibt ein Zielbild, aber noch keine technische Grundlage."],
      ["Prototyp vorhanden", "Etwas existiert bereits, soll aber professionell werden."],
      ["Bestehendes System", "Es gibt Prozesse, Tools oder Code, der verbessert werden soll."],
      ["Skalierung", "Ein funktionierender Ansatz soll stabiler, schneller oder größer werden."]
    ]
  },
  {
    id: "timeline",
    kicker: "Timing",
    title: "Wann soll Bewegung in das Thema kommen?",
    hint: "Gute Leads haben oft ein klares Zeitfenster. Wählen Sie das realistischste.",
    type: "choice",
    options: [
      ["Sofort", "Wir wollen jetzt entscheiden und starten."],
      ["In den nächsten 30 Tagen", "Das Projekt ist priorisiert und soll vorbereitet werden."],
      ["In 1 bis 3 Monaten", "Wir sammeln Angebote, Optionen oder technische Klarheit."],
      ["Spaeter im Jahr", "Noch fruehe Planung, aber mit echtem Interesse."]
    ]
  },
  {
    id: "website",
    kicker: "Unternehmenswebsite",
    title: "Wie lautet die Website Ihres Unternehmens?",
    hint: "Pflichtfrage: CPI nutzt die Website, um Branche, Angebot und Digital-Reife schneller einzuordnen.",
    type: "url",
    placeholder: "https://ihr-unternehmen.de"
  }
];

const insightCopy = {
  projectType: ["Technischer Bedarf erkannt", "Projektart, Stack und Komplexität werden für CPI sichtbar."],
  goal: ["Business-Hebel gesetzt", "Jetzt wird klar, welche Wirkung im Vordergrund steht."],
  revenue: ["Lead-Qualität steigt", "Umsatz hilft, Budget und Priorität schneller einzuschätzen."],
  stage: ["Ausgangslage verortet", "CPI erkennt, ob Konzept, MVP oder Skalierung gefragt ist."],
  timeline: ["Timing geklärt", "Ein klares Zeitfenster trennt echte Projekte von losem Interesse."],
  website: ["Website-Signal bereit", "Branche, Angebot und digitale Reife können geprüft werden."]
};

let currentStep = 0;
let answers = {};

function setScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
  window.location.hash = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startQuiz() {
  currentStep = 0;
  renderQuestion();
  setScreen("quiz");
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
  backBtn.style.opacity = currentStep === 0 ? "0.42" : "1";
  answerArea.innerHTML = "";

  const insight = insightCopy[question.id];
  signalTitle.textContent = insight[0];
  signalText.textContent = insight[1];

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
        renderQuestion();
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
    document.querySelector(".field-error").textContent = "";
  });
  const error = document.createElement("p");
  error.className = "field-error";
  answerArea.append(input, error);
  setTimeout(() => input.focus(), 80);
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
  setScreen("lead");
}

function previousQuestion() {
  if (currentStep === 0) return;
  currentStep -= 1;
  renderQuestion();
}

function renderLeadSummary() {
  const rows = [
    ["Projekt", answers.projectType],
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

function submitLead(event) {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const submission = {
    createdAt: new Date().toISOString(),
    answers,
    lead: Object.fromEntries(formData.entries())
  };
  localStorage.setItem("cpi-lead-funnel-submission", JSON.stringify(submission));
  leadForm.reset();
  setScreen("done");
}

function restart() {
  answers = {};
  currentStep = 0;
  setScreen("intro");
}

document.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--y", `${event.clientY}px`);
});

startButtons.forEach((button) => button.addEventListener("click", startQuiz));
restartButtons.forEach((button) => button.addEventListener("click", restart));
nextBtn.addEventListener("click", nextQuestion);
backBtn.addEventListener("click", previousQuestion);
leadForm.addEventListener("submit", submitLead);

if (window.location.hash === "#quiz") {
  startQuiz();
} else if (window.location.hash === "#lead") {
  renderLeadSummary();
  setScreen("lead");
} else {
  setScreen("intro");
}
const screens = Array.from(document.querySelectorAll("[data-screen]"));
const startButtons = document.querySelectorAll("[data-start]");
const restartButtons = document.querySelectorAll("[data-restart]");
const stepLabel = document.querySelector("#stepLabel");
const progressBar = document.querySelector("#progressBar");
const questionKicker = document.querySelector("#questionKicker");
const questionTitle = document.querySelector("#questionTitle");
const questionHint = document.querySelector("#questionHint");
const answerArea = document.querySelector("#answerArea");
const backBtn = document.querySelector("#backBtn");
const nextBtn = document.querySelector("#nextBtn");
const signalTitle = document.querySelector("#signalTitle");
const signalText = document.querySelector("#signalText");
const leadSummary = document.querySelector("#leadSummary");
const leadForm = document.querySelector("#leadForm");

const questions = [
  {
    id: "projectType",
    kicker: "Projektart",
    title: "Was soll CPI fuer Sie moeglich machen?",
    hint: "Waehlen Sie den Bereich, der Ihrem Vorhaben am naechsten kommt.",
    type: "choice",
    options: [
      ["AI-Agent oder Automatisierung", "Prozesse beschleunigen, Support oder Sales mit AI skalieren."],
      ["SaaS oder Plattform", "Ein digitales Produkt, Portal oder Dashboard entwickeln."],
      ["MCP, Daten oder Integration", "Systeme verbinden und AI direkt in bestehende Tools bringen."],
      ["Blockchain oder Web3", "Tokenisierung, Smart Contracts oder neue digitale Infrastruktur."]
    ]
  },
  {
    id: "goal",
    kicker: "Business-Ziel",
    title: "Welcher Hebel ist gerade am wichtigsten?",
    hint: "Der Funnel bewertet nicht nur Technik, sondern vor allem Wirkung.",
    type: "choice",
    options: [
      ["Mehr Umsatz", "Neue digitale Einnahmen, bessere Conversion oder schnellerer Vertrieb."],
      ["Weniger manuelle Arbeit", "Zeit sparen, Fehler reduzieren und Teams entlasten."],
      ["Schneller launchen", "MVP, Relaunch oder Produktidee schneller in den Markt bringen."],
      ["Mehr technische Klarheit", "Architektur, Machbarkeit und Roadmap sauber entscheiden."]
    ]
  },
  {
    id: "revenue",
    kicker: "Qualifizierung",
    title: "Wie hoch ist Ihr monatlicher Umsatz?",
    hint: "Diese Frage ist wichtig, damit CPI Budget, Hebel und Projektumfang realistisch einschaetzen kann.",
    type: "choice",
    options: [
      ["Unter 25.000 EUR", "Fruehe Phase oder kleineres digitales Vorhaben."],
      ["25.000 bis 100.000 EUR", "Wachstum vorhanden, Tech soll den naechsten Schritt bringen."],
      ["100.000 bis 500.000 EUR", "Bestehende Nachfrage, Prozesse und Systeme muessen skalieren."],
      ["Ueber 500.000 EUR", "Groesseres Unternehmen mit hohem Hebel fuer Automatisierung und Plattformen."]
    ]
  },
  {
    id: "stage",
    kicker: "Ausgangslage",
    title: "Wo steht das Projekt aktuell?",
    hint: "So laesst sich einschaetzen, ob Strategie, Prototyping oder Umsetzung zuerst kommt.",
    type: "choice",
    options: [
      ["Nur Idee", "Es gibt ein Zielbild, aber noch keine technische Grundlage."],
      ["Prototyp vorhanden", "Etwas existiert bereits, soll aber professionell werden."],
      ["Bestehendes System", "Es gibt Prozesse, Tools oder Code, der verbessert werden soll."],
      ["Skalierung", "Ein funktionierender Ansatz soll stabiler, schneller oder groesser werden."]
    ]
  },
  {
    id: "timeline",
    kicker: "Timing",
    title: "Wann soll Bewegung in das Thema kommen?",
    hint: "Gute Leads haben oft ein klares Zeitfenster. Waehlen Sie das realistischste.",
    type: "choice",
    options: [
      ["Sofort", "Wir wollen jetzt entscheiden und starten."],
      ["In den naechsten 30 Tagen", "Das Projekt ist priorisiert und soll vorbereitet werden."],
      ["In 1 bis 3 Monaten", "Wir sammeln Angebote, Optionen oder technische Klarheit."],
      ["Spaeter im Jahr", "Noch fruehe Planung, aber mit echtem Interesse."]
    ]
  },
  {
    id: "website",
    kicker: "Unternehmenswebsite",
    title: "Wie lautet die Website Ihres Unternehmens?",
    hint: "Pflichtfrage: CPI nutzt die Website, um Branche, Angebot und Digital-Reife schneller einzuordnen.",
    type: "url",
    placeholder: "https://ihr-unternehmen.de"
  }
];

const insightCopy = {
  projectType: ["Technischer Bedarf erkannt", "Projektart, Stack und Komplexitaet werden fuer CPI sichtbar."],
  goal: ["Business-Hebel gesetzt", "Jetzt wird klar, welche Wirkung im Vordergrund steht."],
  revenue: ["Lead-Qualitaet steigt", "Umsatz hilft, Budget und Prioritaet schneller einzuschaetzen."],
  stage: ["Ausgangslage verortet", "CPI erkennt, ob Konzept, MVP oder Skalierung gefragt ist."],
  timeline: ["Timing geklaert", "Ein klares Zeitfenster trennt echte Projekte von losem Interesse."],
  website: ["Website-Signal bereit", "Branche, Angebot und digitale Reife koennen geprueft werden."]
};

let currentStep = 0;
let answers = {};

function setScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
  window.location.hash = name;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startQuiz() {
  currentStep = 0;
  renderQuestion();
  setScreen("quiz");
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
  backBtn.style.opacity = currentStep === 0 ? "0.42" : "1";
  answerArea.innerHTML = "";

  const insight = insightCopy[question.id];
  signalTitle.textContent = insight[0];
  signalText.textContent = insight[1];

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
        renderQuestion();
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
    document.querySelector(".field-error").textContent = "";
  });
  const error = document.createElement("p");
  error.className = "field-error";
  answerArea.append(input, error);
  setTimeout(() => input.focus(), 80);
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
      error.textContent = "Bitte eine gueltige Unternehmenswebsite eintragen.";
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
  setScreen("lead");
}

function previousQuestion() {
  if (currentStep === 0) return;
  currentStep -= 1;
  renderQuestion();
}

function renderLeadSummary() {
  const rows = [
    ["Projekt", answers.projectType],
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

function submitLead(event) {
  event.preventDefault();
  const formData = new FormData(leadForm);
  const submission = {
    createdAt: new Date().toISOString(),
    answers,
    lead: Object.fromEntries(formData.entries())
  };
  localStorage.setItem("cpi-lead-funnel-submission", JSON.stringify(submission));
  leadForm.reset();
  setScreen("done");
}

function restart() {
  answers = {};
  currentStep = 0;
  setScreen("intro");
}

document.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--y", `${event.clientY}px`);
});

startButtons.forEach((button) => button.addEventListener("click", startQuiz));
restartButtons.forEach((button) => button.addEventListener("click", restart));
nextBtn.addEventListener("click", nextQuestion);
backBtn.addEventListener("click", previousQuestion);
leadForm.addEventListener("submit", submitLead);

if (window.location.hash === "#quiz") {
  startQuiz();
} else if (window.location.hash === "#lead") {
  renderLeadSummary();
  setScreen("lead");
} else {
  setScreen("intro");
}
