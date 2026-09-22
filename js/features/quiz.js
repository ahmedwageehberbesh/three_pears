import { $, el, imgFallback } from "../lib/dom.js";
import { t, localized } from "../data/i18n.js";

let data;

const questions = [
  {
    id: "q1",
    key: {
      ar: "كيف تحب مشروبك؟",
      en: "How do you like your drink?"
    },
    options: [
      { label: { ar: "بارد ومنعش جدًا", en: "Ice cold and refreshing" }, bear: "qotbi" },
      { label: { ar: "دافئ وناعم", en: "Warm and smooth" }, bear: "panda" },
      { label: { ar: "حماسي وملون", en: "Energizing and fun" }, bear: "shihab" }
    ]
  },
  {
    id: "q2",
    key: {
      ar: "ما مزاجك اليوم؟",
      en: "What's your mood today?"
    },
    options: [
      { label: { ar: "أحتاج انتعاشًا", en: "I need a refresh" }, bear: "qotbi" },
      { label: { ar: "أريد هدوءًا", en: "I want calm" }, bear: "panda" },
      { label: { ar: "مليء بالطاقة", en: "Full of energy" }, bear: "shihab" }
    ]
  },
  {
    id: "q3",
    key: {
      ar: "أين تفضّل الجلوس؟",
      en: "Where do you prefer to sit?"
    },
    options: [
      { label: { ar: "في الهواء الطلق", en: "Outdoors" }, bear: "qotbi" },
      { label: { ar: "في زاوية هادئة", en: "A quiet corner" }, bear: "panda" },
      { label: { ar: "وسط الأصدقاء", en: "In the middle of friends" }, bear: "shihab" }
    ]
  }
];

let step = 0;
let scores = { qotbi: 0, panda: 0, shihab: 0 };

export function initQuiz(dataset) {
  data = dataset;
  renderIntro();
  return renderIntro;
}

function renderIntro() {
  step = 0;
  scores = { qotbi: 0, panda: 0, shihab: 0 };

  const root = $("#quiz-root");
  root.innerHTML = "";
  root.append(
    el("div", { class: "quiz-card" }, [
      el("p", { text: t("quiz.sub") }),
      el("button", {
        type: "button",
        class: "btn btn-primary",
        text: t("quiz.start"),
        onclick: renderStep
      })
    ])
  );
}

function renderStep() {
  const question = questions[step];
  const root = $("#quiz-root");

  const progress = el(
    "div",
    { class: "quiz-progress", "aria-hidden": "true" },
    questions.map((_, i) => el("span", { class: i <= step ? "is-done" : "" }))
  );

  const card = el("div", { class: "quiz-card" }, [
    progress,
    el("div", { class: "quiz-step" }, [
      el("h3", { text: localized(question.key) }),
      el(
        "div",
        { class: "quiz-options", role: "group" },
        question.options.map((option) =>
          el("button", {
            type: "button",
            class: "quiz-option",
            text: localized(option.label),
            onclick: () => answer(option.bear)
          })
        )
      )
    ])
  ]);

  root.innerHTML = "";
  root.append(card);
}

function answer(bearId) {
  scores[bearId] += 1;
  step += 1;
  if (step < questions.length) renderStep();
  else renderResult();
}

function renderResult() {
  const winnerId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const bear = data.bears.find((b) => b.id === winnerId) || data.bears[0];

  const root = $("#quiz-root");
  root.innerHTML = "";
  root.append(
    el("div", { class: "quiz-card" }, [
      el("div", { class: "quiz-result" }, [
        el("div", { class: "quiz-result-avatar" }, [
          el("img", { src: bear.heroImage, alt: localized(bear.name), onerror: imgFallback })
        ]),
        el("p", { class: "badge", text: `${t("quiz.result")} ${localized(bear.name)}` }),
        el("h3", { text: localized(bear.name) }),
        el("p", { text: localized(bear.description) }),
        el("div", { class: "quiz-actions" }, [
          el("button", {
            type: "button",
            class: "btn btn-primary",
            text: t("quiz.goWorld"),
            onclick: () => {
              window.dispatchEvent(new CustomEvent("world:decided"));
              document.documentElement.dataset.bear = bear.theme;
              window.dispatchEvent(new CustomEvent("bear:select", { detail: bear.id }));
              document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" });
            }
          }),
          el("button", {
            type: "button",
            class: "btn btn-outline",
            style: "color:var(--brown-900);box-shadow:inset 0 0 0 2px var(--brown-900)",
            text: t("quiz.restart"),
            onclick: renderIntro
          })
        ])
      ])
    ])
  );
}
