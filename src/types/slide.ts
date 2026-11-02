import type { SupportStage } from "./support.ts";

export type IntroduceSlide = {
  type: "introduce";
  arabic: string;
  translation?: string;
  image: string;
};

export type QuestionSlide = {
  type: "question";
  question: string;
  image: string;
};

export type RevealSlide = {
  type: "reveal";
  question: string;
  answer: string;
  image: string;
};

export type DialogueSlideLine = {
  speaker: "A" | "B";
  arabic: string;
  translation?: string;
};

export type DialogueSpeakers = {
  A: string;
  B: string;
};

export type DialogueSlide = {
  type: "dialogue";
  speakers: DialogueSpeakers;
  image?: string;
  lines: DialogueSlideLine[];
};

export type RecallSlide = {
  type: "recall";
  question: string;
  image?: string;
  support: SupportStage;
  answer: string;
  showAnswer: boolean;
};

export type DiscriminateSlide = {
  type: "discriminate";
  question: string;
  image?: string;
  choices: string[];
  answer: string;
  support: SupportStage;
  showAnswer: boolean;
};

export type TransformSlide = {
  type: "transform";
  instruction: string;
  model: string;
  cue: {
    text: string;
    image?: string;
  };
  answer: string;
  support: SupportStage;
  showAnswer: boolean;
};

export type PersonalizeSlide = {
  type: "personalize";
  model?: string;
  question: string;
  image?: string;
  support: SupportStage;
};

export type InterpretSlide = {
  type: "interpret";
  passage: string;
  question: string;
  choices: string[];
  answer: string;
  image?: string;
  support: SupportStage;
  showAnswer: boolean;
};

export type InformationGapFact = {
  label: string;
  value?: string;
  answer?: string;
};

export type InformationGapSlide = {
  type: "information_gap";

  instruction: string;

  subject?: string;

  image?: string;

  facts: InformationGapFact[];

  support: SupportStage;

  showAnswers: boolean;
};

export type RolePlaySlide = {
  type: "role_play";

  instruction: string;

  situation: string;

  roles: {
    student: string;
    partner: string;
  };

  goals: string[];

  image?: string;

  support: SupportStage;
};

export type NoticingItem = {
  text: string;
  image?: string;
};

export type NoticingSlide = {
  type: "noticing";
  instruction: string;
  items: NoticingItem[];
  question: string;
  insight: string;
  support: SupportStage;
  showInsight: boolean;
};

export type ErrorCorrectionSlide = {
  type: "error_correction";
  instruction: string;
  incorrect: string;
  correction: string;
  explanation?: string;
  image?: string;
  support: SupportStage;
  showCorrection: boolean;
};

export type SelfCheckItem = {
  text: string;
  prompt?: string;
};

export type SelfCheckSlide = {
  type: "self_check";

  title: string;

  items: SelfCheckItem[];
};

export type LessonCoverSlide = {
  type: "lesson_cover";

  title: string;

  subtitle?: string;

  translation?: string;
};

export type SectionBreakSlide = {
  type: "section_break";

  title: string;

  subtitle?: string;

  translation?: string;
};

export type LessonEndSlide = {
  type: "lesson_end";

  title: string;

  subtitle?: string;

  translation?: string;
};

export type SlideSpec =
  | IntroduceSlide
  | QuestionSlide
  | RevealSlide
  | DialogueSlide
  | RecallSlide
  | DiscriminateSlide
  | TransformSlide
  | PersonalizeSlide
  | InterpretSlide
  | InformationGapSlide
  | RolePlaySlide
  | NoticingSlide
  | ErrorCorrectionSlide
  | SelfCheckSlide
  | LessonCoverSlide
  | SectionBreakSlide
  | LessonEndSlide;
