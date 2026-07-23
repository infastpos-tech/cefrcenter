const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lessons.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// ===================== COLORS =====================
const COLORS = {
  A1: '#378ADD', A2: '#1D9E75', B1: '#EF9F27',
  B2: '#D85A30', C1: '#7F77DD', C2: '#D4537E'
};

// ===================== LISTENING TESTS (17-31) =====================
const listeningTopics = [
  { id: 17, topic: 'Space Museum', theme: 'SPACE EXPLORATION', color: '#378ADD' },
  { id: 18, topic: 'Botanical Garden', theme: 'BOTANY', color: '#1D9E75' },
  { id: 19, topic: 'Art Gallery', theme: 'MODERN ART', color: '#EF9F27' },
  { id: 20, topic: 'Sports Stadium', theme: 'SPORTS SCIENCE', color: '#D85A30' },
  { id: 21, topic: 'University Campus', theme: 'HIGHER EDUCATION', color: '#7F77DD' },
  { id: 22, topic: 'Shopping Centre', theme: 'CONSUMER BEHAVIOUR', color: '#D4537E' },
  { id: 23, topic: 'Nature Reserve', theme: 'WILDLIFE CONSERVATION', color: '#378ADD' },
  { id: 24, topic: 'Film Studio', theme: 'FILM PRODUCTION', color: '#1D9E75' },
  { id: 25, topic: 'Harbour Port', theme: 'MARITIME TRADE', color: '#EF9F27' },
  { id: 26, topic: 'Science Lab', theme: 'CLIMATE SCIENCE', color: '#D85A30' },
  { id: 27, topic: 'Historic Castle', theme: 'MEDIEVAL HISTORY', color: '#7F77DD' },
  { id: 28, topic: 'Refugee Centre', theme: 'SOCIAL WELFARE', color: '#D4537E' },
  { id: 29, topic: 'Business Park', theme: 'ENTREPRENEURSHIP', color: '#378ADD' },
  { id: 30, topic: 'Mountain Resort', theme: 'CLIMATE CHANGE', color: '#1D9E75' },
  { id: 31, topic: 'Digital Academy', theme: 'ARTIFICIAL INTELLIGENCE', color: '#EF9F27' },
];

const matchOptionSets = [
  [ { key:'A', label:'A) at a sports event' }, { key:'B', label:'B) through a mutual friend' }, { key:'C', label:'C) at a charity event' }, { key:'D', label:'D) during a holiday' }, { key:'E', label:'E) at a local café' }, { key:'F', label:'F) through work' } ],
  [ { key:'A', label:'A) at a conference' }, { key:'B', label:'B) through social media' }, { key:'C', label:'C) at school' }, { key:'D', label:'D) via email' }, { key:'E', label:'E) at a party' }, { key:'F', label:'F) through a relative' } ],
  [ { key:'A', label:'A) in a library' }, { key:'B', label:'B) at a gym' }, { key:'C', label:'C) through a colleague' }, { key:'D', label:'D) during a course' }, { key:'E', label:'E) at a concert' }, { key:'F', label:'F) through an app' } ],
  [ { key:'A', label:'A) at a festival' }, { key:'B', label:'B) through family' }, { key:'C', label:'C) at a museum' }, { key:'D', label:'D) online' }, { key:'E', label:'E) at a university' }, { key:'F', label:'F) on holiday' } ],
  [ { key:'A', label:'A) at a market' }, { key:'B', label:'B) at a community class' }, { key:'C', label:'C) through sport' }, { key:'D', label:'D) via a pen pal scheme' }, { key:'E', label:'E) at a language school' }, { key:'F', label:'F) through a neighbour' } ],
  [ { key:'A', label:'A) at a book club' }, { key:'B', label:'B) through travel' }, { key:'C', label:'C) in a hospital' }, { key:'D', label:'D) at a workshop' }, { key:'E', label:'E) through an advert' }, { key:'F', label:'F) at a cooking class' } ],
  [ { key:'A', label:'A) at a dance class' }, { key:'B', label:'B) through volunteering' }, { key:'C', label:'C) at a park' }, { key:'D', label:'D) during an internship' }, { key:'E', label:'E) via a dating app' }, { key:'F', label:'F) at a cinema' } ],
  [ { key:'A', label:'A) at a networking event' }, { key:'B', label:'B) at a science fair' }, { key:'C', label:'C) in a queue' }, { key:'D', label:'D) through a teacher' }, { key:'E', label:'E) at a shopping mall' }, { key:'F', label:'F) at a religious centre' } ],
  [ { key:'A', label:'A) through a hobby club' }, { key:'B', label:'B) at a photography class' }, { key:'C', label:'C) during a power cut' }, { key:'D', label:'D) in a waiting room' }, { key:'E', label:'E) through gaming' }, { key:'F', label:'F) on a camp' } ],
  [ { key:'A', label:'A) at a hotel' }, { key:'B', label:'B) at a charity shop' }, { key:'C', label:'C) through a podcast' }, { key:'D', label:'D) at an art class' }, { key:'E', label:'E) via a letter' }, { key:'F', label:'F) at a youth club' } ],
  [ { key:'A', label:'A) at a job centre' }, { key:'B', label:'B) during a strike' }, { key:'C', label:'C) at a protest' }, { key:'D', label:'D) through sport' }, { key:'E', label:'E) via a mutual contact' }, { key:'F', label:'F) at a debate club' } ],
  [ { key:'A', label:'A) at a speed-dating event' }, { key:'B', label:'B) through an exchange program' }, { key:'C', label:'C) at a neighbourhood watch' }, { key:'D', label:'D) at a pottery class' }, { key:'E', label:'E) via a blog' }, { key:'F', label:'F) through an alumni network' } ],
  [ { key:'A', label:'A) at a mindfulness retreat' }, { key:'B', label:'B) through a running club' }, { key:'C', label:'C) at a food festival' }, { key:'D', label:'D) during a strike' }, { key:'E', label:'E) in an elevator' }, { key:'F', label:'F) via a QR code' } ],
  [ { key:'A', label:'A) at a quiz night' }, { key:'B', label:'B) through a gaming community' }, { key:'C', label:'C) at a poetry slam' }, { key:'D', label:'D) via a book swap' }, { key:'E', label:'E) during a road trip' }, { key:'F', label:'F) at a beach event' } ],
  [ { key:'A', label:'A) through a debate group' }, { key:'B', label:'B) at a refugee programme' }, { key:'C', label:'C) via a podcast community' }, { key:'D', label:'D) through yoga class' }, { key:'E', label:'E) at a night school' }, { key:'F', label:'F) at a rooftop event' } ],
];

const mapPlaces = [
  ['Ticket Office', 'Gift Shop', 'Café', 'Lecture Hall', 'Observation Deck'],
  ['Information Desk', 'Greenhouse', 'Pond Area', 'Picnic Zone', 'Plant Shop'],
  ['Entry Hall', 'Sculpture Room', 'Photography Gallery', 'Workshop Room', 'Rooftop Garden'],
  ['Player Entrance', 'Media Centre', 'Changing Rooms', 'Stadium Shop', 'First Aid Room'],
  ['Library', 'Student Union', 'Cafeteria', 'Sports Hall', 'Administration Office'],
  ['Customer Services', 'Food Court', 'Car Park', "Children's Play Area", 'Security Office'],
  ['Visitor Centre', 'Bird Hide', 'Trail Head', 'Research Station', 'Picnic Area'],
  ["Director's Office", 'Costume Store', 'Sound Stage', 'Editing Suite', 'Props Room'],
  ['Customs Office', 'Freight Yard', 'Passenger Terminal', 'Fuel Depot', 'Security Gate'],
  ['Sample Storage', 'Control Room', 'Data Centre', 'Clean Room', 'Observation Lounge'],
  ['Drawbridge', 'Great Hall', 'Armory', 'Tower Room', 'Gardens'],
  ['Reception', 'Medical Bay', 'Counselling Room', "Children's Area", 'Kitchen'],
  ['Innovation Hub', 'Co-working Space', 'Meeting Suite', 'Rooftop Terrace', 'Reception Lobby'],
  ['Ski Hire', 'Warming Hut', 'Summit Station', 'Emergency Shelter', 'Ski School'],
  ['Server Room', 'Training Lab', 'Demo Hall', 'Hot Desk Zone', 'VR Studio'],
];

