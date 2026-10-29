export type IntroduceSlide = {
  type: "introduce";
  arabic: string;
  russian: string;
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

export type SlideSpec = IntroduceSlide | QuestionSlide | RevealSlide;
