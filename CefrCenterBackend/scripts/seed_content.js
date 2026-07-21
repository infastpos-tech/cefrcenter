import mongoose from "mongoose";
import dotenv from "dotenv";
import Writing from "../models/Writing.js";
import Speaking from "../models/Speaking.js";
import Reading from "../models/Reading.js";
import Listening from "../models/Listening.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env!");
  process.exit(1);
}

// Writing Exercise Data
const writingData = [
  // A1 Level
  {
    id: "w-a1-001",
    title: "My Family",
    level: "A1",
    type: "essay",
    content: "Write about your family members",
    instruction: "Write 50-80 words about your family. Include names, relationships, and what they do.",
    example: "My family has four people. My father is a teacher. My mother is a doctor. I have one brother. His name is Ahmed.",
    hints: ["Use simple present tense", "Start with 'My family...'", "Use 'is' for descriptions"],
    sampleAnswer: "My family has four people. My father is Ahmad. He is a teacher. My mother is Fatima. She is a doctor. My brother is Ali. He is a student. We live together happily.",
    vocabulary: ["family", "father", "mother", "brother", "sister", "teacher", "doctor"],
    grammarFocus: ["Present simple", "Possessives", "Family vocabulary"],
    difficulty: 1
  },
  {
    id: "w-a1-002",
    title: "Fill in Blank - Daily Routine",
    level: "A1",
    type: "fill-in-blank",
    content: "Complete the sentences about daily routine",
    instruction: "Fill in the missing words: wake up, go to school, eat breakfast, sleep",
    example: "I ___ at 7 AM. I ___ breakfast at 8 AM. Then I ___ to school.",
    sampleAnswer: "I wake up at 7 AM. I eat breakfast at 8 AM. Then I go to school.",
    vocabulary: ["wake up", "breakfast", "school", "sleep", "morning"],
    grammarFocus: ["Verb phrases", "Time expressions"],
    difficulty: 1
  },
  {
    id: "w-a1-003",
    title: "Grammar Correction - Simple Sentences",
    level: "A1",
    type: "grammar-correction",
    content: "Correct these sentences",
    instruction: "Find and correct the mistakes",
    example: "He go to school. She don't like apples.",
    sampleAnswer: "He goes to school. She doesn't like apples.",
    vocabulary: ["go", "like", "apples", "school"],
    grammarFocus: ["Verb conjugation", "Third person singular"],
    difficulty: 1
  },
  {
    id: "w-a1-004",
    title: "Sentence Building - Food",
    level: "A1",
    type: "sentence-building",
    content: "Build sentences using the words",
    instruction: "Make sentences from these words: I / like / pizza. She / eat / rice. They / drink / water.",
    sampleAnswer: "I like pizza. She eats rice. They drink water.",
    vocabulary: ["like", "eat", "drink", "pizza", "rice", "water"],
    grammarFocus: ["Word order", "Verb forms"],
    difficulty: 1
  },
  {
    id: "w-a1-005",
    title: "Story Writing - My Pet",
    level: "A1",
    type: "story-writing",
    content: "Write a short story about a pet",
    instruction: "Write 50 words about your pet or an imaginary pet",
    example: "I have a dog. Her name is Luna. She is black. Luna is friendly and smart. She likes to play in the park.",
    sampleAnswer: "I have a dog named Buddy. He is brown and white. Buddy is very friendly. He likes to play with a ball. Every day I take him to the park.",
    vocabulary: ["dog", "cat", "pet", "friendly", "play", "park"],
    grammarFocus: ["Simple past", "Description"],
    difficulty: 1
  },
  // A2 Level
  {
    id: "w-a2-001",
    title: "Essay - My Favorite Holiday",
    level: "A2",
    type: "essay",
    content: "Describe your favorite holiday or festival",
    instruction: "Write 100-150 words. Include: what holiday, when it is, how you celebrate, what you enjoy about it",
    example: "Eid is my favorite holiday. It comes after Ramadan. I celebrate with my family by wearing new clothes.",
    sampleAnswer: "My favorite holiday is Eid. It comes after Ramadan, which is a holy month. On Eid day, I wear new clothes and go to the mosque early in the morning. My family prepares special food. We visit relatives and friends. I like Eid because everyone is happy and we spend time together.",
    vocabulary: ["holiday", "celebrate", "festival", "tradition", "prepare", "enjoy"],
    grammarFocus: ["Present simple", "Linking words", "Sentence structures"],
    difficulty: 2
  },
  {
    id: "w-a2-002",
    title: "Fill in Blank - At the Restaurant",
    level: "A2",
    type: "fill-in-blank",
    content: "Complete the dialogue at a restaurant",
    instruction: "Fill in: order, menu, waiter, bill, table",
    example: "Waiter: 'Here is your ___.' Customer: 'Thank you. I want to ___ pizza.' Waiter: 'Good choice. I'll bring it soon.'",
    sampleAnswer: "Waiter: 'Here is your menu.' Customer: 'Thank you. I want to order pizza.' Waiter: 'Good choice. I'll bring it soon.'",
    vocabulary: ["restaurant", "waiter", "menu", "order", "dish", "bill"],
    grammarFocus: ["Dialogues", "Requests"],
    difficulty: 2
  },
  {
    id: "w-a2-003",
    title: "Grammar Correction - Past Tense",
    level: "A2",
    type: "grammar-correction",
    content: "Correct the past tense mistakes",
    instruction: "Find and fix errors in past tense",
    example: "Yesterday, I was go to the market. She buyed a new dress.",
    sampleAnswer: "Yesterday, I went to the market. She bought a new dress.",
    vocabulary: ["yesterday", "market", "dress", "shop"],
    grammarFocus: ["Past simple", "Irregular verbs"],
    difficulty: 2
  },
  {
    id: "w-a2-004",
    title: "Sentence Building - Travel",
    level: "A2",
    type: "sentence-building",
    content: "Build sentences about travel",
    instruction: "Make complete sentences: Last summer / travel / Turkey. I / visit / ancient ruins. The / people / very friendly.",
    sampleAnswer: "Last summer I traveled to Turkey. I visited ancient ruins. The people were very friendly.",
    vocabulary: ["travel", "visit", "trip", "country", "experience"],
    grammarFocus: ["Past simple", "Adjectives"],
    difficulty: 2
  },
  {
    id: "w-a2-005",
    title: "Story Writing - An Interesting Day",
    level: "A2",
    type: "story-writing",
    content: "Write about an interesting day in your life",
    instruction: "Write 100 words about a memorable day",
    example: "One day I went to the beach. I met my old friend there unexpectedly. We spent the whole day together.",
    sampleAnswer: "Last week I had an interesting day. I went to the beach with my family. We played volleyball and swam in the sea. In the afternoon, we had a picnic. It was very fun and I felt very happy. When we went home, I was tired but satisfied.",
    vocabulary: ["memorable", "unexpected", "beach", "picnic", "experience"],
    grammarFocus: ["Past narrative", "Transitions"],
    difficulty: 2
  },
  // B1 Level
  {
    id: "w-b1-001",
    title: "Essay - Environmental Protection",
    level: "B1",
    type: "essay",
    content: "Discuss the importance of protecting the environment",
    instruction: "Write 150-200 words. Include: problems, solutions, your opinion, examples",
    example: "The environment faces serious challenges today. We must take action to protect our planet.",
    sampleAnswer: "Environmental protection is crucial for our future. Today, we face serious problems like pollution, climate change, and deforestation. These issues threaten wildlife and human health. We need to take immediate action. Solutions include using renewable energy, reducing waste, and protecting forests. Governments and individuals must work together. Companies should adopt sustainable practices. People should reduce consumption and recycle more. If we don't act now, future generations will suffer. It's our responsibility to protect the planet.",
    vocabulary: ["pollution", "environment", "sustainable", "renewable", "deforestation", "responsibility"],
    grammarFocus: ["Complex sentences", "Passive voice", "Connectors"],
    difficulty: 3
  },
  {
    id: "w-b1-002",
    title: "Fill in Blank - Job Interview",
    level: "B1",
    type: "fill-in-blank",
    content: "Complete the job interview dialogue",
    instruction: "Fill in: qualifications, responsibilities, salary, experience, position",
    example: "Interviewer: 'What are your ___?' Candidate: 'I have a degree and three years of ___.'",
    sampleAnswer: "Interviewer: 'What are your qualifications?' Candidate: 'I have a degree and three years of experience.'",
    vocabulary: ["interview", "qualifications", "experience", "position", "salary"],
    grammarFocus: ["Question formation", "Professional language"],
    difficulty: 3
  },
  {
    id: "w-b1-003",
    title: "Grammar Correction - Complex Sentences",
    level: "B1",
    type: "grammar-correction",
    content: "Correct errors in complex sentences",
    instruction: "Fix the mistakes",
    example: "If I will have time, I go to the cinema. She worked hard although she was tired.",
    sampleAnswer: "If I have time, I will go to the cinema. Although she was tired, she worked hard.",
    vocabulary: ["although", "because", "if", "while"],
    grammarFocus: ["Conditionals", "Subordinate clauses"],
    difficulty: 3
  },
  {
    id: "w-b1-004",
    title: "Sentence Building - Technology",
    level: "B1",
    type: "sentence-building",
    content: "Build sentences about technology",
    instruction: "Make sentences: Technology / change / our lives. Smartphones / allow / us / to communicate / everywhere. We / should / be careful / about / screen time.",
    sampleAnswer: "Technology has changed our lives. Smartphones allow us to communicate everywhere. We should be careful about screen time.",
    vocabulary: ["technology", "communicate", "smartphone", "internet", "digital"],
    grammarFocus: ["Present perfect", "Should/Ought to"],
    difficulty: 3
  },
  {
    id: "w-b1-005",
    title: "Story Writing - A Turning Point",
    level: "B1",
    type: "story-writing",
    content: "Write about a turning point in your life",
    instruction: "Write 150 words about a moment that changed your perspective",
    example: "A moment I will never forget changed my life completely.",
    sampleAnswer: "The most important turning point in my life happened during university. I failed an important exam and felt devastated. However, this failure taught me valuable lessons. I realized I needed to work harder and study more effectively. I changed my approach and became more disciplined. This experience helped me develop resilience and determination. Now I understand that failure is not the end but an opportunity to improve. This moment shaped my character and influenced my future decisions.",
    vocabulary: ["turning point", "devastated", "resilience", "determination", "perspective"],
    grammarFocus: ["Narrative structure", "Reflection"],
    difficulty: 3
  },
  // B2 Level
  {
    id: "w-b2-001",
    title: "Essay - Impact of Social Media",
    level: "B2",
    type: "essay",
    content: "Analyze both positive and negative effects of social media",
    instruction: "Write 200-250 words. Include: arguments for/against, evidence, conclusion, balanced view",
    sampleAnswer: "Social media has become an integral part of modern society, bringing both significant benefits and serious concerns. On the positive side, platforms like Facebook and Twitter enable people to maintain relationships across distances and create communities around shared interests. Businesses benefit from direct consumer engagement and cost-effective marketing. However, the negative impacts are equally substantial. Social media contributes to mental health problems, particularly among young people, through comparison and cyberbullying. Misinformation spreads rapidly, undermining public discourse and democratic processes. Additionally, excessive use reduces face-to-face interaction and attention spans. While social media offers genuine advantages in connectivity and information sharing, society must address its psychological and social costs through regulation and digital literacy education. The future depends on balancing innovation with responsibility.",
    vocabulary: ["integral", "cyberbullying", "misinformation", "discourse", "regulation", "literacy"],
    grammarFocus: ["Complex argumentation", "Academic tone", "Hedging language"],
    difficulty: 4
  },
  {
    id: "w-b2-002",
    title: "Fill in Blank - Academic Writing",
    level: "B2",
    type: "fill-in-blank",
    content: "Complete the academic paragraph",
    instruction: "Fill in: Furthermore, research indicates, consequently, whereas",
    example: "___ previous studies, this research ___ that social factors significantly influence behavior. ___, interventions should focus on community engagement.",
    sampleAnswer: "Whereas previous studies focused on individual factors, this research indicates that social factors significantly influence behavior. Furthermore, research shows that interventions should focus on community engagement. Consequently, policymakers must reconsider their approaches.",
    vocabulary: ["research", "indicate", "intervention", "policymaker", "perspective"],
    grammarFocus: ["Academic connectors", "Evidence presentation"],
    difficulty: 4
  },
  {
    id: "w-b2-003",
    title: "Grammar Correction - Advanced Structures",
    level: "B2",
    type: "grammar-correction",
    content: "Correct advanced grammar mistakes",
    instruction: "Fix errors in complex structures",
    example: "Not only he is intelligent but also he is creative. The more you practice, most fluent you become.",
    sampleAnswer: "Not only is he intelligent but also creative. The more you practice, the more fluent you become.",
    vocabulary: ["intelligent", "creative", "fluent", "structure"],
    grammarFocus: ["Inverted structures", "Comparative patterns"],
    difficulty: 4
  },
  {
    id: "w-b2-004",
    title: "Sentence Building - Abstract Ideas",
    level: "B2",
    type: "sentence-building",
    content: "Build sentences expressing complex ideas",
    instruction: "Make sentences: The philosopher / argue / that / happiness / depend / not / on material wealth. Whereas / most people / pursue / money, / true fulfillment / come / from / meaningful relationships.",
    sampleAnswer: "The philosopher argues that happiness does not depend on material wealth. Whereas most people pursue money, true fulfillment comes from meaningful relationships.",
    vocabulary: ["philosopher", "argue", "fulfillment", "material", "meaningful"],
    grammarFocus: ["Philosophical language", "Contrasts"],
    difficulty: 4
  },
  {
    id: "w-b2-005",
    title: "Story Writing - Personal Growth",
    level: "B2",
    type: "story-writing",
    content: "Write a narrative about personal growth through challenges",
    instruction: "Write 200 words about overcoming adversity",
    sampleAnswer: "Throughout my career, I faced numerous challenges that seemed insurmountable. Early on, I struggled with public speaking, which hindered my professional advancement. Rather than avoid presentations, I sought help through coaching and practice. Over time, my confidence grew, and I delivered increasingly complex talks. This journey taught me that personal growth requires stepping outside comfort zones. I learned to embrace failure as a learning opportunity rather than a setback. Colleagues noticed my transformation and began seeking my mentorship. This experience fundamentally changed my perspective on challenges. I now understand that adversity, when confronted courageously, becomes a catalyst for development. Looking back, I realize that the most valuable skills came from pushing through discomfort, not from comfort.",
    vocabulary: ["insurmountable", "hindered", "catalyst", "advancement", "mentorship"],
    grammarFocus: ["Reflective narrative", "Complex storytelling"],
    difficulty: 4
  },
  // C1 Level
  {
    id: "w-c1-001",
    title: "Essay - Philosophical Perspective",
    level: "C1",
    type: "essay",
    content: "Discuss the philosophical implications of artificial intelligence",
    instruction: "Write 250-300 words with sophisticated analysis and nuance",
    sampleAnswer: "The advent of artificial intelligence precipitates profound epistemological questions regarding cognition, consciousness, and the nature of intelligence itself. While proponents contend that AI represents an unprecedented achievement in cognitive science, skeptics argue it merely simulates understanding without genuine comprehension. This distinction bears significant philosophical weight. If machines can replicate human behavior indistinguishably, does consciousness require phenomenal experience, or merely functional equivalence? Furthermore, AI's trajectory raises existential concerns about human agency and autonomy. As algorithmic decision-making permeates domains from jurisprudence to medicine, we must interrogate whether ceding authority to ostensibly objective systems merely displaces rather than eliminates human bias. Conversely, one might argue that delegating cognitively demanding tasks liberates humanity for more transcendent pursuits. Nevertheless, this optimistic vision presupposes careful governance and ethical frameworks that remain conspicuously absent in current implementation. Ultimately, AI's implications transcend technology; they constitute a referendum on what we deem fundamentally human.",
    vocabulary: ["epistemological", "precipitate", "phenomenal", "jurisprudence", "transcendent"],
    grammarFocus: ["Sophisticated argumentation", "Nuanced expression"],
    difficulty: 5
  },
  {
    id: "w-c1-002",
    title: "Fill in Blank - Specialized Discourse",
    level: "C1",
    type: "fill-in-blank",
    content: "Complete specialized academic text",
    instruction: "Fill in: notwithstanding, perpetuate, substantiated, analogous",
    example: "___ empirical evidence, some theorists ___ outdated paradigms. ___ structural concerns ___ in contemporary discourse, though ___ mechanisms have been proposed.",
    sampleAnswer: "Notwithstanding empirical evidence, some theorists perpetuate outdated paradigms. Analogous structural concerns substantiated in contemporary discourse, though remedial mechanisms have been proposed.",
    vocabulary: ["empirical", "paradigm", "remedial", "discourse"],
    grammarFocus: ["Advanced connectors", "Specialized register"],
    difficulty: 5
  },
  {
    id: "w-c1-003",
    title: "Grammar Correction - Stylistic Nuance",
    level: "C1",
    type: "grammar-correction",
    content: "Correct subtle stylistic errors",
    instruction: "Refine the expressions for precision and elegance",
    example: "It could be argued that society changes constantly. The data demonstrated significant correlations between variables.",
    sampleAnswer: "Society undergoes perpetual transformation. The data evinced considerable correlations among variables.",
    vocabulary: ["perpetual", "transformation", "evince"],
    grammarFocus: ["Stylistic precision", "Register appropriateness"],
    difficulty: 5
  },
  {
    id: "w-c1-004",
    title: "Sentence Building - Nuanced Expression",
    level: "C1",
    type: "sentence-building",
    content: "Build sentences expressing sophisticated ideas",
    instruction: "Make sentences: Far from / being / reducible / to / economic / determinism, / human / behavior / evinces / complex / psychological / dimensions. The / interplay / between / structural / constraints / and / individual / agency / necessitates / nuanced / analysis.",
    sampleAnswer: "Far from being reducible to economic determinism, human behavior evinces complex psychological dimensions. The interplay between structural constraints and individual agency necessitates nuanced analysis.",
    vocabulary: ["reducible", "determinism", "evinces", "interplay", "necessitate"],
    grammarFocus: ["Sophisticated structure", "Academic register"],
    difficulty: 5
  },
  {
    id: "w-c1-005",
    title: "Story Writing - Existential Reflection",
    level: "C1",
    type: "story-writing",
    content: "Write an existential narrative about identity and authenticity",
    instruction: "Write 250 words exploring profound themes",
    sampleAnswer: "The protagonist's odyssey through existential crisis commenced with seemingly mundane circumstances—an offhand comment that precipitated radical introspection. Confronting the abyss between his constructed persona and putative authentic self, he grappled with fundamental questions about identity's nature. Was the self merely a narrative construct, perpetually revised to maintain social coherence? Or did some immutable essence persist beneath performative layers? Through this crucible, he discovered that authenticity itself constituted a chimera—the pursuit itself more consequential than attainment. Liberation paradoxically emerged from accepting this ontological ambiguity. Rather than seeking to unveil some hypothetical true self, he recognized that becoming entailed continuous negotiation between constraint and possibility. His journey illuminated a counterintuitive truth: genuine authenticity comprised embracing rather than denying the performative dimension of existence. Thus transformed through philosophical reckoning, he inhabited his contradictions with newfound equanimity.",
    vocabulary: ["odyssey", "precipitate", "introspection", "chimera", "ontological"],
    grammarFocus: ["Philosophical narrative", "Dense expression"],
    difficulty: 5
  }
];

