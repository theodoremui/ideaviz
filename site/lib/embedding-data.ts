export type DatasetId = "ai-tight" | "ai-medicine" | "wide-topics";

export type TopicId = "ai" | "medicine" | "world";

export type Topic = {
  id: TopicId;
  name: string;
  color: string;
  description: string;
};

export type EmbeddingVector = {
  id: string;
  topic: TopicId;
  label: string;
  text: string;
  vector: readonly [number, number, number];
  embedding: readonly number[];
  magnitude: number;
};

export type IdeaDataset = {
  id: DatasetId;
  shortLabel: string;
  label: string;
  description: string;
  expectedVolume: "Smallest" | "Medium" | "Largest";
  texts: readonly string[];
};

export const topics: readonly Topic[] = [
  {
    id: "ai",
    name: "AI",
    color: "#0f766e",
    description: "machine learning, models, agents, and automation",
  },
  {
    id: "medicine",
    name: "Medicine",
    color: "#c2410c",
    description: "clinical care, diagnosis, treatment, and public health",
  },
  {
    id: "world",
    name: "Different topics",
    color: "#4f46e5",
    description: "unrelated ideas spread across semantic space",
  },
] as const;

const aiTexts = [
  "A transformer model summarizes a long policy document.",
  "An AI assistant drafts code from a natural language prompt.",
  "A neural network classifies images after supervised training.",
  "A language model retrieves facts before answering a question.",
  "An agent plans steps for a data analysis workflow.",
  "A recommender system ranks articles by predicted relevance.",
  "A chatbot adapts its response to user intent.",
  "A vision model detects objects in a warehouse camera feed.",
  "A diffusion model generates product mockups from text.",
  "An embedding model clusters similar customer support tickets.",
  "A speech model transcribes a meeting into searchable notes.",
  "A reinforcement learning system learns a navigation policy.",
  "A model evaluation suite measures hallucination risk.",
  "A prompt template standardizes answers across tasks.",
  "A fine-tuned classifier flags toxic comments.",
  "An inference service batches requests for lower latency.",
  "A vector database finds semantically similar paragraphs.",
  "A multimodal model compares diagrams and captions.",
  "A synthetic data pipeline augments scarce training examples.",
  "A model monitor detects drift in production predictions.",
  "A retrieval system cites source passages for generated answers.",
  "An autonomous coding agent edits tests after reading failures.",
  "A neural search index improves enterprise knowledge discovery.",
  "A guardrail model blocks unsafe instructions.",
  "A reasoning model decomposes a complex math problem.",
  "A planner selects tools for a multi-step AI workflow.",
  "A classifier labels incoming emails by business priority.",
  "A model compression pass reduces memory use on edge devices.",
  "An AI tutor gives hints tailored to a student's misconception.",
  "A forecasting model predicts demand from historical sales.",
  "A semantic parser converts user requests into database queries.",
  "A conversational agent remembers project constraints.",
  "A computer vision pipeline inspects defects on an assembly line.",
  "A model card explains training data and limitations.",
  "An alignment technique compares outputs with human preferences.",
  "A benchmark scores agents on tool-use reliability.",
  "A neural ranking model reorders search results.",
  "A data labeling workflow improves examples for model training.",
  "A text generation model rewrites legal clauses in plain language.",
  "A feature store provides consistent inputs for machine learning.",
  "A local model runs private inference on a laptop.",
  "An orchestration layer routes prompts to specialized models.",
  "A sentiment model analyzes product review trends.",
  "A knowledge graph grounds an AI answer in entity relationships.",
  "An anomaly detector identifies unusual network traffic.",
  "A token budget strategy trims context without losing intent.",
  "A self-evaluation prompt checks whether an answer follows rules.",
  "A model ensemble combines predictions for better accuracy.",
  "A training run tunes weights on accelerator hardware.",
  "An AI workflow turns raw documents into structured summaries.",
] as const;

const medicineTexts = [
  "A physician reviews symptoms before ordering a blood test.",
  "A clinical trial compares two hypertension treatments.",
  "A radiologist reads a chest scan for signs of pneumonia.",
  "A nurse monitors vital signs after surgery.",
  "A pharmacist checks medication interactions for a patient.",
  "A hospital protocol reduces infections in intensive care.",
  "A vaccine study measures immune response over time.",
  "A cardiologist evaluates an abnormal electrocardiogram.",
  "A primary care visit screens for diabetes risk.",
  "A public health team tracks seasonal influenza cases.",
  "A surgeon plans a minimally invasive procedure.",
  "A neurologist assesses memory changes and cognitive decline.",
  "A pediatrician explains an asthma action plan.",
  "A pathology report identifies malignant cells.",
  "A physical therapist designs rehabilitation exercises.",
  "A dermatologist treats an inflammatory skin condition.",
  "A medical chart records allergies and current prescriptions.",
  "A genetic test informs cancer treatment options.",
  "A mental health clinician evaluates depression symptoms.",
  "A dialysis unit manages chronic kidney disease.",
  "A nutrition plan supports recovery after chemotherapy.",
  "An emergency team triages chest pain in the ambulance bay.",
  "A maternal health program schedules prenatal visits.",
  "A lab technician cultures a sample for bacterial infection.",
  "A sleep clinic diagnoses obstructive apnea.",
] as const;