const mapAnswerSets = [
  ['D','F','B','G','A'], ['C','E','A','H','D'], ['F','B','G','D','A'], ['E','H','C','F','A'],
  ['B','D','F','A','G'], ['A','G','C','E','H'], ['D','F','A','G','B'], ['E','C','F','A','D'],
  ['G','B','D','F','A'], ['C','F','A','D','G'], ['E','A','G','B','D'], ['F','D','A','G','C'],
  ['A','G','D','F','C'], ['B','F','A','D','G'], ['G','D','F','A','C'],
];

const lectureAnswerSets = [
  ['GRAVITY', '21ST CENTURY', 'ORBITAL', 'PRESSURE', 'NAVIGATION', 'EXPLORATION'],
  ['PHOTOSYNTHESIS', '18TH CENTURY', 'TROPICAL', 'WATER', 'BIOLOGY', 'BIODIVERSITY'],
  ['CANVAS', '19TH CENTURY', 'ABSTRACT', 'COLOUR', 'DESIGN', 'CREATIVITY'],
  ['ENDURANCE', '20TH CENTURY', 'PHYSICAL', 'DIET', 'TRAINING', 'PERFORMANCE'],
  ['SCHOLARSHIP', '19TH CENTURY', 'ACADEMIC', 'TUITION', 'RESEARCH', 'KNOWLEDGE'],
  ['PSYCHOLOGY', '21ST CENTURY', 'DIGITAL', 'TRUST', 'MARKETING', 'LOYALTY'],
  ['MIGRATION', '20TH CENTURY', 'NATURAL', 'POLLUTION', 'SCIENCE', 'PRESERVATION'],
  ['SCREENPLAY', '20TH CENTURY', 'VISUAL', 'BUDGET', 'DIRECTION', 'STORYTELLING'],
  ['NAVIGATION', '19TH CENTURY', 'GLOBAL', 'FUEL', 'COMMERCE', 'CONNECTIVITY'],
  ['ATMOSPHERE', '21ST CENTURY', 'THERMAL', 'CARBON', 'MEASUREMENT', 'SUSTAINABILITY'],
  ['FORTRESS', '12TH CENTURY', 'GOTHIC', 'SIEGE', 'NOBILITY', 'HERITAGE'],
  ['COMMUNITY', '20TH CENTURY', 'SOCIAL', 'POVERTY', 'POLICY', 'INCLUSION'],
  ['INNOVATION', '21ST CENTURY', 'CREATIVE', 'CAPITAL', 'STRATEGY', 'GROWTH'],
  ['GLACIERS', '21ST CENTURY', 'POLAR', 'TEMPERATURE', 'SCIENCE', 'ADAPTATION'],
  ['ALGORITHM', '21ST CENTURY', 'NEURAL', 'BIAS', 'COMPUTATION', 'INTELLIGENCE'],
];

const mcqShortOptions = [
  [
    ["A) That sounds great.", "B) I agree completely.", "C) Not really, no."],
    ["A) Sure, I can manage.", "B) I went last week.", "C) I will be there."],
    ["A) Yes, that would help.", "B) No, I disagree.", "C) Maybe tomorrow."],
    ["A) I have not tried it.", "B) Yes, over there.", "C) It was last week."],
    ["A) I think so too.", "B) Not at all.", "C) Let me check."],
    ["A) Perfect timing.", "B) Sorry, I cannot make it.", "C) I will call you."],
    ["A) Of course.", "B) I am afraid not.", "C) It depends."],
    ["A) Great idea!", "B) I am not sure.", "C) Maybe later."]
  ],
  [
    ["A) I am not certain.", "B) That is right.", "C) No, I do not think so."],
    ["A) He is nearby.", "B) By train.", "C) Let me try again."],
    ["A) Of course.", "B) It is too late.", "C) Next Monday."],
    ["A) I saw her yesterday.", "B) It is right there.", "C) I do not know."],
    ["A) Sounds perfect.", "B) I would prefer another.", "C) Let me confirm."],
    ["A) I will be ready at noon.", "B) I cannot come today.", "C) When exactly?"],
    ["A) Absolutely.", "B) I am afraid not.", "C) I am not sure."],
    ["A) Good thinking.", "B) I do not follow.", "C) It was earlier."]
  ]
];


