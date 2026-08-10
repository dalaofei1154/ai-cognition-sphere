export type Lang = "zh" | "en";
export type ViewMode = "structure" | "path";
export type Copy = { zh: string; en: string };
export type Layer = {
  id: number;
  short: Copy;
  title: Copy;
  question: Copy;
  color: string;
  radius: number;
  terms: string[];
};

export const LAYERS: Layer[] = [
  {
    id: 1,
    short: { zh: "表象", en: "SURFACE" },
    title: { zh: "接触 AI", en: "Encounter AI" },
    question: { zh: "AI 看起来能做什么？", en: "What does AI appear able to do?" },
    color: "#72dcff",
    radius: 9.2,
    terms: ["AI", "AIGC", "CHATBOT", "PROMPT", "SYSTEM PROMPT", "TOKEN", "CONTEXT WINDOW", "LLM", "FOUNDATION MODEL", "TEXT GENERATION", "IMAGE GENERATION", "TEXT-TO-IMAGE", "DIFFUSION", "TEXT-TO-VIDEO", "MULTIMODAL", "SPEECH", "VOICE CLONING", "AI CODING", "VIBE CODING", "AGI"],
  },
  {
    id: 2,
    short: { zh: "构建", en: "BUILD" },
    title: { zh: "组织能力", en: "Organize Capability" },
    question: { zh: "如何把一次生成变成系统？", en: "How does one generation become a system?" },
    color: "#4aa6ff",
    radius: 8,
    terms: ["ZERO-SHOT", "FEW-SHOT", "STRUCTURED OUTPUT", "API", "INFERENCE", "TEMPERATURE", "TOOL USE", "FUNCTION CALLING", "MEMORY", "WORKFLOW", "AUTOMATION", "RAG", "CHUNKING", "EMBEDDING", "VECTOR DATABASE", "RERANKING", "AGENT", "MULTI-AGENT", "ORCHESTRATION", "MCP", "SKILLS", "CONTEXT ENGINEERING", "HARNESS", "HUMAN IN LOOP"],
  },
  {
    id: 3,
    short: { zh: "模型", en: "MODEL" },
    title: { zh: "模型机制", en: "Model Mechanisms" },
    question: { zh: "能力如何从数据与优化中出现？", en: "How does capability emerge from data and optimization?" },
    color: "#8976ff",
    radius: 6.8,
    terms: ["MACHINE LEARNING", "DEEP LEARNING", "NEURAL NETWORK", "TRANSFORMER", "ATTENTION", "SELF-ATTENTION", "TOKENIZATION", "EMBEDDING SPACE", "LATENT SPACE", "REPRESENTATION", "PRETRAINING", "SELF-SUPERVISION", "FINE-TUNING", "SFT", "RLHF", "DPO", "REWARD MODEL", "DISTILLATION", "QUANTIZATION", "LoRA", "MIXTURE OF EXPERTS", "SCALING LAW", "REASONING MODEL", "WORLD MODEL"],
  },
  {
    id: 4,
    short: { zh: "系统", en: "SYSTEM" },
    title: { zh: "生产系统", en: "Production Systems" },
    question: { zh: "为什么 Demo 能跑，产品却未必能用？", en: "Why can a demo work while a product fails?" },
    color: "#bd70ff",
    radius: 5.7,
    terms: ["DATASET", "DATA QUALITY", "DATA PIPELINE", "TRAINING SET", "VALIDATION SET", "TEST SET", "BENCHMARK", "EVALUATION", "OFFLINE EVAL", "ONLINE EVAL", "A/B TEST", "TELEMETRY", "TRACING", "MONITORING", "LATENCY", "THROUGHPUT", "TOKEN COST", "CACHING", "MODEL ROUTING", "FALLBACK", "GUARDRAILS", "SANDBOX", "PERMISSION", "LOCAL LLM", "EDGE AI"],
  },
  {
    id: 5,
    short: { zh: "行动", en: "ACTION" },
    title: { zh: "接触现实", en: "Touch Reality" },
    question: { zh: "系统凭什么感知、判断并行动？", en: "How does a system perceive, decide, and act?" },
    color: "#ff65bd",
    radius: 4.7,
    terms: ["SENSOR", "SIGNAL", "MEASUREMENT", "NOISE", "PERCEPTION", "SENSOR FUSION", "STATE", "STATE ESTIMATION", "ENVIRONMENT", "DYNAMICS", "SYSTEM ID", "OBSERVABILITY", "CONTROLLABILITY", "PREDICTION", "PLANNING", "OBJECTIVE", "REWARD", "POLICY", "DECISION", "ACTION", "ACTUATOR", "CONTROL", "FEEDBACK", "CLOSED LOOP", "POMDP", "REAL-TIME", "HUMAN OVERRIDE", "FAIL-SAFE"],
  },
  {
    id: 6,
    short: { zh: "失效", en: "FAILURE" },
    title: { zh: "能力条件", en: "Conditions of Capability" },
    question: { zh: "输出为何不等于可靠知识与行动？", en: "Why is output not reliable knowledge or action?" },
    color: "#ff8164",
    radius: 3.7,
    terms: ["HALLUCINATION", "GROUNDING", "FACTUALITY", "AMBIGUITY", "UNCERTAINTY", "CONFIDENCE", "CALIBRATION", "BRITTLENESS", "OVERFITTING", "GENERALIZATION", "OUT OF DISTRIBUTION", "DISTRIBUTION SHIFT", "CONCEPT DRIFT", "SMALL DATA", "SPURIOUS CORRELATION", "CONFOUNDING", "IDENTIFIABILITY", "PARTIAL OBSERVABILITY", "ROBUSTNESS", "RELIABILITY", "SAFETY", "PROMPT INJECTION", "REWARD HACKING", "BIAS", "INTERPRETABILITY", "ALIGNMENT"],
  },
  {
    id: 7,
    short: { zh: "理论", en: "THEORY" },
    title: { zh: "基础理论", en: "Foundations" },
    question: { zh: "工程问题由什么更深的理论解释？", en: "Which deeper theories explain engineering failures?" },
    color: "#ffc857",
    radius: 2.7,
    terms: ["PROBABILITY", "STATISTICS", "BAYESIAN INFERENCE", "ENTROPY", "INFORMATION THEORY", "SIGNAL PROCESSING", "LINEAR ALGEBRA", "OPTIMIZATION", "LEARNING THEORY", "COMPLEXITY", "CAUSAL INFERENCE", "COUNTERFACTUAL", "DECISION THEORY", "GAME THEORY", "DYNAMICAL SYSTEM", "SYSTEMS THEORY", "CONTROL THEORY", "CYBERNETICS", "HCI", "COGNITIVE SCIENCE", "NEUROSCIENCE", "EPISTEMOLOGY", "PHILOSOPHY OF MIND", "ETHICS"],
  },
  {
    id: 8,
    short: { zh: "边界", en: "BOUNDARY" },
    title: { zh: "边界问题", en: "Boundary Questions" },
    question: { zh: "多条深入路径共同收敛到哪里？", en: "Where do multiple paths of inquiry converge?" },
    color: "#fff0aa",
    radius: 1.5,
    terms: ["GENERALIZATION", "IDENTIFIABILITY", "OBSERVABILITY", "CONTROLLABILITY", "CAUSALITY", "COMPUTABILITY", "ALIGNMENT", "UNDERSTANDING"],
  },
];

