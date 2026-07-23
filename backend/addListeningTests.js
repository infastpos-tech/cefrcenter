const fs = require("fs");
const path = require("path");

const LESSONS_PATH = path.join(__dirname, "lessons.json");
const lessons = JSON.parse(fs.readFileSync(LESSONS_PATH, "utf8"));

const TOPICS = [
  { id: 2,  title: "City Library",         topic: "URBAN LIBRARIES",      lectureSubj: "public libraries" },
  { id: 3,  title: "Ocean Research",        topic: "MARINE ECOSYSTEMS",    lectureSubj: "ocean research" },
  { id: 4,  title: "Airport Terminal",      topic: "AVIATION HISTORY",     lectureSubj: "airports" },
  { id: 5,  title: "Music Festival",        topic: "MUSIC & CULTURE",      lectureSubj: "music festivals" },
  { id: 6,  title: "Mountain Wildlife",     topic: "ALPINE ECOLOGY",       lectureSubj: "mountain animals" },
  { id: 7,  title: "Technology Fair",       topic: "DIGITAL INNOVATION",   lectureSubj: "technology" },
  { id: 8,  title: "Hospital Ward",         topic: "MODERN MEDICINE",      lectureSubj: "healthcare" },
  { id: 9,  title: "University Campus",     topic: "HIGHER EDUCATION",     lectureSubj: "university life" },
  { id: 10, title: "Shopping District",     topic: "RETAIL & ECONOMY",     lectureSubj: "consumer habits" },
  { id: 11, title: "Train Station",         topic: "RAILWAY HISTORY",      lectureSubj: "rail transport" },
  { id: 12, title: "Cooking School",        topic: "CULINARY ARTS",        lectureSubj: "food culture" },
  { id: 13, title: "Space Exploration",     topic: "ASTRONOMY",            lectureSubj: "space travel" },
  { id: 14, title: "Art Gallery",           topic: "VISUAL ARTS",          lectureSubj: "art history" },
  { id: 15, title: "Sports Academy",        topic: "SPORTS SCIENCE",       lectureSubj: "athletic training" },
  { id: 16, title: "Travel Agency",         topic: "TOURISM",              lectureSubj: "travel trends" },
  { id: 17, title: "Environment Centre",    topic: "CLIMATE CHANGE",       lectureSubj: "environmental science" },
  { id: 18, title: "Film Studio",           topic: "CINEMA HISTORY",       lectureSubj: "filmmaking" },
  { id: 19, title: "Weather Station",       topic: "METEOROLOGY",          lectureSubj: "weather forecasting" },
  { id: 20, title: "Language School",       topic: "LINGUISTICS",          lectureSubj: "language learning" },
  { id: 21, title: "Science Museum",        topic: "SCIENTIFIC DISCOVERY", lectureSubj: "science exhibits" },
  { id: 22, title: "Farm Community",        topic: "AGRICULTURE",          lectureSubj: "modern farming" },
  { id: 23, title: "Hotel Conference",      topic: "HOSPITALITY",          lectureSubj: "hotel management" },
  { id: 24, title: "Archaeology Site",      topic: "ANCIENT HISTORY",      lectureSubj: "archaeology" },
  { id: 25, title: "Marine Biology Lab",    topic: "OCEAN LIFE",           lectureSubj: "marine biology" },
  { id: 26, title: "Photography Show",      topic: "PHOTOGRAPHY",          lectureSubj: "digital photography" },
  { id: 27, title: "Community Council",     topic: "LOCAL GOVERNANCE",     lectureSubj: "civic engagement" },
  { id: 28, title: "Health Clinic",         topic: "PUBLIC HEALTH",        lectureSubj: "preventive medicine" },
  { id: 29, title: "Adventure Park",        topic: "OUTDOOR ACTIVITIES",   lectureSubj: "adventure sports" },
  { id: 30, title: "Radio News Studio",     topic: "JOURNALISM",           lectureSubj: "broadcast media" },
];