function makeListeningTest(idx) {
  const { id, topic, theme, color } = listeningTopics[idx];
  const mo = matchOptionSets[idx % matchOptionSets.length];
  const answerKeys = ['F','A','B','C','D','E'];
  const matchAnswers = ['A','B','C','D'].map((_,i) => ({
    q: `${15+i}. Speaker ${i+1} ...`,
    answer: answerKeys[i],
    qNum: 15+i
  }));
  const places = mapPlaces[idx % mapPlaces.length];
  const mapAns = mapAnswerSets[idx % mapAnswerSets.length];
  const lecAns = lectureAnswerSets[idx % lectureAnswerSets.length];
  const shortOpts = mcqShortOptions[idx % mcqShortOptions.length];

  return {
    id,
    title: `Listening Test ${id} — ${topic}`,
    level: 'B1–C1',
    duration: 30,
    totalQuestions: 35,
    color,
    parts: [
      {
        id: 1, label: 'P1', title: 'Short Responses',
        subtitle: 'You will hear some sentences. Choose the best reply to each sentence (A, B or C).',
        type: 'mcq_short', questionRange: '1–8',
        audioUrl: `https://archive.org/download/cefr-lt${id}-p1/t${id}-p1.mp3`,
        questions: shortOpts.map((opts, qi) => ({ q: `${qi+1}.`, options: opts, answer: qi % 3 }))
      },
      {
        id: 2, label: 'P2', title: `Note Completion — ${topic}`,
        subtitle: 'Write ONE WORD and/or A NUMBER for each answer.',
        type: 'note', questionRange: '9–14', context: topic.toUpperCase(),
        audioUrl: `https://archive.org/download/cefr-lt${id}-p2/t${id}-p2.mp3`,
        notes: [
          { label: `Information about the ${topic.toLowerCase()}`, answer: null, display: false },
          { label: 'The event started in: ___', qNum: 9, answer: lecAns[0], alt: [lecAns[0].toLowerCase()] },
          { label: 'The main feature is: ___', qNum: 10, answer: lecAns[1], alt: [lecAns[1].toLowerCase()] },
          { label: 'The key topic is: ___', qNum: 11, answer: lecAns[2], alt: [lecAns[2].toLowerCase()] },
          { label: 'The main colour used is: ___', qNum: 12, answer: lecAns[3], alt: [lecAns[3].toLowerCase()] },
          { label: 'The nearest landmark is to the: ___', qNum: 13, answer: lecAns[4], alt: [lecAns[4].toLowerCase()] },
          { label: 'The total number of items is: ___', qNum: 14, answer: lecAns[5], alt: [lecAns[5].toLowerCase()] },
        ]
      },
      {
        id: 3, label: 'P3', title: `Matching — ${topic}`,
        subtitle: 'Match each speaker (15–18) to the correct option (A–F). There are TWO EXTRA options.',
        type: 'matching', questionRange: '15–18',
        audioUrl: `https://archive.org/download/cefr-lt${id}-p3/t${id}-p3.mp3`,
        matchOptions: mo,
        questions: matchAnswers
      },
      {
        id: 4, label: 'P4', title: `Map Labelling — ${topic}`,
        subtitle: 'Label the places (19–23) on the map. Choose from letters A–H. There are THREE extra options.',
        type: 'map', questionRange: '19–23',
        audioUrl: `https://archive.org/download/cefr-lt${id}-p4/t${id}-p4.mp3`,
        mapOptions: ['A','B','C','D','E','F','G','H'].map(k => ({ key: k, label: k })),
        questions: places.map((place, pi) => ({ q: `${19+pi}. ${place}`, answer: mapAns[pi], qNum: 19+pi }))
      },
      {
        id: 5, label: 'P5', title: 'Multiple Choice — Three Extracts',
        subtitle: 'Choose the correct answer (A, B or C) for each question (24–29).',
        type: 'mcq', questionRange: '24–29',
        audioUrl: `https://archive.org/download/cefr-lt${id}-p5/t${id}-p5.mp3`,
        extractLabels: ['Extract One', 'Extract Two', 'Extract Three'],
        questions: [
          { extract:'Extract One', q:'1. The speakers are mainly discussing...', options:[`A) a recent development in ${theme.toLowerCase()}.`,`B) a new plan for the local ${topic.toLowerCase()}.`,'C) a problem with the current system.'], answer:0, qNum:24 },
          { extract:'Extract One', q:'2. What conclusion is reached?', options:['A) More time is needed.','B) It was a great success.','C) Further action is required.'], answer:1, qNum:25 },
          { extract:'Extract Two', q:'3. The speakers are mainly discussing...', options:[`A) a recent development in ${theme.toLowerCase()}.`,`B) a new plan for the local ${topic.toLowerCase()}.`,'C) a problem with the current system.'], answer:1, qNum:26 },
          { extract:'Extract Two', q:'4. What conclusion is reached?', options:['A) More time is needed.','B) It was a great success.','C) Further action is required.'], answer:2, qNum:27 },
          { extract:'Extract Three', q:'5. The speakers are mainly discussing...', options:[`A) a recent development in ${theme.toLowerCase()}.`,`B) a new plan for the local ${topic.toLowerCase()}.`,'C) a problem with the current system.'], answer:2, qNum:28 },
          { extract:'Extract Three', q:'6. What conclusion is reached?', options:['A) More time is needed.','B) It was a great success.','C) Further action is required.'], answer:0, qNum:29 },
        ]
      },
      {
        id: 6, label: 'P6', title: `Lecture Notes — ${theme}`,
        subtitle: 'Fill in the missing information. Write no more than ONE WORD for each answer.',
        type: 'lecture', questionRange: '30–35', topic: theme,
        audioUrl: `https://archive.org/download/cefr-lt${id}-p6/t${id}-p6.mp3`,
        notes: [
          { label: `The lecture focuses on the history of ___ in modern society.`, qNum:30, answer: lecAns[0], alt:[lecAns[0].toLowerCase()] },
          { label: `This subject became particularly important in the ___.`, qNum:31, answer: lecAns[1], alt:[lecAns[1].toLowerCase()] },
          { label: `The ___ feature is considered the most significant development.`, qNum:32, answer: lecAns[2], alt:[lecAns[2].toLowerCase()] },
          { label: `The main challenge identified by researchers is related to ___.`, qNum:33, answer: lecAns[3], alt:[lecAns[3].toLowerCase()] },
          { label: `In the final section, the speaker discusses the role of ___ in future progress.`, qNum:34, answer: lecAns[4], alt:[lecAns[4].toLowerCase()] },
          { label: `The lecturer concludes that the most important factor is ___.`, qNum:35, answer: lecAns[5], alt:[lecAns[5].toLowerCase()] },
        ]
      }
    ]
  };
}

// ===================== READING TESTS (17-31) =====================
const readingTopics = [
  { id:'RT17', num:17, title:'Renewable Energy', color:'#378ADD' },
  { id:'RT18', num:18, title:'Human Memory', color:'#1D9E75' },
  { id:'RT19', num:19, title:'Urban Farming', color:'#EF9F27' },
  { id:'RT20', num:20, title:'Ocean Plastics', color:'#D85A30' },
  { id:'RT21', num:21, title:'Sleep Science', color:'#7F77DD' },
  { id:'RT22', num:22, title:'Artificial Intelligence', color:'#D4537E' },
  { id:'RT23', num:23, title:'Ancient Civilisations', color:'#378ADD' },
  { id:'RT24', num:24, title:'Bioluminescence', color:'#1D9E75' },
  { id:'RT25', num:25, title:'Space Tourism', color:'#EF9F27' },
  { id:'RT26', num:26, title:'Gut Microbiome', color:'#D85A30' },
  { id:'RT27', num:27, title:'Extreme Sports', color:'#7F77DD' },
  { id:'RT28', num:28, title:'Quantum Computing', color:'#D4537E' },
  { id:'RT29', num:29, title:'Global Migration', color:'#378ADD' },
  { id:'RT30', num:30, title:'Social Media & Youth', color:'#1D9E75' },
  { id:'RT31', num:31, title:'Neuroscience of Music', color:'#EF9F27' },
];