export const ZH_NAMES: Record<string, string> = {
  "AI": "人工智能",
  "AIGC": "生成式人工智能",
  "CHATBOT": "对话机器人",
  "PROMPT": "提示词",
  "SYSTEM PROMPT": "系统提示词",
  "TOKEN": "词元",
  "CONTEXT WINDOW": "上下文窗口",
  "LLM": "大语言模型",
  "FOUNDATION MODEL": "基础模型",
  "TEXT GENERATION": "文本生成",
  "IMAGE GENERATION": "图像生成",
  "TEXT-TO-IMAGE": "文生图",
  "DIFFUSION": "扩散模型",
  "TEXT-TO-VIDEO": "文生视频",
  "MULTIMODAL": "多模态",
  "SPEECH": "语音",
  "VOICE CLONING": "声音克隆",
  "AI CODING": "AI 编程",
  "VIBE CODING": "氛围编程",
  "AGI": "通用人工智能",
  "ZERO-SHOT": "零样本",
  "FEW-SHOT": "少样本",
  "STRUCTURED OUTPUT": "结构化输出",
  "API": "API",
  "INFERENCE": "推理",
  "TEMPERATURE": "温度参数",
  "TOOL USE": "工具使用",
  "FUNCTION CALLING": "函数调用",
  "MEMORY": "记忆",
  "WORKFLOW": "工作流",
  "AUTOMATION": "自动化",
  "RAG": "检索增强生成",
  "CHUNKING": "文本切分",
  "EMBEDDING": "嵌入",
  "VECTOR DATABASE": "向量数据库",
  "RERANKING": "重排序",
  "AGENT": "智能体",
  "MULTI-AGENT": "多智能体",
  "ORCHESTRATION": "编排",
  "MCP": "模型上下文协议",
  "SKILLS": "技能",
  "CONTEXT ENGINEERING": "上下文工程",
  "HARNESS": "执行框架",
  "HUMAN IN LOOP": "人在回路",
  "MACHINE LEARNING": "机器学习",
  "DEEP LEARNING": "深度学习",
  "NEURAL NETWORK": "神经网络",
  "TRANSFORMER": "Transformer",
  "ATTENTION": "注意力",
  "SELF-ATTENTION": "自注意力",
  "TOKENIZATION": "词元化",
  "EMBEDDING SPACE": "嵌入空间",
  "LATENT SPACE": "潜空间",
  "REPRESENTATION": "表征",
  "PRETRAINING": "预训练",
  "SELF-SUPERVISION": "自监督",
  "FINE-TUNING": "微调",
  "SFT": "监督微调",
  "RLHF": "人类反馈强化学习",
  "DPO": "直接偏好优化",
  "REWARD MODEL": "奖励模型",
  "DISTILLATION": "蒸馏",
  "QUANTIZATION": "量化",
  "LoRA": "低秩适配",
  "MIXTURE OF EXPERTS": "混合专家",
  "SCALING LAW": "规模定律",
  "REASONING MODEL": "推理模型",
  "WORLD MODEL": "世界模型",
  "DATASET": "数据集",
  "DATA QUALITY": "数据质量",
  "DATA PIPELINE": "数据管线",
  "TRAINING SET": "训练集",
  "VALIDATION SET": "验证集",
  "TEST SET": "测试集",
  "BENCHMARK": "基准测试",
  "EVALUATION": "评估",
  "OFFLINE EVAL": "离线评估",
  "ONLINE EVAL": "在线评估",
  "A/B TEST": "A/B 测试",
  "TELEMETRY": "遥测",
  "TRACING": "追踪",
  "MONITORING": "监控",
  "LATENCY": "延迟",
  "THROUGHPUT": "吞吐量",
  "TOKEN COST": "词元成本",
  "CACHING": "缓存",
  "MODEL ROUTING": "模型路由",
  "FALLBACK": "降级回退",
  "GUARDRAILS": "护栏",
  "SANDBOX": "沙箱",
  "PERMISSION": "权限",
  "LOCAL LLM": "本地大模型",
  "EDGE AI": "边缘人工智能",
  "SENSOR": "传感器",
  "SIGNAL": "信号",
  "MEASUREMENT": "测量",
  "NOISE": "噪声",
  "PERCEPTION": "感知",
  "SENSOR FUSION": "传感器融合",
  "STATE": "状态",
  "STATE ESTIMATION": "状态估计",
  "ENVIRONMENT": "环境",
  "DYNAMICS": "动力学",
  "SYSTEM ID": "系统辨识",
  "OBSERVABILITY": "可观测性",
  "CONTROLLABILITY": "可控性",
  "PREDICTION": "预测",
  "PLANNING": "规划",
  "OBJECTIVE": "目标函数",
  "REWARD": "奖励",
  "POLICY": "策略",
  "DECISION": "决策",
  "ACTION": "行动",
  "ACTUATOR": "执行器",
  "CONTROL": "控制",
  "FEEDBACK": "反馈",
  "CLOSED LOOP": "闭环",
  "POMDP": "部分可观测决策",
  "REAL-TIME": "实时",
  "HUMAN OVERRIDE": "人工接管",
  "FAIL-SAFE": "故障安全",
  "HALLUCINATION": "幻觉",
  "GROUNDING": "现实锚定",
  "FACTUALITY": "事实性",
  "AMBIGUITY": "歧义",
  "UNCERTAINTY": "不确定性",
  "CONFIDENCE": "置信度",
  "CALIBRATION": "校准",
  "BRITTLENESS": "脆弱性",
  "OVERFITTING": "过拟合",
  "GENERALIZATION": "泛化",
  "OUT OF DISTRIBUTION": "分布外",
  "DISTRIBUTION SHIFT": "分布偏移",
  "CONCEPT DRIFT": "概念漂移",
  "SMALL DATA": "小数据",
  "SPURIOUS CORRELATION": "伪相关",
  "CONFOUNDING": "混杂",
  "IDENTIFIABILITY": "可辨识性",
  "PARTIAL OBSERVABILITY": "部分可观测性",
  "ROBUSTNESS": "鲁棒性",
  "RELIABILITY": "可靠性",
  "SAFETY": "安全性",
  "PROMPT INJECTION": "提示注入",
  "REWARD HACKING": "奖励劫持",
  "BIAS": "偏差",
  "INTERPRETABILITY": "可解释性",
  "ALIGNMENT": "对齐",
  "PROBABILITY": "概率",
  "STATISTICS": "统计学",
  "BAYESIAN INFERENCE": "贝叶斯推断",
  "ENTROPY": "熵",
  "INFORMATION THEORY": "信息论",
  "SIGNAL PROCESSING": "信号处理",
  "LINEAR ALGEBRA": "线性代数",
  "OPTIMIZATION": "优化",
  "LEARNING THEORY": "学习理论",
  "COMPLEXITY": "复杂性",
  "CAUSAL INFERENCE": "因果推断",
  "COUNTERFACTUAL": "反事实",
  "DECISION THEORY": "决策理论",
  "GAME THEORY": "博弈论",
  "DYNAMICAL SYSTEM": "动力系统",
  "SYSTEMS THEORY": "系统论",
  "CONTROL THEORY": "控制理论",
  "CYBERNETICS": "反馈控制论",
  "HCI": "人机交互",
  "COGNITIVE SCIENCE": "认知科学",
  "NEUROSCIENCE": "神经科学",
  "EPISTEMOLOGY": "认识论",
  "PHILOSOPHY OF MIND": "心灵哲学",
  "ETHICS": "伦理学",
  "CAUSALITY": "因果性",
  "COMPUTABILITY": "可计算性",
  "UNDERSTANDING": "理解",
};

