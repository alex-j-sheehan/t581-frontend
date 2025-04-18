// 


// Organize prompts by round
export const ROUND_PROMPTS = {
  1: [
    {
      question: "What did you have for breakfast today?",
      madLib: "Suddenly the main character is hit by __",
      preWrittenAnswers: [
        "toast and eggs",
        "cereal with milk",
        "a breakfast burrito",
        "nothing, I skipped breakfast",
        "coffee and a banana"
      ]
    },
    {
      question: "Name an object near you.",
      madLib: "A wild __ suddenly charges in.",
      preWrittenAnswers: [
        "coffee mug",
        "laptop",
        "phone",
        "water bottle",
        "notebook"
      ]
    },
    {
      question: "What's something you recently bought?",
      madLib: "Suddenly, a talking __ appears.",
      preWrittenAnswers: [
        "pair of shoes",
        "book",
        "coffee maker",
        "headphones",
        "groceries"
      ]
    },
    {
      question: "What animal do you relate to today?",
      madLib: "Our hero? A misunderstood __ on a mission.",
      preWrittenAnswers: [
        "cat",
        "dog",
        "owl",
        "dolphin",
        "bear"
      ]
    },
    {
      question: "What's your favorite snack?",
      madLib: "The main character discovers that their neighbor is secretly __",
      preWrittenAnswers: [
        "chips and salsa",
        "chocolate",
        "popcorn",
        "pretzels",
        "fruit"
      ]
    }
  ],
  2: [
    {
      question: "What was your favorite toy as a child?",
      madLib: "The ground shakes and out comes a giant __.",
      preWrittenAnswers: [
        "teddy bear",
        "LEGO set",
        "action figure",
        "bicycle",
        "game console"
      ]
    },
    {
      question: "What's something you always carry with you?",
      madLib: "Without warning, a wild __ blocks the path.",
      preWrittenAnswers: [
        "phone",
        "wallet",
        "keys",
        "water bottle",
        "pen"
      ]
    },
    {
      question: "What's your favorite work from home outfit?",
      madLib: "Suddenly, the sky fills with flying __.",
      preWrittenAnswers: [
        "sweatpants",
        "pajamas",
        "jeans and t-shirt",
        "leggings",
        "shorts"
      ]
    },
    {
      question: "What's your go-to breakfast item?",
      madLib: "There's an ambush of falling __.",
      preWrittenAnswers: [
        "toast",
        "coffee",
        "eggs",
        "cereal",
        "banana"
      ]
    }
  ],
  3: [
    {
      question: "What's a word or phrase you say too much?",
      madLib: "A strange voice whispered, '__', and time froze.",
      preWrittenAnswers: [
        "actually",
        "literally",
        "basically",
        "you know",
        "awesome"
      ]
    },
    {
      question: "What's something you've lost recently?",
      madLib: "Out of a hidden door rolled a mysterious __.",
      preWrittenAnswers: [
        "my keys",
        "socks",
        "headphones",
        "charger",
        "sunglasses"
      ]
    },
    {
      question: "What's an item you'd bring to a dinner party?",
      madLib: "Suddenly, everything turned into __.",
      preWrittenAnswers: [
        "wine",
        "dessert",
        "flowers",
        "board game",
        "cheese plate"
      ]
    },
    {
      question: "What's a job you'd be terrible at?",
      madLib: "To fix everything, they had to call a __.",
      preWrittenAnswers: [
        "surgeon",
        "pilot",
        "public speaker",
        "accountant",
        "chef"
      ]
    }
  ],
  4: [
    {
      question: "What's something you'd bring to a picnic?",
      madLib: "In the end, they all floated away on a flying __.",
      preWrittenAnswers: [
        "sandwich",
        "blanket",
        "fruit salad",
        "chips",
        "drinks"
      ]
    },
    {
      question: "What's a song you secretly love?",
      madLib: "As everyone cheered, someone whispered the magical words '__'.",
      preWrittenAnswers: [
        "Baby One More Time",
        "Never Gonna Give You Up",
        "Dancing Queen",
        "Barbie Girl",
        "What Makes You Beautiful"
      ]
    },
    {
      question: "What's something you'd never bring to the beach?",
      madLib: "And so, they swam away on a giant __.",
      preWrittenAnswers: [
        "laptop",
        "formal shoes",
        "work documents",
        "expensive jewelry",
        "chocolate"
      ]
    },
    {
      question: "What's the last kitchen item you used?",
      madLib: "To celebrate, everyone wore hats shaped like a __.",
      preWrittenAnswers: [
        "coffee mug",
        "spatula",
        "plate",
        "fork",
        "cutting board"
      ]
    }
  ],
};

// Keep the PROMPT_PAIRS available for backwards compatibility if needed
export const PROMPT_PAIRS = [
  ...ROUND_PROMPTS[1],
  ...ROUND_PROMPTS[2],
  ...ROUND_PROMPTS[3],
  ...ROUND_PROMPTS[4]
];