const readingPassages = [
  {
    gapText: 'Renewable energy sources such as solar and wind power are transforming the global energy (1)___. Unlike fossil fuels, these sources produce little to no (2)___ emissions. The transition to clean energy is seen as essential for combating (3)___ change. Governments worldwide are offering (4)___ to encourage households to install solar panels. Despite the initial (5)___, the long-term savings can be (6)___ significant.',
    gapTitle: 'The Rise of Renewable Energy',
    gapAnswers: ['landscape','carbon','climate','incentives','cost','economically'],
    shortPassage: 'Solar energy is one of the fastest-growing energy sectors globally. In 2023, solar capacity grew by 35% worldwide. Countries like Germany, China, and the United States lead in solar installations. Critics point to the high manufacturing cost of panels, but experts argue that prices have dropped dramatically over the last decade.',
    shortQs: [
      { q:'Which country is NOT mentioned as a solar energy leader?', opts:['A) Germany','B) Japan','C) China','D) USA'], ans:1 },
      { q:'By how much did solar capacity grow in 2023?', opts:['A) 20%','B) 25%','C) 35%','D) 50%'], ans:2 },
      { q:'What has happened to solar panel prices?', opts:['A) They have risen','B) They remain stable','C) They have dropped','D) They are unpredictable'], ans:2 },
    ],
    tfPassage: 'Wind turbines are increasingly common in both onshore and offshore environments. Studies show that offshore turbines produce more energy due to stronger and more consistent winds. However, the installation cost of offshore turbines is considerably higher than onshore ones. Some coastal communities have opposed offshore wind farms due to visual and noise concerns.',
    tfQs: [
      { q:'Offshore turbines produce more energy than onshore turbines.', ans:'TRUE' },
      { q:'All coastal communities fully support offshore wind farms.', ans:'FALSE' },
      { q:'The cost of installing offshore turbines is lower than onshore.', ans:'FALSE' },
    ],
    summaryText: 'Renewable energy is reshaping the global energy (13)___. Both solar and wind power produce minimal (14)___ emissions. Governments provide (15)___ to encourage adoption.',
    summaryOptions: ['A) matrix  B) landscape  C) market  D) field','A) toxic  B) sound  C) carbon  D) light','A) fines  B) warnings  C) incentives  D) penalties'],
    summaryAnswers: [1,2,2],
    mcqPassage: 'The International Energy Agency (IEA) predicts that renewables will supply 35% of global electricity by 2025. While progress is rapid, challenges remain including energy storage and grid stability. Battery technology must improve to store excess energy generated during peak production times.',
    mcqQs: [
      { q:'What percentage of global electricity will renewables supply by 2025 according to the IEA?', opts:['A) 25%','B) 30%','C) 35%','D) 40%'], ans:2 },
      { q:'What is identified as one key challenge for renewables?', opts:['A) Lack of government support','B) Energy storage','C) Too much sunlight','D) Water scarcity'], ans:1 },
    ]
  },
  {
    gapText: 'Human memory is not a single, unified (1)___ but a complex system with multiple (2)___. Short-term memory allows us to hold information for brief (3)___, while long-term memory stores facts and experiences that can last a (4)___. Sleep plays a critical (5)___ in the consolidation of memories. Without adequate sleep, the brain struggles to (6)___ new information effectively.',
    gapTitle: 'Understanding Human Memory',
    gapAnswers: ['system','components','periods','lifetime','role','retain'],
    shortPassage: 'The hippocampus is a small brain structure essential for forming new memories. Damage to this region can cause anterograde amnesia, where patients cannot form new long-term memories. Studies on patient H.M., who had his hippocampus removed, revolutionised our understanding of memory systems.',
    shortQs: [
      { q:'What condition results from hippocampus damage?', opts:['A) Dyslexia','B) Anterograde amnesia','C) ADHD','D) Depression'], ans:1 },
      { q:'Who is mentioned as a key patient in memory research?', opts:['A) Patient A.B.','B) Patient X.Y.','C) Patient H.M.','D) Patient J.K.'], ans:2 },
      { q:'What does the hippocampus do?', opts:['A) Controls breathing','B) Forms new memories','C) Regulates heart rate','D) Manages vision'], ans:1 },
    ],
    tfPassage: 'Research suggests that memories are not stored as static recordings but are actively reconstructed each time they are recalled. This means memories can change over time, incorporating new information or becoming distorted. Eyewitness testimony in criminal cases can therefore be unreliable due to this reconstructive nature of memory.',
    tfQs: [
      { q:'Memories remain unchanged from the moment they are formed.', ans:'FALSE' },
      { q:'Eyewitness testimony may be unreliable due to memory reconstruction.', ans:'TRUE' },
      { q:'Memories can become distorted when recalled.', ans:'TRUE' },
    ],
    summaryText: 'Human memory is a complex (13)___ with multiple components. The (14)___ is critical for forming new memories. Sleep is essential for memory (15)___.',
    summaryOptions: ['A) machine  B) system  C) archive  D) folder','A) amygdala  B) cortex  C) hippocampus  D) cerebellum','A) consolidation  B) deletion  C) creation  D) transfer'],
    summaryAnswers: [1,2,0],
    mcqPassage: 'Techniques such as spaced repetition and retrieval practice have been shown to significantly improve long-term retention of information. Spaced repetition involves reviewing material at increasing intervals. Retrieval practice, or the testing effect, strengthens memory by actively recalling information rather than passively re-reading it.',
    mcqQs: [
      { q:'What does spaced repetition involve?', opts:['A) Reading once only','B) Reviewing at increasing intervals','C) Listening to audio','D) Using flashcards daily'], ans:1 },
      { q:'What is the "testing effect"?', opts:['A) Writing notes repeatedly','B) Watching educational videos','C) Actively recalling information','D) Sleeping after study'], ans:2 },
    ]
  },
  {
    gapText: 'Urban farming is the practice of growing (1)___ within cities and towns. It addresses food (2)___ by reducing the distance food travels from farm to table. Rooftop gardens, vertical farms, and community (3)___ are all forms of urban agriculture. Proponents argue that urban farming can improve (4)___ quality and strengthen community (5)___. However, it requires significant (6)___ and expertise to set up effectively.',
    gapTitle: 'The Urban Farming Revolution',
    gapAnswers: ['food','insecurity','plots','air','cohesion','investment'],
    shortPassage: 'Vertical farming uses artificial lighting and hydroponic systems to grow crops in stacked layers. This method uses up to 95% less water than conventional agriculture and can produce yields year-round, regardless of weather. Companies like AeroFarms in the USA are leading the vertical farming industry.',
    shortQs: [
      { q:'What system does vertical farming typically use?', opts:['A) Soil-based','B) Hydroponic','C) Aquaponic','D) Biodynamic'], ans:1 },
      { q:'What percentage less water does vertical farming use?', opts:['A) 50%','B) 75%','C) 90%','D) 95%'], ans:3 },
      { q:'Which company is mentioned as a leader in vertical farming?', opts:['A) GreenLife','B) AeroFarms','C) SkyGrow','D) EcoHarvest'], ans:1 },
    ],
    tfPassage: 'Community gardens have been established in many urban areas to provide residents with access to fresh produce. Research shows that participation in community gardens can reduce stress and improve mental well-being. However, not all urban residents have the time or physical ability to participate in gardening activities.',
    tfQs: [
      { q:'Community gardens can help reduce stress according to research.', ans:'TRUE' },
      { q:'All urban residents are able to participate in community gardens.', ans:'FALSE' },
      { q:'Community gardens provide access to fresh produce.', ans:'TRUE' },
    ],
    summaryText: 'Urban farming grows (13)___ within cities. Vertical farms use (14)___ systems to grow crops with less water. Community gardens improve (15)___ well-being.',
    summaryOptions: ['A) animals  B) food  C) goods  D) herbs','A) hydroponic  B) organic  C) thermal  D) digital','A) financial  B) physical  C) mental  D) social'],
    summaryAnswers: [1,0,2],
    mcqPassage: 'Governments in several countries are beginning to support urban farming through grants and planning policy changes. Singapore has introduced policies requiring new commercial buildings to include green spaces. However, critics note that urban farming alone cannot feed large populations and must complement, not replace, conventional agriculture.',
    mcqQs: [
      { q:'What has Singapore introduced regarding new buildings?', opts:['A) Rooftop restaurants','B) Underground farms','C) Policies requiring green spaces','D) Solar panel mandates'], ans:2 },
      { q:'What is the main limitation of urban farming according to critics?', opts:['A) It is too expensive','B) It cannot feed large populations alone','C) It creates too much waste','D) It requires too many workers'], ans:1 },
    ]
  },
  {
    gapText: 'Ocean plastics represent one of the most pressing (1)___ challenges of our time. Millions of tonnes of plastic waste (2)___ into the sea each year, harming marine (3)___. Microplastics — tiny fragments of plastic — have been found in fish, seabirds, and even human (4)___. International (5)___ are being made to reduce single-use plastics globally. Without urgent (6)___, ocean ecosystems could face irreversible damage.',
    gapTitle: 'The Ocean Plastics Crisis',
    gapAnswers: ['environmental','flow','life','blood','efforts','action'],
    shortPassage: 'The Great Pacific Garbage Patch is a massive area of marine debris located between Hawaii and California. It is estimated to cover an area twice the size of Texas. Most of this debris is composed of microplastics, which are difficult to remove from the ocean. Organisations such as The Ocean Cleanup are developing technology to address this problem.',
    shortQs: [
      { q:'Where is the Great Pacific Garbage Patch located?', opts:['A) Atlantic Ocean','B) Between Hawaii and California','C) Near Australia','D) In the Arctic'], ans:1 },
      { q:'How large is the Great Pacific Garbage Patch estimated to be?', opts:['A) Twice the size of the UK','B) The size of France','C) Twice the size of Texas','D) The size of Australia'], ans:2 },
      { q:'Which organisation works to clean up ocean plastics?', opts:['A) Greenpeace','B) WWF','C) The Ocean Cleanup','D) Sea Shepherd'], ans:2 },
    ],
    tfPassage: 'Single-use plastics are a major contributor to ocean pollution. Many countries have introduced bans on items such as plastic straws, bags, and cutlery. However, in some developing nations, access to affordable alternatives is limited, making complete bans difficult to implement. Public awareness campaigns have also played a role in reducing plastic consumption.',
    tfQs: [
      { q:'Many countries have banned single-use plastic items.', ans:'TRUE' },
      { q:'Affordable alternatives to plastic are widely available in all countries.', ans:'FALSE' },
      { q:'Public awareness campaigns have contributed to reducing plastic use.', ans:'TRUE' },
    ],
    summaryText: 'Ocean plastics are a major (13)___ challenge. Microplastics have been found in human (14)___. International (15)___ aim to reduce single-use plastics.',
    summaryOptions: ['A) political  B) cultural  C) environmental  D) economic','A) lungs  B) skin  C) blood  D) hair','A) efforts  B) conflicts  C) businesses  D) schools'],
    summaryAnswers: [2,2,0],
    mcqPassage: 'Scientists warn that if current plastic production continues, there will be more plastic than fish in the oceans by 2050. Biodegradable alternatives to plastic are being developed, including packaging made from seaweed and mycelium. However, these alternatives must become economically competitive before they can replace plastic at scale.',
    mcqQs: [
      { q:'By what year could there be more plastic than fish in the ocean?', opts:['A) 2030','B) 2040','C) 2050','D) 2060'], ans:2 },
      { q:'What materials are mentioned as biodegradable plastic alternatives?', opts:['A) Cotton and bamboo','B) Seaweed and mycelium','C) Glass and metal','D) Wood and rubber'], ans:1 },
    ]
  },
  {
    gapText: 'Sleep is essential for physical and (1)___ health. During sleep, the brain (2)___ information processed during the day and repairs (3)___ damage. Adults typically require between seven and nine (4)___ of sleep per night. However, modern lifestyles often interfere with healthy sleep (5)___, with artificial light and screen use disrupting the body\'s natural (6)___ rhythm.',
    gapTitle: 'The Science of Sleep',
    gapAnswers: ['mental','consolidates','cellular','hours','patterns','circadian'],
    shortPassage: 'Rapid Eye Movement (REM) sleep is a stage of sleep associated with vivid dreaming and memory consolidation. During REM sleep, the brain is highly active, almost as much as when awake. Research has shown that REM sleep is critical for emotional regulation and creative thinking. Most adults experience several REM cycles per night.',
    shortQs: [
      { q:'What is REM sleep associated with?', opts:['A) Deep relaxation','B) Physical growth','C) Vivid dreaming','D) Reduced brain activity'], ans:2 },
      { q:'How active is the brain during REM sleep?', opts:['A) Completely inactive','B) Similar to deep sleep','C) Almost as active as when awake','D) More active than when awake'], ans:2 },
      { q:'What is REM sleep critical for?', opts:['A) Muscle repair','B) Emotional regulation','C) Digestion','D) Blood pressure regulation'], ans:1 },
    ],
    tfPassage: 'Sleep deprivation has serious consequences for health. Chronic sleep deprivation is linked to increased risk of obesity, diabetes, and cardiovascular disease. Studies have also shown that sleep-deprived individuals perform worse on cognitive tasks. Teenagers are particularly vulnerable, as they naturally tend to stay awake later but must wake early for school.',
    tfQs: [
      { q:'Chronic sleep deprivation is linked to obesity and diabetes.', ans:'TRUE' },
      { q:'Sleep deprivation improves cognitive performance.', ans:'FALSE' },
      { q:'Teenagers naturally tend to fall asleep earlier than adults.', ans:'FALSE' },
    ],
    summaryText: 'Sleep is vital for both physical and (13)___ health. REM sleep is critical for emotional (14)___. Sleep deprivation increases the risk of (15)___ disease.',
    summaryOptions: ['A) emotional  B) spiritual  C) mental  D) social','A) control  B) regulation  C) balance  D) monitoring','A) cardiovascular  B) lung  C) digestive  D) skin'],
    summaryAnswers: [2,1,0],
    mcqPassage: 'Experts recommend several strategies for improving sleep quality: maintaining a consistent sleep schedule, limiting caffeine in the afternoon, avoiding screens before bed, and ensuring the bedroom is dark and cool. Cognitive Behavioural Therapy for Insomnia (CBT-I) has been shown to be the most effective long-term treatment for chronic insomnia.',
    mcqQs: [
      { q:'What is recommended as a strategy to improve sleep?', opts:['A) Drinking coffee before bed','B) Sleeping in bright light','C) Maintaining a consistent sleep schedule','D) Taking long naps'], ans:2 },
      { q:'What treatment is most effective for chronic insomnia according to experts?', opts:['A) Sleeping pills','B) CBT-I','C) Meditation','D) Exercise'], ans:1 },
    ]
  },
];

