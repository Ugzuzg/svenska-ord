"use client";
import { useState, useEffect } from "react";
import styles from "./Quiz.module.css";
// @ts-expect-error csv-loader
import importedNouns from "./nouns.csv";
// @ts-expect-error csv-loader
import importedAdjectives from "./adjectives.csv";

const nounForms = [
  "singularIndefinite",
  "singularDefinite",
  "pluralIndefinite",
  "pluralDefinite",
] as const;
type NounForm = (typeof nounForms)[number];

type AllForms = Record<(typeof nounForms)[number], string>;

type Noun = {
  genus: "utrum" | "neutrum";
  forms: AllForms;
};

type Adjective = {
  singularIndefinite: {
    utrum: string;
    neutrum: string;
  };
  singularDefinite: string;
  plural: string;
};

const articles = {
  utrum: {
    singularIndefinite: "en",
    singularDefinite: "den",
    pluralIndefinite: "",
    pluralDefinite: "de",
  },
  neutrum: {
    singularIndefinite: "ett",
    singularDefinite: "det",
    pluralIndefinite: "",
    pluralDefinite: "de",
  },
};

const nouns: Noun[] = importedNouns.map((x: any) => ({
  genus: x.genus,
  forms: {
    ...(x.singularIndefinite && { singularIndefinite: x.singularIndefinite }),
    ...(x.singularDefinite && { singularDefinite: x.singularDefinite }),
    ...(x.pluralIndefinite && { pluralIndefinite: x.pluralIndefinite }),
    ...(x.pluralDefinite && { pluralDefinite: x.pluralDefinite }),
  },
}));
const adjectives: Adjective[] = importedAdjectives.map((x: any) => ({
  singularIndefinite: {
    utrum: x["singularIndefinite utrum"],
    neutrum: x["singularIndefinite neutrum"],
  },
  singularDefinite: x["singularDefinite"],
  plural: x["plural"],
}));

const randomItem = <T extends any>(array: readonly T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const useRandomPhrase = (seed?: number) => {
  const [noun, setNoun] = useState<Noun>();
  const [adjective, setAdjective] = useState<Adjective>();
  const [form, setForm] = useState<NounForm>();
  const [expectedAnswer, setExpectedAnswer] = useState<string>();

  useEffect(() => {
    const n = randomItem(nouns);
    setNoun(n);
    const a = randomItem(adjectives);
    setAdjective(a);

    const f = randomItem(Object.keys(n.forms)) as NounForm;
    setForm(f);

    setExpectedAnswer(() => {
      switch (f) {
        case "singularIndefinite":
          return a.singularIndefinite[n.genus];
        case "singularDefinite":
          return a.singularDefinite;
        case "pluralIndefinite":
        case "pluralDefinite":
          return a.plural;
      }
    });
  }, [seed]);

  if (!noun || !adjective || !form || !expectedAnswer) return null;

  return { noun, adjective, form, expectedAnswer };
};

export function Quiz() {
  const [answer, setAnswer] = useState("");
  const [seed, setSeed] = useState(0);
  const question = useRandomPhrase(seed);

  if (!question) return null;

  const { noun, adjective, form, expectedAnswer } = question;

  function check(formData: FormData) {
    const answer: string = (formData.get("answer") ?? "") as string;
    const isCorrect = answer.toLowerCase().trim() === expectedAnswer;
    alert(isCorrect ? "Correct" : "Wrong");
    if (isCorrect) {
      setSeed(Math.random());
      setAnswer("");
    }
  }

  return (
    <form action={check} className={styles.quiz}>
      <span className={styles.adjective}>
        {adjective.singularIndefinite.utrum}
      </span>
      <span className={styles.article}>{articles[noun.genus][form]} </span>
      <input
        name="answer"
        className={styles.answer}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        autoComplete="off"
      />
      <span className={styles.noun}> {noun.forms[form]}</span>
      <button type="submit" className={styles.check}>
        Check
      </button>
    </form>
  );
}

export default Quiz;
