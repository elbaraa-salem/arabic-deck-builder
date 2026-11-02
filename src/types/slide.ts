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
}

export type SlideSpec =
  | IntroduceSlide
  | QuestionSlide
  | RevealSlide
  | DialogueSlide
  | RecallSlide;