// Speaking Exercise Data
const speakingData = [
  // A1 Level
  {
    id: "s-a1-001",
    title: "Greetings",
    level: "A1",
    type: "speaking-topic",
    prompt: "How do you greet someone you know? How do you greet someone you don't know?",
    description: "Practice basic greetings in English",
    followUpQuestions: ["What is the difference?", "When do you use 'Hello'?", "When do you say 'Hi'?"],
    keyVocabulary: ["hello", "hi", "good morning", "nice to meet you", "pleased", "you"],
    grammarPoints: ["Imperatives", "Responses"],
    sampleResponse: "Hello! I'm very happy to meet you. When I know someone, I say 'Hi!' When I don't know them, I say 'Hello, nice to meet you.'",
    duration: 2,
    difficulty: 1
  },
  {
    id: "s-a1-002",
    title: "Introduce Yourself",
    level: "A1",
    type: "self-introduction",
    prompt: "Tell us about yourself - your name, age, and what you do",
    description: "Practice introducing yourself in English",
    context: "Imagine you are at a social event",
    followUpQuestions: ["What is your name?", "How old are you?", "What do you do?"],
    keyVocabulary: ["name", "age", "student", "teacher", "doctor", "from"],
    grammarPoints: ["Present simple", "I am", "I like"],
    sampleResponse: "My name is Ahmed. I am 20 years old. I am a student. I study English. I like to read books. I am from Egypt.",
    duration: 3,
    difficulty: 1
  },
  {
    id: "s-a1-003",
    title: "Daily Conversation",
    level: "A1",
    type: "daily-conversation",
    prompt: "Have a conversation about your day",
    description: "Practice simple daily conversation",
    context: "Talk about what you did today",
    followUpQuestions: ["What did you do this morning?", "What did you eat?", "Did you have fun?"],
    keyVocabulary: ["morning", "afternoon", "breakfast", "lunch", "school", "home"],
    grammarPoints: ["Simple past", "What did you do?"],
    sampleResponse: "This morning I woke up at 7. I had breakfast at 8. I went to school. I studied English and math. At 12, I had lunch. In the afternoon, I played with my friends. At 6, I went home.",
    duration: 3,
    difficulty: 1
  },
  {
    id: "s-a1-004",
    title: "Ordering Food",
    level: "A1",
    type: "discussion-prompt",
    prompt: "You are at a restaurant. Order food.",
    description: "Practice ordering in a restaurant",
    context: "Imagine you are hungry",
    followUpQuestions: ["What do you want to eat?", "What do you want to drink?", "What do you like?"],
    keyVocabulary: ["menu", "please", "water", "coffee", "pizza", "rice"],
    grammarPoints: ["I want...", "I would like..."],
    sampleResponse: "Good afternoon! I want a menu, please. I want pizza and water. Thank you!",
    duration: 3,
    difficulty: 1
  },
  {
    id: "s-a1-005",
    title: "Family",
    level: "A1",
    type: "speaking-topic",
    prompt: "Tell me about your family",
    description: "Discuss your family members",
    followUpQuestions: ["How many people in your family?", "What are their names?", "What do they do?"],
    keyVocabulary: ["family", "mother", "father", "brother", "sister", "grandmother"],
    grammarPoints: ["Family vocabulary", "Has/Have"],
    sampleResponse: "My family has 5 people. My father is Ali. He is a teacher. My mother is Fatima. She is a doctor. I have two brothers, Mohammed and Ibrahim. They are students.",
    duration: 3,
    difficulty: 1
  },
  // A2 Level
  {
    id: "s-a2-001",
    title: "Hobbies and Interests",
    level: "A2",
    type: "speaking-topic",
    prompt: "What are your hobbies? Why do you enjoy them?",
    description: "Talk about your hobbies and interests",
    followUpQuestions: ["How often do you do it?", "When did you start?", "Do you do it alone or with friends?"],
    keyVocabulary: ["hobby", "enjoy", "hobby", "sports", "reading", "music", "painting"],
    grammarPoints: ["Why + because", "How often", "I enjoy"],
    sampleResponse: "My hobby is playing football. I enjoy it very much. I play three times a week with my friends. It keeps me healthy and happy. I also like reading books. I read every evening before sleep.",
    duration: 5,
    difficulty: 2
  },
  {
    id: "s-a2-002",
    title: "Vacation Plans",
    level: "A2",
    type: "discussion-prompt",
    prompt: "Describe your dream vacation",
    description: "Talk about where you would like to go and why",
    context: "Imagine you can go anywhere in the world",
    followUpQuestions: ["Where would you go?", "Who would you go with?", "What would you do there?"],
    keyVocabulary: ["beach", "mountain", "city", "travel", "vacation", "ticket"],
    grammarPoints: ["Would like to", "Going to", "Future plans"],
    sampleResponse: "I would like to go to Paris. It's a beautiful city with many museums and historical places. I want to visit the Eiffel Tower. I would go with my family. We would spend two weeks there exploring the city and enjoying French food.",
    duration: 5,
    difficulty: 2
  },
  {
    id: "s-a2-003",
    title: "Food and Restaurants",
    level: "A2",
    type: "daily-conversation",
    prompt: "Discuss your favorite food and restaurants",
    description: "Talk about food preferences and dining experiences",
    followUpQuestions: ["What is your favorite dish?", "Do you cook?", "Where do you usually eat?"],
    keyVocabulary: ["favorite", "delicious", "healthy", "vegetables", "meat", "recipe"],
    grammarPoints: ["My favorite...", "I prefer...", "Comparative adjectives"],
    sampleResponse: "My favorite food is biryani. It's very delicious and has rice, meat, and spices. I eat it on special occasions. I like cooking too. I usually eat at home with my family, but sometimes we go to restaurants on weekends.",
    duration: 5,
    difficulty: 2
  },
  {
    id: "s-a2-004",
    title: "School or Work",
    level: "A2",
    type: "speaking-topic",
    prompt: "Describe your school or workplace",
    description: "Talk about your education or work experience",
    followUpQuestions: ["What subjects do you study?", "How long have you been there?", "Do you like it?"],
    keyVocabulary: ["school", "subject", "teacher", "student", "colleague", "office"],
    grammarPoints: ["Present perfect", "Like/Enjoy", "Descriptions"],
    sampleResponse: "I am a student at Cairo University. I study engineering. I've been there for two years. I have wonderful teachers and friendly classmates. I like studying mathematics and physics. The campus is beautiful and has good facilities.",
    duration: 5,
    difficulty: 2
  },
  {
    id: "s-a2-005",
    title: "IELTS Speaking - Part 1",
    level: "A2",
    type: "ielts-style",
    prompt: "Tell me about your hometown",
    description: "Answer in IELTS speaking style",
    context: "You are in an IELTS exam",
    followUpQuestions: ["What is it famous for?", "Have you always lived there?", "What do you like about it?"],
    keyVocabulary: ["hometown", "location", "famous", "historical", "modern", "population"],
    grammarPoints: ["Describing places", "Present simple"],
    sampleResponse: "My hometown is Alexandria. It's a coastal city in the north of Egypt. It has a rich history and many historical monuments. The most famous is the Library of Alexandria. The city is known for its beautiful beaches. I was born and raised there. I like it because of its historical significance and the Mediterranean Sea.",
    duration: 5,
    difficulty: 2
  },
  // B1 Level
  {
    id: "s-b1-001",
    title: "Environmental Issues",
    level: "B1",
    type: "discussion-prompt",
    prompt: "What environmental issues concern you the most? What can we do about them?",
    description: "Discuss environmental problems and solutions",
    followUpQuestions: ["What causes pollution?", "Who should take action?", "What have you done?"],
    keyVocabulary: ["pollution", "climate change", "recycle", "sustainable", "renewable"],
    grammarPoints: ["Should/Ought to", "Conditional", "Passive voice"],
    sampleResponse: "Environmental pollution is a major concern for me. We are producing too much waste and using too much energy. Governments should implement stricter regulations. Companies should adopt sustainable practices. Individuals like us should reduce consumption and recycle more. We should use renewable energy sources. I personally try to minimize my plastic use and recycle whenever possible.",
    duration: 7,
    difficulty: 3
  },
  {
    id: "s-b1-002",
    title: "Technology and Society",
    level: "B1",
    type: "speaking-topic",
    prompt: "How has technology changed our lives? Is it always positive?",
    description: "Discuss technology's impact on society",
    followUpQuestions: ["What are the benefits?", "What are the drawbacks?", "How do you use technology?"],
    keyVocabulary: ["technology", "smartphone", "internet", "communication", "social media"],
    grammarPoints: ["Has changed", "Advantages/Disadvantages", "Compare and contrast"],
    sampleResponse: "Technology has transformed nearly every aspect of our lives. Communication has become instant and global. We can work remotely and access information easily. However, there are drawbacks. Social media causes mental health issues and reduces face-to-face interaction. Screen addiction is a real problem, especially among young people. We need to find balance. Technology should enhance our lives, not control them.",
    duration: 7,
    difficulty: 3
  },
  {
    id: "s-b1-003",
    title: "Education and Learning",
    level: "B1",
    type: "ielts-style",
    prompt: "What is the purpose of education? How should it change?",
    description: "IELTS-style discussion on education",
    context: "Structured IELTS response",
    followUpQuestions: ["What skills are important?", "Should education be free?", "Is online learning effective?"],
    keyVocabulary: ["education", "skills", "critical thinking", "practical", "theoretical"],
    grammarPoints: ["Present progressive", "Modal verbs", "Complex sentences"],
    sampleResponse: "Education serves multiple purposes: developing knowledge, critical thinking, and professional skills. In my opinion, education should evolve to emphasize practical skills alongside theoretical knowledge. Students need to learn problem-solving, creativity, and emotional intelligence. Traditional exams should be supplemented with project-based assessments. Online learning has become important, combining flexibility with quality education. However, classroom interaction remains valuable. Education should prepare people not just for careers but for meaningful lives in a complex world.",
    duration: 7,
    difficulty: 3
  },
  {
    id: "s-b1-004",
    title: "Health and Lifestyle",
    level: "B1",
    type: "speaking-topic",
    prompt: "How do you maintain a healthy lifestyle?",
    description: "Talk about health and wellness habits",
    followUpQuestions: ["What do you eat?", "How much exercise do you do?", "What are your health concerns?"],
    keyVocabulary: ["health", "exercise", "balanced diet", "sleep", "stress", "fitness"],
    grammarPoints: ["Frequency adverbs", "Present habits", "Recommendations"],
    sampleResponse: "I try to maintain a healthy lifestyle through several habits. I exercise regularly, about five times a week, combining cardio and strength training. I eat a balanced diet with plenty of vegetables and whole grains. I sleep seven to eight hours daily. I also manage stress through meditation and spending time outdoors. These habits help me feel energetic and focused. I believe prevention is better than cure, so maintaining good habits now will prevent health problems later.",
    duration: 7,
    difficulty: 3
  },
  {
    id: "s-b1-005",
    title: "Travel Experience",
    level: "B1",
    type: "discussion-prompt",
    prompt: "Describe a memorable trip you've taken",
    description: "Share travel experiences and lessons learned",
    context: "Tell a story about travel",
    followUpQuestions: ["Who did you go with?", "What was the most interesting experience?", "What did you learn?"],
    keyVocabulary: ["journey", "destination", "experience", "unforgettable", "culture"],
    grammarPoints: ["Past narrative", "Descriptive language", "Sequencing"],
    sampleResponse: "Last year, I traveled to Jordan with my family. The most memorable experience was visiting Petra, an ancient city carved into red mountains. The landscape was breathtaking. We also floated in the Dead Sea, which was unique and therapeutic. The local people were incredibly welcoming and shared their culture with us. This trip taught me about different cultures and the importance of environmental conservation. It broadened my perspective significantly.",
    duration: 7,
    difficulty: 3
  }
];

