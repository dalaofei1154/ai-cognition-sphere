export type ConceptSourceKind = "paper" | "standard" | "official" | "book";

export type ConceptSource = {
  title: string;
  url: string;
  kind: ConceptSourceKind;
};

// The concept panel and readable index surface these primary references while
// keeping the authorial taxonomy distinct from externally verifiable sources.
export const CONCEPT_SOURCES = {
  turing1950: {
    title: "Computing Machinery and Intelligence",
    url: "https://doi.org/10.1093/mind/LIX.236.433",
    kind: "paper",
  },
  gpt3: {
    title: "Language Models are Few-Shot Learners",
    url: "https://arxiv.org/abs/2005.14165",
    kind: "paper",
  },
  transformer: {
    title: "Attention Is All You Need",
    url: "https://arxiv.org/abs/1706.03762",
    kind: "paper",
  },
  diffusion: {
    title: "Denoising Diffusion Probabilistic Models",
    url: "https://arxiv.org/abs/2006.11239",
    kind: "paper",
  },
  gpt4: {
    title: "GPT-4 Technical Report",
    url: "https://arxiv.org/abs/2303.08774",
    kind: "paper",
  },
  codex: {
    title: "Evaluating Large Language Models Trained on Code",
    url: "https://arxiv.org/abs/2107.03374",
    kind: "paper",
  },
  levelsOfAgi: {
    title: "Levels of AGI for Operationalizing Progress on the Path to AGI",
    url: "https://arxiv.org/abs/2311.02462",
    kind: "paper",
  },
  rag: {
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    url: "https://arxiv.org/abs/2005.11401",
    kind: "paper",
  },
  effectiveAgents: {
    title: "Building effective agents",
    url: "https://www.anthropic.com/engineering/building-effective-agents",
    kind: "official",
  },
  mcp: {
    title: "Model Context Protocol Specification 2025-06-18",
    url: "https://modelcontextprotocol.io/specification/2025-06-18",
    kind: "standard",
  },
  contextEngineering: {
    title: "Effective context engineering for AI agents",
    url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
    kind: "official",
  },
  reasoningModels: {
    title: "Learning to reason with LLMs",
    url: "https://openai.com/index/learning-to-reason-with-llms/",
    kind: "official",
  },
  worldModels: {
    title: "World Models",
    url: "https://arxiv.org/abs/1803.10122",
    kind: "paper",
  },
  vae: {
    title: "Auto-Encoding Variational Bayes",
    url: "https://arxiv.org/abs/1312.6114",
    kind: "paper",
  },
  lora: {
    title: "LoRA: Low-Rank Adaptation of Large Language Models",
    url: "https://arxiv.org/abs/2106.09685",
    kind: "paper",
  },
  gptq: {
    title: "GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers",
    url: "https://arxiv.org/abs/2210.17323",
    kind: "paper",
  },
  instructGpt: {
    title: "Training language models to follow instructions with human feedback",
    url: "https://arxiv.org/abs/2203.02155",
    kind: "paper",
  },
  datasheets: {
    title: "Datasheets for Datasets",
    url: "https://arxiv.org/abs/1803.09010",
    kind: "paper",
  },
  modelCards: {
    title: "Model Cards for Model Reporting",
    url: "https://arxiv.org/abs/1810.03993",
    kind: "paper",
  },
  nistAiRmf: {
    title: "Artificial Intelligence Risk Management Framework (AI RMF 1.0)",
    url: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10",
    kind: "standard",
  },
  nistGenAi: {
    title: "Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile",
    url: "https://doi.org/10.6028/NIST.AI.600-1",
    kind: "standard",
  },
  kalman: {
    title: "A New Approach to Linear Filtering and Prediction Problems",
    url: "https://doi.org/10.1115/1.3662552",
    kind: "paper",
  },
  shannon: {
    title: "A Mathematical Theory of Communication",
    url: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf",
    kind: "paper",
  },
  probability: {
    title: "Probability Theory: The Logic of Science",
    url: "https://doi.org/10.1017/CBO9780511790423",
    kind: "book",
  },
  causalInference: {
    title: "Causal Inference: What If",
    url: "https://www.hsph.harvard.edu/miguel-hernan/causal-inference-book/",
    kind: "book",
  },
  causality: {
    title: "Causality: Models, Reasoning, and Inference",
    url: "https://doi.org/10.1017/CBO9780511803161",
    kind: "book",
  },
  control: {
    title: "Feedback Systems: An Introduction for Scientists and Engineers",
    url: "https://fbsbook.org/",
    kind: "book",
  },
  statisticalLearning: {
    title: "The Elements of Statistical Learning",
    url: "https://hastie.su.domains/ElemStatLearn/",
    kind: "book",
  },
  understanding: {
    title: "Climbing towards NLU: On Meaning, Form, and Understanding in the Age of Data",
    url: "https://aclanthology.org/2020.acl-main.463/",
    kind: "paper",
  },
  aiSafety: {
    title: "Concrete Problems in AI Safety",
    url: "https://arxiv.org/abs/1606.06565",
    kind: "paper",
  },
  foundationModels: {
    title: "On the Opportunities and Risks of Foundation Models",
    url: "https://arxiv.org/abs/2108.07258",
    kind: "paper",
  },
  sentencePiece: {
    title: "SentencePiece: A simple and language independent subword tokenizer and detokenizer for Neural Text Processing",
    url: "https://arxiv.org/abs/1808.06226",
    kind: "paper",
  },
  waveNet: {
    title: "WaveNet: A Generative Model for Raw Audio",
    url: "https://arxiv.org/abs/1609.03499",
    kind: "paper",
  },
  voiceCloning: {
    title: "Transfer Learning from Speaker Verification to Multispeaker Text-To-Speech Synthesis",
    url: "https://arxiv.org/abs/1806.04558",
    kind: "paper",
  },
  toolformer: {
    title: "Toolformer: Language Models Can Teach Themselves to Use Tools",
    url: "https://arxiv.org/abs/2302.04761",
    kind: "paper",
  },
  sentenceBert: {
    title: "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    url: "https://arxiv.org/abs/1908.10084",
    kind: "paper",
  },
  faiss: {
    title: "Billion-scale similarity search with GPUs",
    url: "https://arxiv.org/abs/1702.08734",
    kind: "paper",
  },
  bertReranking: {
    title: "Passage Re-ranking with BERT",
    url: "https://arxiv.org/abs/1901.04085",
    kind: "paper",
  },
  autogen: {
    title: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation",
    url: "https://arxiv.org/abs/2308.08155",
    kind: "paper",
  },
  deepLearning: {
    title: "Deep learning",
    url: "https://doi.org/10.1038/nature14539",
    kind: "paper",
  },
  bert: {
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    url: "https://arxiv.org/abs/1810.04805",
    kind: "paper",
  },
  dpo: {
    title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
    url: "https://arxiv.org/abs/2305.18290",
    kind: "paper",
  },
  distillation: {
    title: "Distilling the Knowledge in a Neural Network",
    url: "https://arxiv.org/abs/1503.02531",
    kind: "paper",
  },
  mixtureOfExperts: {
    title: "Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer",
    url: "https://arxiv.org/abs/1701.06538",
    kind: "paper",
  },
  scalingLaws: {
    title: "Scaling Laws for Neural Language Models",
    url: "https://arxiv.org/abs/2001.08361",
    kind: "paper",
  },
  openTelemetry: {
    title: "OpenTelemetry Specification",
    url: "https://opentelemetry.io/docs/specs/otel/",
    kind: "standard",
  },
  onlineExperiments: {
    title: "Trustworthy Online Controlled Experiments",
    url: "https://doi.org/10.1017/9781108653985",
    kind: "book",
  },
  reinforcementLearning: {
    title: "Reinforcement Learning: An Introduction",
    url: "http://incompleteideas.net/book/the-book-2nd.html",
    kind: "book",
  },
  pomdp: {
    title: "Planning and acting in partially observable stochastic domains",
    url: "https://doi.org/10.1016/S0004-3702(98)00023-X",
    kind: "paper",
  },
  calibration: {
    title: "On Calibration of Modern Neural Networks",
    url: "https://arxiv.org/abs/1706.04599",
    kind: "paper",
  },
  outOfDistribution: {
    title: "A Baseline for Detecting Misclassified and Out-of-Distribution Examples in Neural Networks",
    url: "https://arxiv.org/abs/1610.02136",
    kind: "paper",
  },
  conceptDrift: {
    title: "A Survey on Concept Drift Adaptation",
    url: "https://doi.org/10.1145/2523813",
    kind: "paper",
  },
  adversarialExamples: {
    title: "Intriguing properties of neural networks",
    url: "https://arxiv.org/abs/1312.6199",
    kind: "paper",
  },
  promptInjection: {
    title: "Ignore Previous Prompt: Attack Techniques For Language Models",
    url: "https://arxiv.org/abs/2211.09527",
    kind: "paper",
  },
  specificationGaming: {
    title: "Specification gaming: the flip side of AI ingenuity",
    url: "https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/",
    kind: "official",
  },
  genderShades: {
    title: "Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification",
    url: "https://proceedings.mlr.press/v81/buolamwini18a.html",
    kind: "paper",
  },
  pacLearning: {
    title: "A theory of the learnable",
    url: "https://doi.org/10.1145/1968.1972",
    kind: "paper",
  },
  gameTheory: {
    title: "Theory of Games and Economic Behavior",
    url: "https://press.princeton.edu/books/paperback/9780691130613/theory-of-games-and-economic-behavior",
    kind: "book",
  },
  humanCenteredDesign: {
    title: "ISO 9241-210: Human-centred design for interactive systems",
    url: "https://www.iso.org/standard/77520.html",
    kind: "standard",
  },
  cognitiveScience: {
    title: "Vision: A Computational Investigation into the Human Representation and Processing of Visual Information",
    url: "https://mitpress.mit.edu/9780262514620/vision/",
    kind: "book",
  },
  cybernetics: {
    title: "Cybernetics: Or Control and Communication in the Animal and the Machine",
    url: "https://mitpress.mit.edu/9780262537841/cybernetics/",
    kind: "book",
  },
  unescoAiEthics: {
    title: "Recommendation on the Ethics of Artificial Intelligence",
    url: "https://unesdoc.unesco.org/ark:/48223/pf0000381137",
    kind: "standard",
  },
  computability: {
    title: "On Computable Numbers, with an Application to the Entscheidungsproblem",
    url: "https://doi.org/10.1112/plms/s2-42.1.230",
    kind: "paper",
  },
} as const satisfies Record<string, ConceptSource>;

export type ConceptSourceKey = keyof typeof CONCEPT_SOURCES;