const diverseTexts = [
  "A jazz quartet improvises during a late-night concert.",
  "An architect sketches a library with natural light.",
  "A marine biologist tags coral reef fish.",
  "A historian studies letters from a medieval trade route.",
  "A chef ferments vegetables for a winter menu.",
  "A climate scientist models monsoon rainfall patterns.",
  "A novelist outlines a mystery set on a train.",
  "A city planner redesigns a bus corridor.",
  "A farmer tests soil moisture before planting wheat.",
  "A cybersecurity analyst investigates a phishing campaign.",
  "A sculptor carves basalt for a public plaza.",
  "A teacher prepares a lesson on fractions.",
  "A mountaineer checks weather before an alpine climb.",
  "A game designer balances resource mechanics.",
  "A lawyer drafts a merger agreement.",
  "A botanist catalogs wildflowers in a meadow.",
  "A film editor cuts a documentary interview.",
  "A financial analyst values a renewable energy company.",
  "A linguist records vowel shifts in a regional dialect.",
  "A mechanical engineer tests a turbine blade.",
  "A dancer rehearses choreography for a festival.",
  "A geologist maps faults near a volcanic ridge.",
  "A journalist verifies sources for an election story.",
  "A carpenter builds cabinets from walnut boards.",
  "A psychologist studies attention during multitasking.",
  "A pilot calculates fuel for a transatlantic route.",
  "A museum curator installs a textile exhibition.",
  "A policy analyst evaluates housing subsidies.",
  "A photographer captures migratory birds at sunrise.",
  "A database administrator tunes a slow query.",
  "A soccer coach studies match footage.",
  "A chemist synthesizes a biodegradable polymer.",
  "A translator adapts poetry between languages.",
  "A product manager prioritizes onboarding improvements.",
  "A gardener prunes fruit trees before spring.",
  "A theater director blocks a crowded stage scene.",
  "A sociologist surveys neighborhood trust.",
  "A logistics team routes packages through regional hubs.",
  "A paleontologist reconstructs a dinosaur skeleton.",
  "A composer writes a string quartet.",
  "A real estate appraiser compares nearby home sales.",
  "A sailor repairs rigging before a harbor race.",
  "A materials scientist tests ceramic heat shields.",
  "A graphic designer chooses type for a magazine cover.",
  "A judge reviews precedent in a contract dispute.",
  "A brewer adjusts hops in a seasonal ale.",
  "An astronomer tracks exoplanet transit data.",
  "A social worker coordinates shelter placement.",
  "A robotics team calibrates a warehouse arm.",
  "A travel guide maps a walking tour through old streets.",
] as const;

export const ideaDatasets: readonly IdeaDataset[] = [
  {
    id: "ai-tight",
    shortLabel: "AI only",
    label: "Set 1: 50 similar AI texts",
    description: "All examples share the same AI neighborhood, so pairwise cosine distances stay low and the hull is compact.",
    expectedVolume: "Smallest",
    texts: aiTexts,
  },
  {
    id: "ai-medicine",
    shortLabel: "AI + medicine",
    label: "Set 2: two topic clusters",
    description: "Half of the texts are AI and half are medicine, creating two visible clusters with a larger mean distance.",
    expectedVolume: "Medium",
    texts: [...aiTexts.slice(0, 25), ...medicineTexts],
  },
  {
    id: "wide-topics",
    shortLabel: "50 topics",
    label: "Set 3: 50 different topics",
    description: "Each text points to a different subject, pushing the average pairwise distance and semantic volume highest.",
    expectedVolume: "Largest",
    texts: diverseTexts,
  },
] as const;

const centerByTopic: Record<TopicId, readonly number[]> = {
  ai: [0.88, 0.28, -0.12, 0.18, -0.22, 0.08, 0.12, -0.1],
  medicine: [-0.2, 0.9, 0.24, -0.16, 0.18, -0.1, 0.08, 0.12],
  world: [-0.26, -0.34, 0.72, 0.52, -0.18, 0.28, -0.42, 0.22],
};

const projection = [
  [0.9, -0.15, 0.18, 0.28, -0.12, 0.22, -0.2, 0.1],
  [0.08, 0.82, -0.25, 0.12, 0.3, -0.22, 0.1, -0.16],
  [-0.18, 0.2, 0.72, -0.24, 0.16, 0.34, 0.28, -0.12],
] as const;