export type RelationType =
  | "PART_OF"
  | "SUBTYPE_OF"
  | "TYPICAL_ARCHITECTURE"
  | "DEPENDS_ON"
  | "PRODUCES"
  | "MOTIVATES"
  | "ADDRESSES"
  | "EXPOSES_LIMIT"
  | "EXPLAINED_BY"
  | "CONVERGES_TO"
  | "SUPPORTS"
  | "AFFECTS"
  | "THREATENS"
  | "DESCRIBES"
  | "ESTIMATES"
  | "ASSOCIATED_WITH"
  | "RUNS_MODEL";

export type RelationSpec = { source: string; target: string; type: RelationType };
export type RelationDirection = "forward" | "reverse";
export type RelationText = { zh: string; en: string };

export const RELATION_DEFINITIONS: Record<
  RelationType,
  { forward: RelationText; reverse: RelationText }
> = {
  PART_OF: {
    forward: { zh: "是其组成部分", en: "PART OF" },
    reverse: { zh: "包含", en: "CONTAINS" },
  },
  SUBTYPE_OF: {
    forward: { zh: "属于这一类型", en: "TYPE OF" },
    reverse: { zh: "包含这一类型", en: "HAS TYPE" },
  },
  TYPICAL_ARCHITECTURE: {
    forward: { zh: "常用于实现", en: "COMMONLY IMPLEMENTS" },
    reverse: { zh: "常见架构", en: "COMMON ARCHITECTURE" },
  },
  DEPENDS_ON: {
    forward: { zh: "依赖", en: "DEPENDS ON" },
    reverse: { zh: "支撑", en: "SUPPORTS" },
  },
  PRODUCES: {
    forward: { zh: "产生", en: "PRODUCES" },
    reverse: { zh: "由其产生", en: "PRODUCED BY" },
  },
  MOTIVATES: {
    forward: { zh: "引出需求", en: "MOTIVATES" },
    reverse: { zh: "由此问题引出", en: "MOTIVATED BY" },
  },
  ADDRESSES: {
    forward: { zh: "用于改善", en: "ADDRESSES" },
    reverse: { zh: "可由其改善", en: "ADDRESSED BY" },
  },
  EXPOSES_LIMIT: {
    forward: { zh: "暴露限制", en: "EXPOSES LIMIT" },
    reverse: { zh: "限制其能力", en: "LIMITS" },
  },
  EXPLAINED_BY: {
    forward: { zh: "可由其解释", en: "EXPLAINED BY" },
    reverse: { zh: "用于解释", en: "EXPLAINS" },
  },
  CONVERGES_TO: {
    forward: { zh: "深入后收敛到", en: "CONVERGES TO" },
    reverse: { zh: "来源问题", en: "ARISES FROM" },
  },
  SUPPORTS: {
    forward: { zh: "支撑", en: "SUPPORTS" },
    reverse: { zh: "由其支撑", en: "SUPPORTED BY" },
  },
  AFFECTS: {
    forward: { zh: "影响", en: "AFFECTS" },
    reverse: { zh: "受其影响", en: "AFFECTED BY" },
  },
  THREATENS: {
    forward: { zh: "损害或威胁", en: "THREATENS" },
    reverse: { zh: "受到威胁", en: "THREATENED BY" },
  },
  DESCRIBES: {
    forward: { zh: "描述其规律", en: "DESCRIBES" },
    reverse: { zh: "其规律由此描述", en: "DESCRIBED BY" },
  },
  ESTIMATES: {
    forward: { zh: "估计", en: "ESTIMATES" },
    reverse: { zh: "由其估计", en: "ESTIMATED BY" },
  },
  ASSOCIATED_WITH: {
    forward: { zh: "与其相关", en: "ASSOCIATED WITH" },
    reverse: { zh: "与其相关", en: "ASSOCIATED WITH" },
  },
  RUNS_MODEL: {
    forward: { zh: "运行该模型", en: "RUNS MODEL" },
    reverse: { zh: "由其运行", en: "RUN BY" },
  },
};

