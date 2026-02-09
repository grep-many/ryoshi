export const formalExample = {
  japanese: [
    { word: "日本", reading: "にほん" },
    { word: "に" },
    { word: "住んで", reading: "すんで" },
    { word: "います" },
    { word: "か" },
    { word: "?" },
  ],
  grammarBreakdown: [
    {
      english: "Do you live in Japan?",
      japanese: [
        { word: "日本", reading: "にほん" },
        { word: "に" },
        { word: "住んで", reading: "すんで" },
        { word: "います" },
        { word: "か" },
        { word: "?" },
      ],
      chunks: [
        {
          japanese: [{ word: "日本", reading: "にほん" }],
          meaning: "Japan",
          grammar: "Noun",
        },
        {
          japanese: [{ word: "に" }],
          meaning: "in",
          grammar: "Particle",
        },
        {
          japanese: [{ word: "住んで", reading: "すんで" }, { word: "います" }],
          meaning: "live",
          grammar: "Verb + て form + います",
        },
        {
          japanese: [{ word: "か" }],
          meaning: "question",
          grammar: "Particle",
        },
        {
          japanese: [{ word: "?" }],
          meaning: "question",
          grammar: "Punctuation",
        },
      ],
    },
  ],
};