// Fill remaining reading passages with a generic template
for (let i = readingPassages.length; i < 15; i++) {
  const t = readingTopics[i];
  readingPassages.push({
    gapText: `Research into ${t.title} has grown significantly in recent (1)___. Scientists have identified numerous (2)___ that influence this field. The implications for society are both (3)___ and far-reaching. Many institutions now dedicate (4)___ resources to studying this topic. Public (5)___ has also increased considerably in recent years. Experts argue that further (6)___ is urgently needed.`,
    gapTitle: `Understanding ${t.title}`,
    gapAnswers: ['years','factors','profound','substantial','awareness','research'],
    shortPassage: `The study of ${t.title} has attracted global attention. Key findings suggest that this field could transform how we approach major societal challenges. Governments and private organisations are increasing investment in this area. Some critics argue that regulation has not kept pace with developments.`,
    shortQs: [
      { q:`What is one reason ${t.title} attracts global attention?`, opts:['A) It is entertaining','B) It could transform societal challenges','C) It is cheap to research','D) It requires no expertise'], ans:1 },
      { q:'What do critics argue?', opts:['A) Funding is sufficient','B) Regulation has not kept pace','C) Research is too slow','D) There is too much interest'], ans:1 },
      { q:'Who is increasing investment in this area?', opts:['A) Only governments','B) Only private organisations','C) Governments and private organisations','D) International charities'], ans:2 },
    ],
    tfPassage: `Advances in ${t.title} have raised important ethical questions. Some researchers believe that developments must be carefully monitored to avoid unintended consequences. Public debate about this field is growing, with many people expressing both excitement and concern. Regulatory frameworks are gradually being updated to address new challenges.`,
    tfQs: [
      { q:`Advances in ${t.title} have raised ethical questions.`, ans:'TRUE' },
      { q:'The public is indifferent to developments in this field.', ans:'FALSE' },
      { q:'Regulatory frameworks are being updated to address new challenges.', ans:'TRUE' },
    ],
    summaryText: `Research into ${t.title} is growing rapidly (13)___. This field has important implications for (14)___. Governments are increasing (15)___ in this area.`,
    summaryOptions: ['A) globally  B) slowly  C) locally  D) rarely','A) entertainment  B) sport  C) society  D) tourism','A) regulation  B) investment  C) criticism  D) tourism'],
    summaryAnswers: [0,2,1],
    mcqPassage: `Leading experts in ${t.title} predict significant changes over the next decade. The main challenges include funding, public acceptance, and ethical considerations. International cooperation is seen as essential to making progress. Several major conferences are planned to address these issues.`,
    mcqQs: [
      { q:'What do experts predict over the next decade?', opts:['A) No change','B) Significant changes','C) Decline in interest','D) Less funding'], ans:1 },
      { q:'What is seen as essential to making progress?', opts:['A) More conferences','B) National competition','C) International cooperation','D) Reduced regulation'], ans:2 },
    ]
  });
}