export const RELATIONS: RelationSpec[] = [
  // 01 · surface concepts and their first mechanisms
  { source:"1:AIGC", target:"1:AI", type:"SUBTYPE_OF" },
  { source:"1:CHATBOT", target:"1:AI", type:"SUBTYPE_OF" },
  { source:"1:CHATBOT", target:"1:PROMPT", type:"DEPENDS_ON" },
  { source:"1:SYSTEM PROMPT", target:"1:PROMPT", type:"SUBTYPE_OF" },
  { source:"1:TEXT GENERATION", target:"1:AIGC", type:"SUBTYPE_OF" },
  { source:"1:IMAGE GENERATION", target:"1:AIGC", type:"SUBTYPE_OF" },
  { source:"1:TEXT-TO-IMAGE", target:"1:IMAGE GENERATION", type:"SUBTYPE_OF" },
  { source:"1:TEXT-TO-VIDEO", target:"1:AIGC", type:"SUBTYPE_OF" },
  { source:"1:VOICE CLONING", target:"1:SPEECH", type:"SUBTYPE_OF" },
  { source:"1:SPEECH", target:"1:MULTIMODAL", type:"SUPPORTS" },
  { source:"1:AI CODING", target:"1:AI", type:"SUBTYPE_OF" },
  { source:"1:VIBE CODING", target:"1:AI CODING", type:"SUBTYPE_OF" },
  { source:"1:LLM", target:"1:FOUNDATION MODEL", type:"SUBTYPE_OF" },
  { source:"1:DIFFUSION", target:"1:IMAGE GENERATION", type:"TYPICAL_ARCHITECTURE" },
  { source:"1:AI CODING", target:"2:WORKFLOW", type:"MOTIVATES" },
  { source:"1:AGI", target:"8:ALIGNMENT", type:"CONVERGES_TO" },
  { source:"1:AGI", target:"8:UNDERSTANDING", type:"CONVERGES_TO" },

  // 02 · capability construction
  { source:"2:ZERO-SHOT", target:"1:PROMPT", type:"DEPENDS_ON" },
  { source:"2:FEW-SHOT", target:"1:PROMPT", type:"DEPENDS_ON" },
  { source:"2:STRUCTURED OUTPUT", target:"1:PROMPT", type:"DEPENDS_ON" },
  { source:"2:INFERENCE", target:"1:LLM", type:"RUNS_MODEL" },
  { source:"2:TEMPERATURE", target:"2:INFERENCE", type:"AFFECTS" },
  { source:"2:API", target:"2:TOOL USE", type:"SUPPORTS" },
  { source:"2:FUNCTION CALLING", target:"2:TOOL USE", type:"SUPPORTS" },
  { source:"2:MEMORY", target:"2:AGENT", type:"SUPPORTS" },
  { source:"2:WORKFLOW", target:"2:AUTOMATION", type:"SUPPORTS" },
  { source:"2:WORKFLOW", target:"2:AGENT", type:"SUPPORTS" },
  { source:"2:CHUNKING", target:"2:RAG", type:"PART_OF" },
  { source:"2:EMBEDDING", target:"2:RAG", type:"PART_OF" },
  { source:"2:VECTOR DATABASE", target:"2:RAG", type:"PART_OF" },
  { source:"2:RERANKING", target:"2:RAG", type:"PART_OF" },
  { source:"2:VECTOR DATABASE", target:"2:EMBEDDING", type:"DEPENDS_ON" },
  { source:"2:EMBEDDING", target:"3:EMBEDDING SPACE", type:"SUPPORTS" },
  { source:"2:RAG", target:"6:GROUNDING", type:"ADDRESSES" },
  { source:"2:TOOL USE", target:"2:AGENT", type:"SUPPORTS" },
  { source:"2:AGENT", target:"4:EVALUATION", type:"MOTIVATES" },
  { source:"2:AGENT", target:"4:SANDBOX", type:"MOTIVATES" },
  { source:"2:AGENT", target:"4:PERMISSION", type:"MOTIVATES" },
  { source:"2:AGENT", target:"6:RELIABILITY", type:"EXPOSES_LIMIT" },
  { source:"2:AGENT", target:"2:MULTI-AGENT", type:"PART_OF" },
  { source:"2:MULTI-AGENT", target:"2:ORCHESTRATION", type:"DEPENDS_ON" },
  { source:"2:MCP", target:"2:TOOL USE", type:"SUPPORTS" },
  { source:"2:MCP", target:"2:AGENT", type:"SUPPORTS" },
  { source:"2:MCP", target:"2:CONTEXT ENGINEERING", type:"SUPPORTS" },
  { source:"2:SKILLS", target:"2:AGENT", type:"SUPPORTS" },
  { source:"2:HARNESS", target:"2:AGENT", type:"SUPPORTS" },
  { source:"1:SYSTEM PROMPT", target:"2:CONTEXT ENGINEERING", type:"PART_OF" },
  { source:"2:FEW-SHOT", target:"2:CONTEXT ENGINEERING", type:"PART_OF" },
  { source:"1:CONTEXT WINDOW", target:"2:MEMORY", type:"MOTIVATES" },
  { source:"1:CONTEXT WINDOW", target:"2:CONTEXT ENGINEERING", type:"MOTIVATES" },
  { source:"2:HUMAN IN LOOP", target:"2:AUTOMATION", type:"SUPPORTS" },
  { source:"2:HUMAN IN LOOP", target:"5:HUMAN OVERRIDE", type:"SUPPORTS" },

  // 03 · model mechanisms
  { source:"3:MACHINE LEARNING", target:"1:AI", type:"SUBTYPE_OF" },
  { source:"3:DEEP LEARNING", target:"3:MACHINE LEARNING", type:"SUBTYPE_OF" },
  { source:"3:DEEP LEARNING", target:"3:NEURAL NETWORK", type:"DEPENDS_ON" },
  { source:"3:TRANSFORMER", target:"3:NEURAL NETWORK", type:"SUBTYPE_OF" },
  { source:"3:TRANSFORMER", target:"1:LLM", type:"TYPICAL_ARCHITECTURE" },
  { source:"3:ATTENTION", target:"3:TRANSFORMER", type:"PART_OF" },
  { source:"3:SELF-ATTENTION", target:"3:ATTENTION", type:"SUBTYPE_OF" },
  { source:"3:TOKENIZATION", target:"1:TOKEN", type:"PRODUCES" },
  { source:"3:TOKENIZATION", target:"3:EMBEDDING SPACE", type:"SUPPORTS" },
  { source:"3:EMBEDDING SPACE", target:"3:REPRESENTATION", type:"PART_OF" },
  { source:"3:LATENT SPACE", target:"3:REPRESENTATION", type:"PART_OF" },
  { source:"3:REPRESENTATION", target:"1:FOUNDATION MODEL", type:"SUPPORTS" },
  { source:"3:REPRESENTATION", target:"1:MULTIMODAL", type:"SUPPORTS" },
  { source:"3:PRETRAINING", target:"1:FOUNDATION MODEL", type:"SUPPORTS" },
  { source:"3:SELF-SUPERVISION", target:"3:PRETRAINING", type:"SUPPORTS" },
  { source:"3:SFT", target:"3:FINE-TUNING", type:"SUBTYPE_OF" },
  { source:"3:DPO", target:"3:FINE-TUNING", type:"SUBTYPE_OF" },
  { source:"3:LoRA", target:"3:FINE-TUNING", type:"SUBTYPE_OF" },
  { source:"3:SFT", target:"3:RLHF", type:"SUPPORTS" },
  { source:"3:REWARD MODEL", target:"3:RLHF", type:"PART_OF" },
  { source:"3:RLHF", target:"6:ALIGNMENT", type:"ADDRESSES" },
  { source:"3:DPO", target:"6:ALIGNMENT", type:"ADDRESSES" },
  { source:"3:REWARD MODEL", target:"6:REWARD HACKING", type:"EXPOSES_LIMIT" },
  { source:"3:DISTILLATION", target:"4:LOCAL LLM", type:"SUPPORTS" },
  { source:"3:QUANTIZATION", target:"4:LOCAL LLM", type:"SUPPORTS" },
  { source:"3:MIXTURE OF EXPERTS", target:"1:FOUNDATION MODEL", type:"TYPICAL_ARCHITECTURE" },
  { source:"3:SCALING LAW", target:"1:FOUNDATION MODEL", type:"DESCRIBES" },
  { source:"3:REASONING MODEL", target:"1:LLM", type:"SUBTYPE_OF" },
  { source:"3:REASONING MODEL", target:"4:EVALUATION", type:"MOTIVATES" },
  { source:"3:WORLD MODEL", target:"5:PREDICTION", type:"SUPPORTS" },
  { source:"3:WORLD MODEL", target:"5:PLANNING", type:"SUPPORTS" },

  // 04 · production systems
  { source:"4:TRAINING SET", target:"4:DATASET", type:"PART_OF" },
  { source:"4:VALIDATION SET", target:"4:DATASET", type:"PART_OF" },
  { source:"4:TEST SET", target:"4:DATASET", type:"PART_OF" },
  { source:"4:DATA PIPELINE", target:"4:DATASET", type:"PRODUCES" },
  { source:"4:DATASET", target:"3:PRETRAINING", type:"SUPPORTS" },
  { source:"4:DATA QUALITY", target:"4:EVALUATION", type:"AFFECTS" },
  { source:"4:DATA QUALITY", target:"6:GENERALIZATION", type:"AFFECTS" },
  { source:"4:BENCHMARK", target:"4:OFFLINE EVAL", type:"SUPPORTS" },
  { source:"4:OFFLINE EVAL", target:"4:EVALUATION", type:"SUBTYPE_OF" },
  { source:"4:ONLINE EVAL", target:"4:EVALUATION", type:"SUBTYPE_OF" },
  { source:"4:A/B TEST", target:"4:ONLINE EVAL", type:"SUBTYPE_OF" },
  { source:"4:TELEMETRY", target:"4:TRACING", type:"SUPPORTS" },
  { source:"4:TELEMETRY", target:"4:MONITORING", type:"SUPPORTS" },
  { source:"4:TRACING", target:"4:MONITORING", type:"SUPPORTS" },
  { source:"4:MONITORING", target:"6:RELIABILITY", type:"SUPPORTS" },
  { source:"4:LATENCY", target:"2:INFERENCE", type:"AFFECTS" },
  { source:"4:THROUGHPUT", target:"2:INFERENCE", type:"AFFECTS" },
  { source:"4:TOKEN COST", target:"2:INFERENCE", type:"AFFECTS" },
  { source:"4:CACHING", target:"4:LATENCY", type:"ADDRESSES" },
  { source:"4:CACHING", target:"4:TOKEN COST", type:"ADDRESSES" },
  { source:"4:MODEL ROUTING", target:"4:LATENCY", type:"ADDRESSES" },
  { source:"4:MODEL ROUTING", target:"4:TOKEN COST", type:"ADDRESSES" },
  { source:"4:FALLBACK", target:"4:MODEL ROUTING", type:"PART_OF" },
  { source:"4:GUARDRAILS", target:"6:PROMPT INJECTION", type:"ADDRESSES" },
  { source:"4:SANDBOX", target:"6:PROMPT INJECTION", type:"ADDRESSES" },
  { source:"4:PERMISSION", target:"6:PROMPT INJECTION", type:"ADDRESSES" },
  { source:"4:GUARDRAILS", target:"6:SAFETY", type:"SUPPORTS" },
  { source:"4:SANDBOX", target:"6:SAFETY", type:"SUPPORTS" },
  { source:"4:LOCAL LLM", target:"4:EDGE AI", type:"SUPPORTS" },
  { source:"4:EDGE AI", target:"5:REAL-TIME", type:"SUPPORTS" },
  { source:"4:EDGE AI", target:"5:SENSOR", type:"DEPENDS_ON" },

  // 05 · perception, decision and action
  { source:"5:SENSOR", target:"5:ENVIRONMENT", type:"DEPENDS_ON" },
  { source:"5:SENSOR", target:"5:MEASUREMENT", type:"PRODUCES" },
  { source:"5:SENSOR", target:"5:SIGNAL", type:"PRODUCES" },
  { source:"5:NOISE", target:"5:MEASUREMENT", type:"AFFECTS" },
  { source:"5:NOISE", target:"5:SIGNAL", type:"AFFECTS" },
  { source:"5:SENSOR FUSION", target:"5:SENSOR", type:"DEPENDS_ON" },
  { source:"5:SENSOR FUSION", target:"5:STATE ESTIMATION", type:"SUPPORTS" },
  { source:"5:PERCEPTION", target:"5:STATE ESTIMATION", type:"SUPPORTS" },
  { source:"5:STATE ESTIMATION", target:"5:STATE", type:"ESTIMATES" },
  { source:"5:OBSERVABILITY", target:"5:STATE ESTIMATION", type:"AFFECTS" },
  { source:"5:SYSTEM ID", target:"5:DYNAMICS", type:"ESTIMATES" },
  { source:"5:DYNAMICS", target:"5:PREDICTION", type:"SUPPORTS" },
  { source:"5:PREDICTION", target:"5:PLANNING", type:"SUPPORTS" },
  { source:"5:PLANNING", target:"5:DECISION", type:"SUPPORTS" },
  { source:"5:OBJECTIVE", target:"5:REWARD", type:"AFFECTS" },
  { source:"5:REWARD", target:"5:POLICY", type:"AFFECTS" },
  { source:"5:POLICY", target:"5:DECISION", type:"SUPPORTS" },
  { source:"5:DECISION", target:"5:ACTION", type:"PRODUCES" },
  { source:"5:ACTION", target:"5:ACTUATOR", type:"DEPENDS_ON" },
  { source:"5:ACTUATOR", target:"5:CONTROL", type:"DEPENDS_ON" },
  { source:"5:CONTROL", target:"5:FEEDBACK", type:"DEPENDS_ON" },
  { source:"5:CONTROL", target:"5:CONTROLLABILITY", type:"DEPENDS_ON" },
  { source:"5:SENSOR", target:"5:CLOSED LOOP", type:"PART_OF" },
  { source:"5:CONTROL", target:"5:CLOSED LOOP", type:"PART_OF" },
  { source:"5:FEEDBACK", target:"5:CLOSED LOOP", type:"PART_OF" },
  { source:"5:ACTUATOR", target:"5:CLOSED LOOP", type:"PART_OF" },
  { source:"5:POMDP", target:"6:PARTIAL OBSERVABILITY", type:"ADDRESSES" },
  { source:"5:POMDP", target:"5:DECISION", type:"SUPPORTS" },
  { source:"5:REAL-TIME", target:"5:CONTROL", type:"AFFECTS" },
  { source:"5:HUMAN OVERRIDE", target:"6:SAFETY", type:"SUPPORTS" },
  { source:"5:FAIL-SAFE", target:"6:SAFETY", type:"SUPPORTS" },
  { source:"5:FAIL-SAFE", target:"6:RELIABILITY", type:"SUPPORTS" },
  { source:"5:ACTION", target:"6:RELIABILITY", type:"EXPOSES_LIMIT" },

  // 06 · failure modes and capability conditions
  { source:"6:HALLUCINATION", target:"6:FACTUALITY", type:"THREATENS" },
  { source:"6:GROUNDING", target:"6:HALLUCINATION", type:"ADDRESSES" },
  { source:"6:GROUNDING", target:"6:FACTUALITY", type:"SUPPORTS" },
  { source:"6:AMBIGUITY", target:"6:UNCERTAINTY", type:"MOTIVATES" },
  { source:"6:CONFIDENCE", target:"6:CALIBRATION", type:"MOTIVATES" },
  { source:"6:CALIBRATION", target:"6:RELIABILITY", type:"SUPPORTS" },
  { source:"6:BRITTLENESS", target:"6:RELIABILITY", type:"THREATENS" },
  { source:"6:OVERFITTING", target:"6:GENERALIZATION", type:"THREATENS" },
  { source:"6:OUT OF DISTRIBUTION", target:"6:DISTRIBUTION SHIFT", type:"ASSOCIATED_WITH" },
  { source:"6:CONCEPT DRIFT", target:"6:DISTRIBUTION SHIFT", type:"SUBTYPE_OF" },
  { source:"6:DISTRIBUTION SHIFT", target:"6:ROBUSTNESS", type:"THREATENS" },
  { source:"6:DISTRIBUTION SHIFT", target:"6:GENERALIZATION", type:"THREATENS" },
  { source:"6:SMALL DATA", target:"6:GENERALIZATION", type:"AFFECTS" },
  { source:"6:SMALL DATA", target:"6:IDENTIFIABILITY", type:"AFFECTS" },
  { source:"6:CONFOUNDING", target:"6:SPURIOUS CORRELATION", type:"PRODUCES" },
  { source:"6:SPURIOUS CORRELATION", target:"6:GENERALIZATION", type:"THREATENS" },
  { source:"7:CAUSAL INFERENCE", target:"6:CONFOUNDING", type:"ADDRESSES" },
  { source:"6:PARTIAL OBSERVABILITY", target:"5:STATE ESTIMATION", type:"EXPOSES_LIMIT" },
  { source:"6:PARTIAL OBSERVABILITY", target:"5:OBSERVABILITY", type:"THREATENS" },
  { source:"6:ROBUSTNESS", target:"6:RELIABILITY", type:"SUPPORTS" },
  { source:"6:RELIABILITY", target:"6:SAFETY", type:"SUPPORTS" },
  { source:"6:PROMPT INJECTION", target:"6:SAFETY", type:"THREATENS" },
  { source:"6:REWARD HACKING", target:"6:ALIGNMENT", type:"THREATENS" },
  { source:"6:REWARD HACKING", target:"6:SAFETY", type:"THREATENS" },
  { source:"6:BIAS", target:"6:ALIGNMENT", type:"THREATENS" },
  { source:"6:INTERPRETABILITY", target:"6:RELIABILITY", type:"SUPPORTS" },
  { source:"6:INTERPRETABILITY", target:"6:ALIGNMENT", type:"SUPPORTS" },
  { source:"6:GENERALIZATION", target:"8:GENERALIZATION", type:"CONVERGES_TO" },
  { source:"6:IDENTIFIABILITY", target:"8:IDENTIFIABILITY", type:"CONVERGES_TO" },
  { source:"5:OBSERVABILITY", target:"8:OBSERVABILITY", type:"CONVERGES_TO" },
  { source:"5:CONTROLLABILITY", target:"8:CONTROLLABILITY", type:"CONVERGES_TO" },
  { source:"6:ALIGNMENT", target:"8:ALIGNMENT", type:"CONVERGES_TO" },

  // 07 · theoretical explanations
  { source:"7:BAYESIAN INFERENCE", target:"7:PROBABILITY", type:"DEPENDS_ON" },
  { source:"7:STATISTICS", target:"6:CALIBRATION", type:"SUPPORTS" },
  { source:"7:STATISTICS", target:"6:IDENTIFIABILITY", type:"SUPPORTS" },
  { source:"7:ENTROPY", target:"7:INFORMATION THEORY", type:"PART_OF" },
  { source:"6:UNCERTAINTY", target:"7:PROBABILITY", type:"EXPLAINED_BY" },
  { source:"6:UNCERTAINTY", target:"7:INFORMATION THEORY", type:"EXPLAINED_BY" },
  { source:"3:REPRESENTATION", target:"7:INFORMATION THEORY", type:"EXPLAINED_BY" },
  { source:"7:SIGNAL PROCESSING", target:"5:NOISE", type:"ADDRESSES" },
  { source:"7:SIGNAL PROCESSING", target:"5:SENSOR FUSION", type:"SUPPORTS" },
  { source:"7:LINEAR ALGEBRA", target:"3:NEURAL NETWORK", type:"SUPPORTS" },
  { source:"7:LINEAR ALGEBRA", target:"3:EMBEDDING SPACE", type:"SUPPORTS" },
  { source:"7:OPTIMIZATION", target:"3:PRETRAINING", type:"SUPPORTS" },
  { source:"7:OPTIMIZATION", target:"3:FINE-TUNING", type:"SUPPORTS" },
  { source:"7:OPTIMIZATION", target:"5:POLICY", type:"SUPPORTS" },
  { source:"6:GENERALIZATION", target:"7:LEARNING THEORY", type:"EXPLAINED_BY" },
  { source:"7:COMPLEXITY", target:"7:LEARNING THEORY", type:"SUPPORTS" },
  { source:"7:COMPLEXITY", target:"8:COMPUTABILITY", type:"CONVERGES_TO" },
  { source:"7:COUNTERFACTUAL", target:"7:CAUSAL INFERENCE", type:"SUPPORTS" },
  { source:"7:CAUSAL INFERENCE", target:"8:IDENTIFIABILITY", type:"CONVERGES_TO" },
  { source:"7:CAUSAL INFERENCE", target:"8:CAUSALITY", type:"CONVERGES_TO" },
  { source:"7:COUNTERFACTUAL", target:"8:CAUSALITY", type:"CONVERGES_TO" },
  { source:"5:DECISION", target:"7:DECISION THEORY", type:"EXPLAINED_BY" },
  { source:"2:MULTI-AGENT", target:"7:GAME THEORY", type:"EXPLAINED_BY" },
  { source:"5:DYNAMICS", target:"7:DYNAMICAL SYSTEM", type:"EXPLAINED_BY" },
  { source:"7:DYNAMICAL SYSTEM", target:"7:SYSTEMS THEORY", type:"SUPPORTS" },
  { source:"5:CONTROL", target:"7:CONTROL THEORY", type:"EXPLAINED_BY" },
  { source:"5:OBSERVABILITY", target:"7:CONTROL THEORY", type:"EXPLAINED_BY" },
  { source:"5:CONTROLLABILITY", target:"7:CONTROL THEORY", type:"EXPLAINED_BY" },
  { source:"5:FEEDBACK", target:"7:CYBERNETICS", type:"EXPLAINED_BY" },
  { source:"7:CONTROL THEORY", target:"7:SYSTEMS THEORY", type:"DEPENDS_ON" },
  { source:"7:HCI", target:"2:HUMAN IN LOOP", type:"SUPPORTS" },
  { source:"7:NEUROSCIENCE", target:"7:COGNITIVE SCIENCE", type:"SUPPORTS" },
  { source:"7:COGNITIVE SCIENCE", target:"8:UNDERSTANDING", type:"CONVERGES_TO" },
  { source:"7:EPISTEMOLOGY", target:"8:UNDERSTANDING", type:"CONVERGES_TO" },
  { source:"7:PHILOSOPHY OF MIND", target:"8:UNDERSTANDING", type:"CONVERGES_TO" },
  { source:"7:ETHICS", target:"8:ALIGNMENT", type:"CONVERGES_TO" },
];