const VERBS   = ["improve","increase","reduce","manage","develop","support","create","provide","maintain","design"];
const NOUNS   = ["system","budget","program","report","centre","network","project","service","research","strategy"];
const PLACES  = ["office","library","park","hotel","centre","building","campus","station","gallery","facility"];
const ADJECTIVES = ["important","modern","local","national","special","general","main","new","key","critical"];
const ANSWERS = ["January","February","March","Friday","Monday","Tuesday","morning","afternoon","evening",
                 "manager","teacher","doctor","engineer","director","leader","officer","student","worker","expert",
                 "red","blue","green","yellow","orange","purple","white","silver","grey","black",
                 "small","large","old","new","light","heavy","fast","slow","cheap","expensive",
                 "north","south","east","west","centre","top","left","right","front","back",
                 "ten","twenty","thirty","forty","fifty","hundred","thousand","million","billion","zero",
                 "paper","glass","metal","wood","plastic","cotton","leather","rubber","stone","gold"];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function makeShortMCQ(qNum) {
  const replies = [
    [["I didn't expect that.","Thanks, I appreciate it.","Yes, I'd love to."], 1],
    [["How did you get there?","I went by bus.","I'll try again."], 1],
    [["No, that's too far.","Sure, I can help.","Maybe next week."], 1],
    [["I haven't seen him.","Yes, it's over there.","No, I don't think so."], 1],
    [["That sounds great.","I prefer the other one.","Let me check first."], 0],
    [["I'll be there at noon.","Sorry, I can't come.","Sure, when exactly?"], 2],
    [["Yes, of course.","No, I'm afraid not.","I'm not sure about that."], 0],
    [["That's a good idea.","I don't understand.","It was yesterday."], 0],
  ];
  return replies.map((r, i) => ({
    q: `${i + 1}.`,
    options: [`A) ${r[0][0]}`, `B) ${r[0][1]}`, `C) ${r[0][2]}`],
    answer: r[1]
  }));
}

function makeNotes(testId) {
  const topics = ["location","date","price","name","type","colour","number","time","size","material"];
  const notes = [];
  // 1 display-false header
  notes.push({ label: `Information about the ${PLACES[testId % PLACES.length]}`, answer: null, display: false });
  // 6 fillable
  for (let i = 0; i < 6; i++) {
    const qNum = 9 + i;
    const ans = ANSWERS[(testId * 6 + i) % ANSWERS.length];
    const topic = topics[i];
    notes.push({ label: `The ${topic} of the ${NOUNS[i % NOUNS.length]}: ___`, qNum, answer: ans.toUpperCase(), alt: [ans.toLowerCase(), ans] });
  }
  return notes;
}

function makeMatching(testId) {
  const optionLabels = [
    "at a community event","through social media","at a training session","in a classroom",
    "through a colleague","at a sports club","in a neighbourhood","through a hobby group"
  ];
  const answers = ["A","B","C","D","E","F"];
  const matchOptions = optionLabels.slice(0, 6).map((label, i) => ({ key: String.fromCharCode(65+i), label: `${String.fromCharCode(65+i)}) ${label}` }));
  const questions = [
    { q: "15. Speaker 1 ...", answer: answers[(testId+0)%6], qNum: 15 },
    { q: "16. Speaker 2 ...", answer: answers[(testId+1)%6], qNum: 16 },
    { q: "17. Speaker 3 ...", answer: answers[(testId+2)%6], qNum: 17 },
    { q: "18. Speaker 4 ...", answer: answers[(testId+3)%6], qNum: 18 },
  ];
  return { matchOptions, questions };
}

function makeMap(testId) {
  const placeNames = ["Reception","Main Hall","Storage Room","Meeting Room","Staff Office",
                      "Car Park","Cafeteria","Emergency Exit","Information Desk","Lecture Theatre"];
  const mapOptions = "ABCDEFGH".split("").map(k => ({ key: k, label: k }));
  const letters = "ABCDEFGH".split("");
  const usedLetters = [];
  const questions = [];
  for (let i = 0; i < 5; i++) {
    let letter = letters[(testId + i * 3) % 8];
    while (usedLetters.includes(letter)) { letter = letters[(letters.indexOf(letter) + 1) % 8]; }
    usedLetters.push(letter);
    questions.push({ q: `${19+i}. ${placeNames[i]}`, answer: letter, qNum: 19+i });
  }
  return { mapOptions, questions };
}

function makeMCQ(testId) {
  const extracts = ["Extract One","Extract Two","Extract Three"];
  const questions = [];
  for (let e = 0; e < 3; e++) {
    const base = 24 + e * 2;
    questions.push({
      extract: extracts[e],
      q: `${e*2+1}. The speakers are mainly talking about...`,
      options: [`A) a recent ${NOUNS[(testId+e)%NOUNS.length]}.`, `B) a new ${ADJECTIVES[(testId+e)%ADJECTIVES.length]} plan.`, `C) a local ${PLACES[(testId+e)%PLACES.length]}.`],
      answer: e % 3,
      qNum: base
    });
    questions.push({
      extract: extracts[e],
      q: `${e*2+2}. What is the main conclusion?`,
      options: [`A) They need more time.`, `B) It was a success.`, `C) Further action is needed.`],
      answer: (e + 1) % 3,
      qNum: base + 1
    });
  }
  return questions;
}

