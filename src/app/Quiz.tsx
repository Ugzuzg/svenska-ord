"use client";
import { useState, useEffect } from "react";
import styles from "./Quiz.module.css";
// @ts-expect-error csv-loader
import importedNouns from "./nouns.csv";
// @ts-expect-error csv-loader
import importedAdjectives from "./adjectives.csv";
// @ts-expect-error csv-loader
import importedPossessives from "./possessives.csv";

type Noun = {
  genus: "utrum" | "neutrum";
  forms: {
    singular: {
      indefinite: string;
      definite: string;
    };
    plural: {
      indefinite: string;
      definite: string;
    };
  };
};

type Adjective = {
  singularIndefinite: {
    utrum: string;
    neutrum: string;
  };
  singularDefinite: string;
  plural: string;
};

type Possessive = {
  singular: {
    utrum: string;
    neutrum: string;
  };
  plural: string;
};

const articles = {
  utrum: {
    singular: { indefinite: "en", definite: "den" },
    plural: { indefinite: "", definite: "de" },
  },
  neutrum: {
    singular: { indefinite: "ett", definite: "det" },
    plural: { indefinite: "", definite: "de" },
  },
} as const;

const nouns: Noun[] = importedNouns.map((x: any) => ({
  genus: x.genus,
  forms: {
    singular: {
      indefinite: x.singularIndefinite,
      definite: x.singularDefinite,
    },
    plural: {
      indefinite: x.pluralIndefinite,
      definite: x.pluralDefinite,
    },
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
const possessives = importedPossessives.map((x: any) => ({
  singular: {
    utrum: x["singular utrum"],
    neutrum: x["singular neutrum"],
  },
  plural: x["plural"],
}));

const randomItem = <T extends any>(array: readonly T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const useRandomPhrase = (seed?: number) => {
  const [noun, setNoun] = useState<Noun>();
  const [adjective, setAdjective] = useState<Adjective>();
  const [possessive, setPossessive] = useState<Possessive>();
  const [wordNumber, setWordNumber] = useState<"singular" | "plural">();
  const [collocationForm, setCollocationForm] = useState<
    "indefinite" | "definite" | "possessive"
  >();
  const [nounForm, setNounForm] = useState<"indefinite" | "definite">();
  const [expectedAnswer, setExpectedAnswer] = useState<string>();

  useEffect(() => {
    const wordNumber = randomItem(["singular", "plural"] as const);
    setWordNumber(wordNumber);
    const collocationForm = randomItem([
      "indefinite",
      "definite",
      "possessive",
    ] as const);
    setCollocationForm(collocationForm);

    const nounForm = (() => {
      if (collocationForm === "possessive") return "indefinite";
      return collocationForm;
    })();
    setNounForm(nounForm);

    const noun = randomItem(
      nouns.filter((x) => Boolean(x.forms[wordNumber][nounForm])),
    );
    setNoun(noun);
    setPossessive(randomItem(possessives));
    const adj = randomItem(adjectives);
    setAdjective(adj);

    setExpectedAnswer(() => {
      switch (wordNumber) {
        case "singular": {
          switch (collocationForm) {
            case "indefinite":
              return adj.singularIndefinite[noun.genus];
            case "definite":
            case "possessive":
              return adj.singularDefinite;
          }
        }
        case "plural": {
          return adj.plural;
        }
      }
    });
  }, [seed]);

  if (
    !noun ||
    !adjective ||
    !possessive ||
    !wordNumber ||
    !collocationForm ||
    !nounForm ||
    !expectedAnswer
  ) {
    return null;
  }

  return {
    noun,
    adjective,
    possessive,
    wordNumber,
    collocationForm,
    nounForm,
    expectedAnswer,
  };
};

export function Quiz() {
  const [answer, setAnswer] = useState("");
  const [seed, setSeed] = useState(0);
  const question = useRandomPhrase(seed);

  if (!question) return null;

  const {
    noun,
    adjective,
    possessive,
    wordNumber,
    collocationForm,
    nounForm,
    expectedAnswer,
  } = question;

  function check(formData: FormData) {
    const answer: string = (formData.get("answer") ?? "") as string;
    const isCorrect = answer.toLowerCase().trim() === expectedAnswer;
    alert(isCorrect ? "Correct" : "Wrong");
    if (isCorrect) {
      setSeed(Math.random());
      setAnswer("");
    }
  }

  const left = (() => {
    switch (collocationForm) {
      case "indefinite":
      case "definite": {
        return articles[noun.genus][wordNumber][collocationForm];
      }
      case "possessive": {
        if (wordNumber === "plural") return possessive.plural;
        return possessive[wordNumber][noun.genus];
      }
    }
  })();

  return (
    <form action={check} className={styles.quiz}>
      <span className={styles.adjective}>
        {adjective.singularIndefinite.utrum}
      </span>
      <span className={styles.article}>{left} </span>
      <input
        name="answer"
        className={styles.answer}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        autoComplete="off"
      />
      <span className={styles.noun}> {noun.forms[wordNumber][nounForm]}</span>
      <button type="submit" className={styles.check}>
        Check
      </button>
    </form>
  );
}

export default Quiz;