export const OVERVIEW_LANDMARKS_BY_LAYER: Record<number, string[]> = {
  1: ["AI", "CHATBOT", "PROMPT", "LLM", "IMAGE GENERATION", "AI CODING", "AGI"],
  2: ["AUTOMATION", "RAG", "AGENT", "MCP"],
  3: ["TRANSFORMER", "REASONING MODEL", "WORLD MODEL"],
  4: ["DATASET", "EVALUATION", "MONITORING"],
  5: ["SENSOR", "PREDICTION", "CONTROL"],
  6: ["HALLUCINATION", "UNCERTAINTY", "RELIABILITY"],
  7: ["INFORMATION THEORY", "CAUSAL INFERENCE", "CONTROL THEORY"],
  8: ["ALIGNMENT", "UNDERSTANDING", "CAUSALITY"],
};
export const OVERVIEW_LANDMARK_KEYS = new Set(
  Object.entries(OVERVIEW_LANDMARKS_BY_LAYER).flatMap(([layer, names]) =>
    names.map((name) => layer + ":" + name),
  ),
);

export const NODE_NAME_OVERRIDES: Record<string, { zh: string; en: string }> = {
  "8:GENERALIZATION": { zh: "泛化边界", en: "GENERALIZATION LIMITS" },
  "8:IDENTIFIABILITY": { zh: "可辨识性限制", en: "IDENTIFIABILITY LIMITS" },
  "8:OBSERVABILITY": { zh: "可观测性边界", en: "OBSERVABILITY LIMITS" },
  "8:CONTROLLABILITY": { zh: "可控性边界", en: "CONTROLLABILITY LIMITS" },
  "8:CAUSALITY": { zh: "因果本体问题", en: "THE PROBLEM OF CAUSALITY" },
  "8:COMPUTABILITY": { zh: "计算边界", en: "LIMITS OF COMPUTATION" },
  "8:ALIGNMENT": { zh: "对齐边界", en: "ALIGNMENT BOUNDARY" },
  "8:UNDERSTANDING": { zh: "理解问题", en: "THE PROBLEM OF UNDERSTANDING" },
};