function makeLecture(testId, topic) {
  const lecAnswers = ANSWERS.slice((testId * 6) % (ANSWERS.length - 6), (testId * 6) % (ANSWERS.length - 6) + 6);
  const notes = [];
  notes.push({ label: `The lecture focuses on the history of ___ in modern society.`, qNum: 30, answer: lecAnswers[0].toUpperCase(), alt: [lecAnswers[0].toLowerCase()] });
  notes.push({ label: `Background: this subject became important in the ___`, qNum: 31, answer: lecAnswers[1].toUpperCase(), alt: [lecAnswers[1].toLowerCase()] });
  notes.push({ label: `The ___ feature is considered the most significant development.`, qNum: 32, answer: lecAnswers[2].toUpperCase(), alt: [lecAnswers[2].toLowerCase()] });
  notes.push({ label: `The main challenge identified by researchers is related to ___.`, qNum: 33, answer: lecAnswers[3].toUpperCase(), alt: [lecAnswers[3].toLowerCase()] });
  notes.push({ label: `In the final section, the speaker discusses the role of ___ in future progress.`, qNum: 34, answer: lecAnswers[4].toUpperCase(), alt: [lecAnswers[4].toLowerCase()] });
  notes.push({ label: `The lecturer concludes that the most important factor is ___.`, qNum: 35, answer: lecAnswers[5].toUpperCase(), alt: [lecAnswers[5].toLowerCase()] });
  return notes;
}

const newTests = TOPICS.map(({ id, title, topic, lectureSubj }) => {
  const audioBase = `https://archive.org/download/cefr-lt${id}`;
  const { matchOptions, questions: matchQ } = makeMatching(id);
  const { mapOptions, questions: mapQ } = makeMap(id);

  return {
    id,
    title: `Listening Test ${id} — ${title}`,
    level: "B1–C1",
    duration: 30,
    totalQuestions: 35,
    parts: [
      {
        id: 1, label: "P1",
        title: "Short Responses",
        subtitle: "You will hear some sentences. Choose the best reply to each sentence (A, B or C).",
        type: "mcq_short",
        questionRange: "1–8",
        audioUrl: `${audioBase}-p1/t${id}-p1.mp3`,
        questions: makeShortMCQ(id)
      },
      {
        id: 2, label: "P2",
        title: `Note Completion — ${title}`,
        subtitle: "Write ONE WORD and/or A NUMBER for each answer.",
        type: "note",
        questionRange: "9–14",
        context: title.toUpperCase(),
        audioUrl: `${audioBase}-p2/t${id}-p2.mp3`,
        notes: makeNotes(id)
      },
      {
        id: 3, label: "P3",
        title: "Matching — Speakers",
        subtitle: "Match each speaker (15–18) to the correct option (A–F). There are TWO EXTRA options.",
        type: "matching",
        questionRange: "15–18",
        audioUrl: `${audioBase}-p3/t${id}-p3.mp3`,
        matchOptions,
        questions: matchQ
      },
      {
        id: 4, label: "P4",
        title: `Map Labelling — ${title}`,
        subtitle: "Label the places (19–23) on the map. Choose from the letters A–H. There are THREE extra options.",
        type: "map",
        questionRange: "19–23",
        audioUrl: `${audioBase}-p4/t${id}-p4.mp3`,
        mapOptions,
        questions: mapQ
      },
      {
        id: 5, label: "P5",
        title: "Multiple Choice — Three Extracts",
        subtitle: "Choose the correct answer (A, B or C) for each question (24–29).",
        type: "mcq",
        questionRange: "24–29",
        audioUrl: `${audioBase}-p5/t${id}-p5.mp3`,
        extractLabels: ["Extract One","Extract Two","Extract Three"],
        questions: makeMCQ(id)
      },
      {
        id: 6, label: "P6",
        title: `Lecture Notes — ${topic}`,
        subtitle: "Fill in the missing information. Write no more than ONE WORD for each answer.",
        type: "lecture",
        questionRange: "30–35",
        topic,
        audioUrl: `${audioBase}-p6/t${id}-p6.mp3`,
        notes: makeLecture(id, topic)
      }
    ]
  };
});

// Append to LISTENING_TESTS
lessons.LISTENING_TESTS = [lessons.LISTENING_TESTS[0], ...newTests];

fs.writeFileSync(LESSONS_PATH, JSON.stringify(lessons, null, 2), "utf8");
console.log(`✅ Added ${newTests.length} listening tests. Total: ${lessons.LISTENING_TESTS.length}`);