function seededNoise(index: number, salt: number): number {
  const raw = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function signedNoise(index: number, salt: number): number {
  return seededNoise(index, salt) * 2 - 1;
}

function normalize(values: readonly number[]): number[] {
  const length = Math.hypot(...values);
  return values.map((value) => value / Math.max(0.00001, length));
}

function topicForDataset(datasetId: DatasetId, index: number): TopicId {
  if (datasetId === "ai-tight") {
    return "ai";
  }

  if (datasetId === "ai-medicine") {
    return index < 25 ? "ai" : "medicine";
  }

  return "world";
}

function makeEmbedding(datasetId: DatasetId, topic: TopicId, index: number): number[] {
  if (datasetId === "wide-topics") {
    return normalize(
      Array.from({ length: 8 }, (_, dimension) => (
        Math.sin((index + 1) * (dimension + 2) * 1.37) +
        Math.cos((index + 3) * (dimension + 5) * 0.61) +
        signedNoise(index + dimension * 31, dimension + 1) * 0.22
      )),
    );
  }

  const base = centerByTopic[topic];
  const spread = datasetId === "ai-tight" ? 0.045 : 0.08;

  return normalize(
    base.map((value, dimension) => (
      value +
      signedNoise(index + dimension * 31, dimension + 1) * spread
    )),
  );
}

function projectEmbedding(embedding: readonly number[], datasetId: DatasetId): readonly [number, number, number] {
  const projected = projection.map((axis) => axis.reduce((sum, weight, index) => sum + weight * embedding[index], 0));
  const scale = datasetId === "ai-tight" ? 1.75 : datasetId === "ai-medicine" ? 2.15 : 2.45;
  return [
    projected[0] * scale,
    projected[1] * scale,
    projected[2] * scale,
  ];
}

function makeVectorLabel(text: string): string {
  return text
    .replace(/^(A|An|The)\s+/i, "")
    .replace(/[.?!]$/u, "")
    .slice(0, 34);
}

export function createEmbeddingVectors(datasetId: DatasetId): EmbeddingVector[] {
  const dataset = ideaDatasets.find((item) => item.id === datasetId) ?? ideaDatasets[0];

  return dataset.texts.map((text, index) => {
    const topic = topicForDataset(dataset.id, index);
    const embedding = makeEmbedding(dataset.id, topic, index);
    const vector = projectEmbedding(embedding, dataset.id);

    return {
      id: `${dataset.id}-${index}`,
      topic,
      label: makeVectorLabel(text),
      text,
      vector,
      embedding,
      magnitude: Math.hypot(vector[0], vector[1], vector[2]),
    };
  });
}

export type SpanMetrics = {
  meanPairwiseCosineDistance: number;
  pairCount: number;
  hullVolume: number;
  density: number;
  anisotropy: number;
};

function cosineSimilarity(a: readonly number[], b: readonly number[]): number {
  let dot = 0;
  let aLength = 0;
  let bLength = 0;

  for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
    dot += a[index] * b[index];
    aLength += a[index] * a[index];
    bLength += b[index] * b[index];
  }

  return dot / Math.max(0.00001, Math.sqrt(aLength) * Math.sqrt(bLength));
}

export function getSpanMetrics(vectors: readonly EmbeddingVector[]): SpanMetrics {
  if (vectors.length < 2) {
    return { meanPairwiseCosineDistance: 0, pairCount: 0, hullVolume: 0, density: 0, anisotropy: 0 };
  }

  let distanceTotal = 0;
  let pairCount = 0;

  for (let a = 0; a < vectors.length - 1; a += 1) {
    for (let b = a + 1; b < vectors.length; b += 1) {
      distanceTotal += 1 - cosineSimilarity(vectors[a].embedding, vectors[b].embedding);
      pairCount += 1;
    }
  }

  const xs = vectors.map((item) => item.vector[0]);
  const ys = vectors.map((item) => item.vector[1]);
  const zs = vectors.map((item) => item.vector[2]);
  const dx = Math.max(...xs) - Math.min(...xs);
  const dy = Math.max(...ys) - Math.min(...ys);
  const dz = Math.max(...zs) - Math.min(...zs);
  const hullVolume = dx * dy * dz;
  const minAxis = Math.max(0.01, Math.min(dx, dy, dz));
  const maxAxis = Math.max(dx, dy, dz);

  return {
    meanPairwiseCosineDistance: distanceTotal / pairCount,
    pairCount,
    hullVolume,
    density: vectors.length / Math.max(0.01, hullVolume),
    anisotropy: maxAxis / minAxis,
  };
}

export function datasetForId(id: DatasetId): IdeaDataset {
  return ideaDatasets.find((dataset) => dataset.id === id) ?? ideaDatasets[0];
}

export function topicForId(id: TopicId): Topic {
  return topics.find((topic) => topic.id === id) ?? topics[0];
}