export type Concept = { key: string; name: string; layer: Layer };
export const CONCEPTS: Concept[] = LAYERS.flatMap((layer) =>
  layer.terms.map((name) => ({ key: layer.id + ":" + name, name, layer })),
);
export const CONCEPT_BY_KEY = new Map(CONCEPTS.map((concept) => [concept.key, concept]));

export function localizedName(name: string, lang: Lang, key?: string) {
  const override = key ? NODE_NAME_OVERRIDES[key] : undefined;
  if (override) return override[lang];
  return lang === "en" ? name : (ZH_NAMES[name] ?? name);
}

export function relationLabel(type: RelationType, direction: RelationDirection, lang: Lang) {
  return RELATION_DEFINITIONS[type][direction][lang];
}

export function seeded(i: number) {
  const x = Math.sin(i * 9283.31 + 17.7) * 43758.5453;
  return x - Math.floor(x);
}

export function relationsFor(key: string) {
  const current = CONCEPT_BY_KEY.get(key);
  if (!current) return { outward: [], inward: [] };
  const neighbors: Array<{
    relation: RelationSpec;
    concept: Concept;
    direction: RelationDirection;
  }> = [];
  RELATIONS.forEach((relation) => {
    if (relation.source === key) {
      const concept = CONCEPT_BY_KEY.get(relation.target);
      if (concept) neighbors.push({ relation, concept, direction: "forward" });
    }
    if (relation.target === key) {
      const concept = CONCEPT_BY_KEY.get(relation.source);
      if (concept) neighbors.push({ relation, concept, direction: "reverse" });
    }
  });
  return {
    outward: neighbors.filter(({ concept }) => concept.layer.id < current.layer.id),
    inward: neighbors.filter(({ concept }) => concept.layer.id >= current.layer.id),
  };
}

export type LabelVisibilityInput = {
  activeLayer: number;
  nodeLayer: number;
  overviewLandmark: boolean;
  authorPath: boolean;
  viewMode: ViewMode;
  frontFacing: boolean;
  selected: boolean;
  hovered: boolean;
  connected: boolean;
};

export function shouldShowNodeLabel({
  activeLayer,
  nodeLayer,
  overviewLandmark,
  authorPath,
  viewMode,
  frontFacing,
  selected,
  hovered,
  connected,
}: LabelVisibilityInput) {
  if (selected || hovered || connected) return true;
  if (!frontFacing) return false;
  if (viewMode === "path") return authorPath;
  if (activeLayer === 0) return overviewLandmark;
  return activeLayer === nodeLayer;
}