function makeReadingTest(idx) {
  const { id, num, title, color } = readingTopics[idx];
  const p = readingPassages[idx];
  return {
    id, title: `Reading Mock ${num}`, level: 'B2–C1',
    totalQuestions: 15, duration: 60, color,
    parts: [
      {
        id: `${id}P1`, partNum: 1, title: 'Part 1 — Gap Fill',
        instruction: 'Read the text. Fill in each gap with ONE word that fits the context.',
        type: 'gap_fill', questionRange: '1–6',
        passage: p.gapText, passageTitle: p.gapTitle,
        questions: p.gapAnswers.map((ans, i) => ({ qNum: i+1, answer: ans, alt: [ans] }))
      },
      {
        id: `${id}P2`, partNum: 2, title: 'Part 2 — Reading Comprehension',
        instruction: 'Read the passage and choose the best answer (A, B, C or D).',
        type: 'short_answer', questionRange: '7–9', passage: p.shortPassage,
        questions: p.shortQs.map((q, i) => ({ qNum: 7+i, question: q.q, options: q.opts, answer: q.ans }))
      },
      {
        id: `${id}P3`, partNum: 3, title: 'Part 3 — True / False / Not Given',
        instruction: 'Do the following statements agree with the text? Write TRUE, FALSE, or NOT GIVEN.',
        type: 'true_false', questionRange: '10–12', passage: p.tfPassage,
        questions: p.tfQs.map((q, i) => ({ qNum: 10+i, question: q.q, answer: q.ans }))
      },
      {
        id: `${id}P4`, partNum: 4, title: 'Part 4 — Summary Completion',
        instruction: 'Complete the summary. Choose from the options below.',
        type: 'summary', questionRange: '13–15',
        passage: p.mcqPassage,
        summaryText: p.summaryText,
        options: p.summaryOptions,
        questions: p.summaryAnswers.map((ans, i) => ({ qNum: 13+i, answer: ans }))
      },
      {
        id: `${id}P5`, partNum: 5, title: 'Part 5 — Multiple Choice',
        instruction: 'Choose the best answer (A, B, C or D).',
        type: 'multiple_choice', questionRange: 'Ext 1–2', passage: p.mcqPassage,
        questions: p.mcqQs.map((q, i) => ({ qNum: 16+i, question: q.q, options: q.opts, answer: q.ans }))
      }
    ]
  };
}

// ===================== WRITING TESTS (18-32) =====================
const writingPrompts = [
  { title:'Global Warming', infEmail:'Write an email to a classmate about a documentary on climate change you watched recently. Share what you learnt and invite them to watch it.', formalLetter:'Write a formal letter to your local council expressing concern about air pollution in your area. Suggest two practical solutions and request a response.', essay:'Some experts believe that individuals are more responsible for climate change than governments. Others think governments should take the lead. Discuss both views and give your opinion.', imgs:['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400','https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'], color:'#378ADD' },
  { title:'Technology & Society', infEmail:'Write an email to a friend about a new app you recently discovered. Explain what it does and why you recommend it.', formalLetter:'Write a formal letter to a technology company complaining about a defective product you purchased. Include details of the problem and request a replacement.', essay:'Technology has made people\'s lives easier, but it has also created new problems. Discuss the advantages and disadvantages of technology in modern life.', imgs:['https://images.unsplash.com/photo-1518770660439-4636190af475?w=400','https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400'], color:'#1D9E75' },
  { title:'Healthy Lifestyles', infEmail:'Write an email to a relative encouraging them to adopt healthier habits. Share what changes you have made yourself.', formalLetter:'Write a formal letter to a hospital director suggesting improvements to patient care. Mention at least two specific areas and request action.', essay:'Some people think sport and physical activity should be compulsory in schools. Others believe students should have more choice. Discuss both views and give your opinion.', imgs:['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400','https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400'], color:'#EF9F27' },
  { title:'Education Systems', infEmail:'Write an email to a friend about your experience of online learning. Describe what you enjoyed and what was challenging.', formalLetter:'Write a formal letter to a school headteacher suggesting a new after-school activity. Explain its benefits and how it could be implemented.', essay:'Some people think that exams are the most effective way to assess students\' abilities. Others prefer continuous assessment. Discuss both views and give your own opinion.', imgs:['https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400','https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'], color:'#D85A30' },
  { title:'Social Media', infEmail:'Write an email to a friend discussing how social media has changed your daily life. Include positive and negative effects.', formalLetter:'Write a formal letter to a newspaper editor responding to an article about the negative effects of social media on young people. Give your own view.', essay:'Social media has both united and divided society. Discuss the positive and negative effects of social media and give your own opinion.', imgs:['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400','https://images.unsplash.com/photo-1432888622747-4eb9a8f2c298?w=400'], color:'#7F77DD' },
  { title:'Travel & Tourism', infEmail:'Write an email to a friend describing a trip you took recently. Tell them about the highlights and any problems you encountered.', formalLetter:'Write a formal letter to a travel agency complaining about a holiday that did not match the description in their brochure. Request compensation.', essay:'Some people believe that tourism has more negative effects than positive ones on local communities. Others disagree. Discuss both views and give your opinion.', imgs:['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400'], color:'#D4537E' },
  { title:'Work & Careers', infEmail:'Write an email to a friend who is looking for a job. Give them advice based on your own experience.', formalLetter:'Write a formal letter to a company applying for a summer internship. Explain why you are suitable and what you hope to gain.', essay:'Many young people today change jobs frequently rather than staying with one employer for their whole career. Discuss the advantages and disadvantages of this trend.', imgs:['https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400','https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'], color:'#378ADD' },
  { title:'Environment & Nature', infEmail:'Write an email to a friend about a nature trip you went on. Describe what you saw and how it affected you.', formalLetter:'Write a formal letter to a local government official asking for better protection of a local natural area. Mention two specific concerns.', essay:'Protecting the natural environment is the most important challenge facing the world today. To what extent do you agree or disagree with this statement?', imgs:['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400','https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400'], color:'#1D9E75' },
  { title:'Food & Nutrition', infEmail:'Write an email to a friend about a new restaurant you visited. Describe the food and atmosphere.', formalLetter:'Write a formal letter to a supermarket manager complaining about the poor quality of food items you recently purchased.', essay:'Some people think that the government should regulate what people eat to improve public health. Others believe this is an infringement of personal freedom. Discuss both views.', imgs:['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400','https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400'], color:'#EF9F27' },
  { title:'Science & Innovation', infEmail:'Write an email to a classmate about a science project or discovery that you read about and found exciting.', formalLetter:'Write a formal letter to a research institute requesting a work experience placement. Explain your interest in science and your relevant skills.', essay:'Scientific advances have brought great benefits but also serious risks to humanity. Discuss the positive and negative effects of scientific progress.', imgs:['https://images.unsplash.com/photo-1532094349884-543559059bdb?w=400','https://images.unsplash.com/photo-1507668339897-8a035aa9527d?w=400'], color:'#D85A30' },
  { title:'Arts & Culture', infEmail:'Write an email to a friend about a concert, exhibition or cultural event you attended recently.', formalLetter:'Write a formal letter to a theatre director suggesting a new performance or cultural programme for young people in your community.', essay:'In many countries, government funding for the arts is being reduced. Some people think this is acceptable, while others disagree. Discuss both views and give your own opinion.', imgs:['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400','https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'], color:'#7F77DD' },
  { title:'Housing & Urban Life', infEmail:'Write an email to a friend who is moving to a new city. Give advice about finding accommodation and settling in.', formalLetter:'Write a formal letter to a landlord reporting maintenance problems in a rented property. Describe the issues and request immediate action.', essay:'Cities are growing rapidly as more people move from rural areas. Discuss the advantages and disadvantages of living in a large city.', imgs:['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400','https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400'], color:'#D4537E' },
  { title:'Crime & Justice', infEmail:'Write an email to a friend about a book or film about crime that you recently read or watched.', formalLetter:'Write a formal letter to a local police chief suggesting measures to improve safety in your neighbourhood.', essay:'Some people believe that longer prison sentences are the most effective way to reduce crime. Others think rehabilitation is more important. Discuss both views.', imgs:['https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=400','https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'], color:'#378ADD' },
  { title:'Mental Health', infEmail:'Write an email to a friend who seems stressed. Offer support and suggest ways they could manage their stress.', formalLetter:'Write a formal letter to a company director recommending the introduction of mental health support programmes for employees.', essay:'There is growing awareness of mental health issues in society. Some argue that schools should do more to support students\' mental health. Discuss this issue and give your view.', imgs:['https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400','https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400'], color:'#1D9E75' },
  { title:'Globalisation', infEmail:'Write an email to a friend about your experience of learning about a different culture or language.', formalLetter:'Write a formal letter to a university admissions office applying for an international exchange programme. Explain why you are suitable and what you hope to achieve.', essay:'Globalisation has brought people closer together but has also led to the loss of local cultures and traditions. Discuss the positive and negative effects of globalisation.', imgs:['https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=400','https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?w=400'], color:'#EF9F27' },
];