// Reading Exercise Data
const readingData = [
  // A1 Level
  {
    id: "r-a1-001",
    title: "Simple Shopping",
    level: "A1",
    type: "short-passage",
    passage: "Sarah goes to the supermarket. She needs milk, bread, and eggs. She finds them quickly. At the checkout, she pays $15. She is happy.",
    questions: [
      {
        id: "q1",
        question: "Where does Sarah go?",
        options: ["School", "Supermarket", "Park", "Hospital"],
        correctAnswer: "Supermarket",
        explanation: "The passage says 'Sarah goes to the supermarket.'"
      },
      {
        id: "q2",
        question: "What does Sarah need?",
        options: ["Milk and bread", "Milk, bread, and eggs", "Just milk", "Cheese and milk"],
        correctAnswer: "Milk, bread, and eggs",
        explanation: "The passage lists 'milk, bread, and eggs.'"
      }
    ],
    vocabulary: [
      { word: "supermarket", definition: "A large store", example: "I shop at the supermarket" },
      { word: "checkout", definition: "Where you pay", example: "Let's go to checkout" }
    ],
    keyPoints: ["Sarah shops", "She buys three items", "She pays $15"],
    theme: "daily-life",
    difficulty: 1
  },
  // A2 Level
  {
    id: "r-a2-001",
    title: "A Day at the Beach",
    level: "A2",
    type: "comprehension",
    passage: "Last weekend, Ahmed went to the beach with his family. The weather was beautiful, and the water was warm. They swam and played volleyball for hours. Ahmed built a sandcastle while his sister played in the sand. They had a picnic lunch on the beach. In the evening, they watched the sunset. It was a perfect day.",
    questions: [
      {
        id: "q1",
        question: "Who went to the beach?",
        options: ["Ahmed alone", "Ahmed and his family", "Just Ahmed's sister"],
        correctAnswer: "Ahmed and his family",
        explanation: "The passage says 'Ahmed went to the beach with his family'"
      },
      {
        id: "q2",
        question: "What did Ahmed do?",
        options: ["Played volleyball", "Built a sandcastle", "Watched sunset", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "The passage mentions all these activities"
      }
    ],
    vocabulary: [
      { word: "sandcastle", definition: "A castle made of sand", example: "Children build sandcastles" },
      { word: "sunset", definition: "When the sun goes down", example: "Sunset is beautiful" }
    ],
    keyPoints: ["Beach outing", "Family time", "Various activities", "Beautiful weather"],
    theme: "leisure",
    difficulty: 2
  },
  // B1 Level
  {
    id: "r-b1-001",
    title: "Climate Change Impact",
    level: "B1",
    type: "cefr-style",
    passage: "Climate change is one of the most pressing issues of our time. Rising temperatures are causing glaciers to melt and sea levels to rise. This threatens coastal communities and island nations. Extreme weather events like hurricanes and droughts are becoming more frequent. The primary cause is greenhouse gas emissions from human activities. To address this crisis, we need to transition to renewable energy sources, improve energy efficiency, and protect forests. International cooperation is essential, as climate change affects all nations. Individual actions also matter: reducing consumption, using public transport, and supporting sustainable products contribute to solutions.",
    questions: [
      {
        id: "q1",
        question: "What is the primary cause of climate change mentioned?",
        options: ["Natural cycles", "Solar activity", "Greenhouse gas emissions from human activities", "Ocean currents"],
        correctAnswer: "Greenhouse gas emissions from human activities",
        explanation: "The passage states 'The primary cause is greenhouse gas emissions from human activities'"
      },
      {
        id: "q2",
        question: "Which statement is NOT mentioned as a consequence?",
        options: ["Rising sea levels", "Melting glaciers", "More frequent extreme weather", "Increased agricultural production"],
        correctAnswer: "Increased agricultural production",
        explanation: "The passage doesn't mention this consequence"
      },
      {
        id: "q3",
        question: "What is the author's view on individual actions?",
        options: ["They are not important", "They matter", "Only governments can help", "Technology will solve everything"],
        correctAnswer: "They matter",
        explanation: "The passage says 'Individual actions also matter'"
      }
    ],
    vocabulary: [
      { word: "climate change", definition: "Long-term change in global temperatures", example: "Climate change affects our planet" },
      { word: "greenhouse gases", definition: "Gases that trap heat", example: "Carbon dioxide is a greenhouse gas" },
      { word: "renewable energy", definition: "Energy from natural sources", example: "Solar and wind are renewable energy" }
    ],
    keyPoints: ["Definition of climate change", "Causes and consequences", "Solutions", "Need for cooperation"],
    theme: "environment",
    difficulty: 3
  },
  // B2 Level
  {
    id: "r-b2-001",
    title: "The Future of Education",
    level: "B2",
    type: "multiple-choice",
    passage: "The educational landscape is undergoing a profound transformation. Traditional models, characterized by passive learning in classroom settings, are giving way to more interactive, personalized approaches. Technology plays an instrumental role in this shift. Digital platforms enable students to learn at their own pace, accessing resources globally. However, this democratization of education raises important questions. Digital divides persist, with disparities in internet access limiting opportunities for underprivileged populations. Moreover, the reduction in face-to-face interaction concerns educators who argue that social development is compromised. Hybrid models, combining online flexibility with in-person engagement, may offer optimal solutions. Ultimately, education's future depends on balancing innovation with inclusivity, ensuring that technological advancement benefits all learners regardless of socioeconomic status.",
    questions: [
      {
        id: "q1",
        question: "What characterizes traditional educational models according to the passage?",
        options: ["Interactive learning", "Passive learning in classrooms", "Global resource access", "Personalized approaches"],
        correctAnswer: "Passive learning in classrooms",
        explanation: "The passage describes traditional models as 'characterized by passive learning in classroom settings'"
      },
      {
        id: "q2",
        question: "What concern do educators have about digital learning?",
        options: ["High cost", "Limited resources", "Reduced social development", "Poor quality content"],
        correctAnswer: "Reduced social development",
        explanation: "The passage mentions concerns about 'social development is compromised'"
      },
      {
        id: "q3",
        question: "What does 'digital divide' refer to in this context?",
        options: ["Different online platforms", "Disparities in internet access", "Age differences", "Learning styles"],
        correctAnswer: "Disparities in internet access",
        explanation: "The passage states 'Digital divides persist, with disparities in internet access'"
      }
    ],
    vocabulary: [
      { word: "transformation", definition: "Major change", example: "Technology causes transformation" },
      { word: "democratization", definition: "Making available to all", example: "Democratization of education" }
    ],
    keyPoints: ["Educational change", "Technology's role", "Digital divide concerns", "Hybrid solutions", "Inclusivity importance"],
    theme: "education",
    difficulty: 4
  },
  // C1 Level
  {
    id: "r-c1-001",
    title: "Epistemic Justice and Knowledge Production",
    level: "C1",
    type: "cefr-style",
    passage: "Epistemic justice—the equitable distribution of epistemic resources and recognition—constitutes a foundational concern in contemporary epistemology. Miranda Fricker's seminal work delineates two distinct phenomena: testimonial injustice, wherein societal prejudices undermine a speaker's credibility, and hermeneutical injustice, characterized by conceptual lacunae impeding interpretation of marginalized experiences. These injustices perpetuate systemic inequalities, rendering certain voices epistemically inaudible. Academia's historical gatekeeping mechanisms have systematically excluded non-Western and feminine epistemologies, thereby impoverishing the collective knowledge base. Conversely, the proliferation of participatory knowledge production frameworks—citizen science, community-based research, and indigenous knowledge systems—represents a countermovement toward epistemic pluralism. Yet tensions persist between democratizing knowledge and maintaining rigor. Critics argue that unbounded pluralism risks eroding standards; proponents contend that traditional frameworks themselves embody particular worldviews masquerading as universal truths. Resolving this tension requires acknowledging epistemology's fundamentally political nature while cultivating spaces wherein diverse knowledge systems can coexist and inform one another.",
    questions: [
      {
        id: "q1",
        question: "According to Fricker, what distinguishes hermeneutical from testimonial injustice?",
        options: ["Scale and scope", "Presence or absence of prejudice", "Conceptual lacunae versus credibility undermining", "Geographic origin"],
        correctAnswer: "Conceptual lacunae versus credibility undermining",
        explanation: "The passage distinguishes testimonial injustice as undermining credibility and hermeneutical injustice as characterized by conceptual gaps"
      },
      {
        id: "q2",
        question: "What does the author suggest about traditional academic frameworks?",
        options: ["They are universally valid", "They embody particular worldviews presented as universal", "They are purely objective", "They exclude all non-Western knowledge"],
        correctAnswer: "They embody particular worldviews presented as universal",
        explanation: "The passage states critics contend 'traditional frameworks themselves embody particular worldviews masquerading as universal truths'"
      }
    ],
    vocabulary: [
      { word: "epistemic", definition: "Related to knowledge and knowing", example: "Epistemic frameworks" },
      { word: "hermeneutical", definition: "Related to interpretation", example: "Hermeneutical understanding" },
      { word: "lacunae", definition: "Gaps or missing parts", example: "Conceptual lacunae" }
    ],
    keyPoints: ["Definition of epistemic justice", "Types of injustice", "Knowledge production barriers", "Emerging pluralistic approaches", "Political nature of epistemology"],
    theme: "philosophy",
    difficulty: 5
  }
];

// Listening Exercise Data
const listeningData = [
  // A1 Level
  {
    id: "l-a1-001",
    title: "Simple Greeting",
    level: "A1",
    type: "listening-exercise",
    audioUrl: "https://example.com/audio/greeting-a1.mp3",
    transcript: "Hello! My name is John. Nice to meet you. How are you today? I am fine, thank you.",
    questions: [
      {
        id: "q1",
        question: "What is the person's name?",
        options: ["James", "John", "Jack", "Jonathan"],
        correctAnswer: "John",
        timestamp: 5,
        explanation: "The speaker says 'My name is John'"
      },
      {
        id: "q2",
        question: "How is the person feeling?",
        options: ["Sad", "Angry", "Fine", "Tired"],
        correctAnswer: "Fine",
        timestamp: 25,
        explanation: "The speaker says 'I am fine, thank you'"
      }
    ],
    vocabulary: [
      { word: "greeting", definition: "A polite word when meeting", timestamp: 2 },
      { word: "nice", definition: "Good, pleasant", timestamp: 8 }
    ],
    summary: "A simple greeting between two people",
    keyPoints: ["Introduction", "Name", "Greeting"],
    duration: 30,
    difficulty: 1,
    accent: "American"
  },
  // A2 Level
  {
    id: "l-a2-001",
    title: "At the Restaurant",
    level: "A2",
    type: "multiple-choice",
    audioUrl: "https://example.com/audio/restaurant-a2.mp3",
    transcript: "Waiter: Good evening. Welcome to Marco's Restaurant. Customer: Thank you. Can I see the menu? Waiter: Of course. Here you go. What would you like to drink? Customer: I'll have a glass of water and a coffee. Waiter: And for food? Customer: I would like pasta and a salad. Waiter: Excellent choice. Your order will be ready in 20 minutes.",
    questions: [
      {
        id: "q1",
        question: "What restaurant is this?",
        options: ["Tony's", "Marco's", "Mario's", "Antonio's"],
        correctAnswer: "Marco's",
        timestamp: 5,
        explanation: "The waiter says 'Welcome to Marco's Restaurant'"
      },
      {
        id: "q2",
        question: "What does the customer want to drink?",
        options: ["Just water", "Just coffee", "Water and coffee", "Orange juice"],
        correctAnswer: "Water and coffee",
        timestamp: 18,
        explanation: "Customer says 'I'll have a glass of water and a coffee'"
      },
      {
        id: "q3",
        question: "How long will the food take?",
        options: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"],
        correctAnswer: "20 minutes",
        timestamp: 42,
        explanation: "The waiter says 'Your order will be ready in 20 minutes'"
      }
    ],
    vocabulary: [
      { word: "pasta", definition: "Italian noodle dish", timestamp: 30 },
      { word: "salad", definition: "Vegetable dish", timestamp: 30 },
      { word: "excellent", definition: "Very good", timestamp: 38 }
    ],
    summary: "A customer ordering at a restaurant",
    keyPoints: ["Restaurant setting", "Ordering food and drinks", "Time estimate"],
    duration: 50,
    difficulty: 2,
    accent: "General"
  },
  // B1 Level
  {
    id: "l-b1-001",
    title: "Job Interview",
    level: "B1",
    type: "gap-fill",
    audioUrl: "https://example.com/audio/interview-b1.mp3",
    transcript: "Interviewer: Good morning. Thank you for coming. Can you tell me about your experience? Candidate: Of course. I have worked in marketing for five years. I started as an assistant and worked my way up to senior manager. Interviewer: What are your strengths? Candidate: I am detail-oriented, creative, and good at working with teams. I can analyze data and make strategic decisions. Interviewer: Why are you interested in this position? Candidate: I'm interested because this company has an excellent reputation and I want to grow with your team.",
    questions: [
      {
        id: "q1",
        question: "How many years of experience does the candidate have?",
        options: ["Three years", "Five years", "Seven years", "Ten years"],
        correctAnswer: "Five years",
        timestamp: 18,
        explanation: "The candidate says 'I have worked in marketing for five years'"
      },
      {
        id: "q2",
        question: "What position did the candidate start with?",
        options: ["Senior manager", "Assistant", "Director", "Coordinator"],
        correctAnswer: "Assistant",
        timestamp: 22,
        explanation: "Candidate says 'I started as an assistant'"
      },
      {
        id: "q3",
        question: "Which is NOT mentioned as a strength?",
        options: ["Detail-oriented", "Creative", "Analytical", "Bilingual"],
        correctAnswer: "Bilingual",
        timestamp: 35,
        explanation: "Bilingual is not mentioned among the strengths"
      }
    ],
    vocabulary: [
      { word: "marketing", definition: "Promoting and selling products", timestamp: 15 },
      { word: "detail-oriented", definition: "Careful about details", timestamp: 33 },
      { word: "strategic", definition: "Planned for long-term goals", timestamp: 40 }
    ],
    summary: "A job interview between employer and candidate",
    keyPoints: ["Experience discussion", "Strengths", "Company reputation", "Career growth"],
    duration: 90,
    difficulty: 3,
    accent: "American"
  },
  // B2 Level
  {
    id: "l-b2-001",
    title: "Climate Change Discussion",
    level: "B2",
    type: "audio-comprehension",
    audioUrl: "https://example.com/audio/climate-b2.mp3",
    transcript: "Expert: Climate change represents perhaps the most significant challenge of our time. The evidence is overwhelming. We've observed a steady increase in global temperatures over the past century. Interviewer: What are the consequences? Expert: The consequences are multifaceted. Rising sea levels threaten coastal communities. We're seeing more frequent and intense weather events. Crop failures due to droughts are becoming more common. Interviewer: What can be done? Expert: We need a comprehensive approach. Transitioning to renewable energy is essential. We must protect and expand forests. Internationally, we need binding agreements that hold nations accountable. On a personal level, individuals can reduce their carbon footprint through lifestyle changes.",
    questions: [
      {
        id: "q1",
        question: "What timeframe does the expert mention for temperature increase?",
        options: ["Past 50 years", "Past century", "Past decade", "Past 200 years"],
        correctAnswer: "Past century",
        timestamp: 22,
        explanation: "Expert mentions 'a steady increase in global temperatures over the past century'"
      },
      {
        id: "q2",
        question: "What are consequences mentioned?",
        options: ["Only sea level rise", "Temperature and weather", "Sea level, weather, and crop failures", "Only crop failures"],
        correctAnswer: "Sea level, weather, and crop failures",
        timestamp: 45,
        explanation: "Multiple consequences are listed: rising seas, weather events, and crop failures"
      },
      {
        id: "q3",
        question: "At what level should action occur?",
        options: ["Only at government level", "Only at personal level", "International and personal", "Only through companies"],
        correctAnswer: "International and personal",
        timestamp: 75,
        explanation: "Expert emphasizes both international binding agreements and personal carbon footprint reduction"
      }
    ],
    vocabulary: [
      { word: "multifaceted", definition: "Having many parts or aspects", timestamp: 32 },
      { word: "renewable energy", definition: "Energy from natural sources", timestamp: 70 },
      { word: "carbon footprint", definition: "Amount of CO2 produced", timestamp: 85 }
    ],
    summary: "Expert discussion on climate change impacts and solutions",
    keyPoints: ["Temperature increase evidence", "Multiple consequences", "Individual and collective action", "International cooperation needed"],
    duration: 120,
    difficulty: 4,
    accent: "British"
  }
];

// Seed the database
const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Writing.deleteMany({});
    await Speaking.deleteMany({});
    await Reading.deleteMany({});
    await Listening.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Seed Writing
    const writingResults = await Writing.insertMany(writingData);
    console.log(`✅ Seeded ${writingResults.length} writing exercises`);

    // Seed Speaking
    const speakingResults = await Speaking.insertMany(speakingData);
    console.log(`✅ Seeded ${speakingResults.length} speaking exercises`);

    // Seed Reading
    const readingResults = await Reading.insertMany(readingData);
    console.log(`✅ Seeded ${readingResults.length} reading exercises`);

    // Seed Listening
    const listeningResults = await Listening.insertMany(listeningData);
    console.log(`✅ Seeded ${listeningResults.length} listening exercises`);

    console.log(`\n✨ Successfully seeded ${writingResults.length + speakingResults.length + readingResults.length + listeningResults.length} total exercises`);

    await mongoose.connection.close();
    console.log("📴 Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