const writingColors = ['#378ADD','#1D9E75','#EF9F27','#D85A30','#7F77DD','#D4537E'];

function makeWritingTest(idx) {
  const n = 18 + idx;
  const wp = writingPrompts[idx];
  const color = writingColors[idx % writingColors.length];
  return {
    id: `WT${n}`, title: `Writing Test ${n}`, level: 'B1–C1',
    totalParts: 3, color,
    parts: [
      {
        id: `WT${n}P1`, partNum: 1, level: 'B1', color: '#1D9E75',
        title: 'Part 1.1 — Informal Email',
        minWords: 50, maxWords: 80,
        prompt: wp.infEmail,
        tips: ['Start with "Hi [name],"', 'Use casual language and contractions', 'Share personal feelings and opinions', 'End with: Take care, / See you soon,']
      },
      {
        id: `WT${n}P2`, partNum: 2, level: 'B2', color: '#EF9F27',
        title: 'Part 1.2 — Formal Letter',
        minWords: 120, maxWords: 150,
        prompt: wp.formalLetter,
        tips: ['Start with "Dear Sir/Madam,"', 'Use formal vocabulary throughout', 'State your purpose clearly in the first paragraph', 'End with: Yours faithfully,']
      },
      {
        id: `WT${n}P3`, partNum: 3, level: 'C1', color: '#7F77DD',
        title: 'Part 2 — Discussion Essay',
        minWords: 190, maxWords: 230,
        prompt: wp.essay,
        images: wp.imgs,
        tips: ['Introduction: paraphrase the topic and state what you will discuss', 'Body 1: first viewpoint with supporting argument', 'Body 2: opposing viewpoint with supporting argument', 'Conclusion: your own opinion with clear reasoning']
      }
    ]
  };
}

// ===================== SPEAKING TESTS (17-31) =====================
const speakingData = [
  { interview: ['What are the biggest challenges young people face today?', 'How has technology changed the way you learn?', 'Describe a person who has had a big influence on your life.'], imgs: ['https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare the benefits of studying at university versus learning a trade.','What are the advantages of the situation shown in the first image?','Which option do you personally prefer, and why?'], longTurn: 'Describe a time when you had to overcome a significant challenge in your studies or work.', discussion: 'Universities should be free for all students, regardless of their background.', color:'#378ADD' },
  { interview: ['What kind of news do you follow and why?', 'How important is it to speak a foreign language today?', 'Describe your ideal working environment.'], imgs: ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare working in a large company versus a small start-up.','What are the main advantages of the situation shown in the first image?','Which would you prefer and why?'], longTurn: 'Talk about an important news event that happened recently and explain its significance.', discussion: 'Remote working is better for productivity than working in a traditional office.', color:'#1D9E75' },
  { interview: ['What is the most interesting city you have ever visited?', 'How do you think cities will be different in 50 years?', 'Describe a tradition or festival that is important in your culture.'], imgs: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare life in a big city versus life in a rural area.','What are the advantages of the place shown in the first image?','Where would you prefer to live and why?'], longTurn: 'Describe a place you have visited that made a strong impression on you.', discussion: 'Tourism does more harm than good to local communities and the environment.', color:'#EF9F27' },
  { interview: ['What is the most important skill for success in life?', 'How has the internet changed the way people communicate?', 'Describe a goal you would like to achieve in the next five years.'], imgs: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare the role of technology in education compared to traditional teaching methods.','What advantages does the first image suggest?','Which approach do you think is more effective?'], longTurn: 'Describe a skill you have learned that you are particularly proud of and explain how it has benefited you.', discussion: 'Social media has done more harm than good to society.', color:'#D85A30' },
  { interview: ['What are the advantages of living in a multicultural society?', 'How important is sport in your life?', 'Describe an experience where you had to work as part of a team.'], imgs: ['https://images.unsplash.com/photo-1543368851-6f9c1a69a4f1?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1526676037927-acf33c7c0dd5?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare individual sports with team sports.','What are the main benefits shown in the first image?','Which type of sport do you personally prefer?'], longTurn: 'Describe an occasion when you worked in a team to solve a problem or complete a project.', discussion: 'Competitive sport teaches children important life skills and should be compulsory in schools.', color:'#7F77DD' },
  { interview: ['What environmental issue concerns you most?', 'How can individuals reduce their carbon footprint?', 'Describe a time when you made a change in your lifestyle to be more environmentally friendly.'], imgs: ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare traditional energy sources with renewable alternatives.','What environmental benefits does the second image suggest?','Which do you think is more important — individual action or government policy?'], longTurn: 'Describe an environmental problem in your country and discuss possible solutions.', discussion: 'Governments should ban the use of fossil fuels completely within the next ten years.', color:'#D4537E' },
  { interview: ['What is your opinion of the healthcare system in your country?', 'How important is mental health awareness today?', 'Describe a time when you helped a friend or family member who was going through a difficult time.'], imgs: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare public healthcare systems with private healthcare.','What are the advantages shown in the first image?','Which system do you think is better and why?'], longTurn: 'Talk about the importance of mental health and describe steps people can take to maintain good mental well-being.', discussion: 'Governments should invest more in mental health services than physical health services.', color:'#378ADD' },
  { interview: ['What is your favourite type of music and why?', 'How has streaming changed the music and film industry?', 'Describe a film or book that had a significant impact on you.'], imgs: ['https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare attending a live concert with streaming music at home.','What advantages does the experience in the first image offer?','Which do you personally prefer and why?'], longTurn: 'Describe a piece of art, music, or literature that you find particularly meaningful.', discussion: 'The arts are just as important as science and should receive equal government funding.', color:'#1D9E75' },
  { interview: ['What do you think is the most important invention of the last 100 years?', 'How do you think artificial intelligence will change daily life in the future?', 'Describe a time when technology helped you solve a problem.'], imgs: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare the impact of the smartphone with the impact of the internet.','What advantages does the technology shown in the first image offer?','Which invention do you think has had the greater impact?'], longTurn: 'Describe an important technological development and discuss how it has changed society.', discussion: 'Artificial intelligence will eventually replace most human workers, and this is a positive development.', color:'#EF9F27' },
  { interview: ['How important is food to your cultural identity?', 'What are the benefits and drawbacks of vegetarianism?', 'Describe your favourite meal and explain its significance to you.'], imgs: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare eating at home with eating at a restaurant.','What advantages are shown in the first image?','Which do you personally prefer and why?'], longTurn: 'Describe a food tradition in your culture and explain its importance to your community.', discussion: 'Governments should tax unhealthy foods to encourage people to make healthier choices.', color:'#D85A30' },
  { interview: ['What are the biggest advantages and disadvantages of globalisation?', 'How has migration affected your country or region?', 'Describe a cultural experience that taught you something new.'], imgs: ['https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1484318571209-661cf29a69c3?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare life in a globalised world with life before globalisation.','What does the first image suggest about modern society?','Do you think globalisation is mostly positive or mostly negative?'], longTurn: 'Discuss the effects of globalisation on culture, economy, and identity.', discussion: 'National cultures and traditions are being destroyed by globalisation.', color:'#7F77DD' },
  { interview: ['What role do you think older people play in society?', 'How are attitudes to ageing changing in modern society?', 'Describe an older person who has inspired or influenced you.'], imgs: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare the challenges faced by older generations with those faced by younger generations.','What does the first image tell you about modern workplaces?','Which generation do you think faces greater challenges today?'], longTurn: 'Describe the contribution that older members of your community make to society.', discussion: 'Older people should retire early to create opportunities for young workers.', color:'#D4537E' },
  { interview: ['What is the best way to learn a new language?', 'How important is cultural awareness when learning a language?', 'Describe your experience of learning English or another foreign language.'], imgs: ['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare learning a language in a classroom with learning it by living abroad.','What advantages does the approach shown in the first image have?','Which method do you think is most effective?'], longTurn: 'Talk about the importance of foreign language learning and the challenges involved.', discussion: 'Every student should be required to learn at least two foreign languages at school.', color:'#378ADD' },
  { interview: ['What are the most important qualities of a good leader?', 'How has the role of women in the workplace changed in recent decades?', 'Describe a challenge you overcame and what you learned from it.'], imgs: ['https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare traditional leadership styles with more modern, collaborative approaches.','What does the first image suggest about modern leadership?','Which leadership style do you think is more effective?'], longTurn: 'Describe a leader you admire and explain the qualities that make them effective.', discussion: 'Women are still not given equal opportunities in the workplace, and this must change urgently.', color:'#1D9E75' },
  { interview: ['What do you think is the greatest challenge facing humanity in the 21st century?', 'How important is international cooperation in solving global problems?', 'Describe a global problem that you feel passionate about and explain why.'], imgs: ['https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200','https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'], comparison: ['Compare the role of international organisations like the UN with individual governments in solving global problems.','What global challenge does the first image represent?','Do you think international cooperation or national action is more effective?'], longTurn: 'Discuss a major global challenge and suggest what can be done at international, national, and individual levels to address it.', discussion: 'International organisations like the United Nations are ineffective and should be reformed or abolished.', color:'#EF9F27' },
];

const speakingColors = ['#378ADD','#1D9E75','#EF9F27','#D85A30','#7F77DD','#D4537E'];

function makeSpeakingTest(idx) {
  const n = 17 + idx;
  const sd = speakingData[idx];
  const color = speakingColors[idx % speakingColors.length];
  return {
    id: n,
    title: `Speaking Mock Test ${n}`,
    level: 'A2–C1',
    duration: '15 min',
    color,
    parts: [
      {
        id: `SP${n}_1`, part: '1.1', partNum: 1, level: 'A2',
        title: 'Part 1.1 — Interview',
        description: 'Answer 3 personal questions about your life, opinions and experiences.',
        timing: '3 × 30 sec', prepTime: 0, type: 'interview',
        color: '#1D9E75',
        questions: sd.interview.map((q, i) => ({
          id: `q${i+1}`, question: q, speakTime: 30,
          tips: ['Answer with 2–3 sentences','Use clear grammar and vocabulary','Add a personal detail or example']
        }))
      },
      {
        id: `SP${n}_2`, part: '1.2', partNum: 2, level: 'B1',
        title: 'Part 1.2 — Comparison',
        description: 'Compare two images and answer related questions.',
        timing: '45 sec + 2 × 30 sec', prepTime: 10, type: 'comparison',
        color: '#EF9F27',
        images: sd.imgs,
        questions: sd.comparison.map((q, i) => ({
          id: `q${i+1}`, question: q,
          speakTime: i === 0 ? 45 : 30,
          tips: i === 0 ? ['Use: In the first picture... / In the second picture...','Use: whereas, while, however','Keep talking for the full time'] : ['Give 2–3 clear points','Support your view with a reason']
        }))
      },
      {
        id: `SP${n}_3`, part: '2', partNum: 3, level: 'B2',
        title: 'Part 2 — Long Turn',
        description: 'Speak for 2 minutes on a prompt with guiding points.',
        timing: '1 min prep + 2 min speaking', prepTime: 60, type: 'long_turn',
        color: '#D85A30',
        prompt: sd.longTurn,
        guidingPoints: ['What is it / what happened?','Why is it significant to you?','What impact has it had on your thinking or behaviour?'],
        speakTime: 120,
        tips: ['Brief introduction → 3 main points → short conclusion','Use a variety of tenses and structures','Include specific details and examples']
      },
      {
        id: `SP${n}_4`, part: '3', partNum: 4, level: 'C1',
        title: 'Part 3 — Discussion',
        description: 'Discuss a statement from both sides for 2 minutes.',
        timing: '1 min prep + 2 min speaking', prepTime: 60, type: 'discussion',
        color: '#7F77DD',
        statement: sd.discussion,
        argumentsFor: ['Supports economic and social development','Improves overall quality of life','Creates new opportunities for many people'],
        argumentsAgainst: ['Can lead to inequality and unfairness','May harm existing traditions and values','Does not benefit all groups equally'],
        speakTime: 120,
        tips: ['Present both sides before giving your view','Use: On one hand... / On the other hand...','Conclude with your own opinion and a clear reason']
      }
    ]
  };
}

// ===================== ADD TO DATA =====================
console.log('Adding 15 Listening tests...');
for (let i = 0; i < 15; i++) {
  data.LISTENING_TESTS.push(makeListeningTest(i));
}

console.log('Adding 15 Reading tests...');
for (let i = 0; i < 15; i++) {
  data.READING_TESTS.push(makeReadingTest(i));
}

console.log('Adding 15 Writing tests...');
for (let i = 0; i < 15; i++) {
  data.WRITING_TESTS.push(makeWritingTest(i));
}

console.log('Adding 15 Speaking tests...');
for (let i = 0; i < 15; i++) {
  data.SPEAKING_TESTS.push(makeSpeakingTest(i));
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n✅ Done!');
console.log('LISTENING_TESTS:', data.LISTENING_TESTS.length);
console.log('READING_TESTS:', data.READING_TESTS.length);
console.log('WRITING_TESTS:', data.WRITING_TESTS.length);
console.log('SPEAKING_TESTS:', data.SPEAKING_TESTS.length);
