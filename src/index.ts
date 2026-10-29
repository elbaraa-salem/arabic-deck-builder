type Lesson = {
  id: string;
  title: string;
  level: string;
};

const lesson: Lesson = {
  id: "A0-L02",
  title: "هَذَا وهَذِهِ",
  level: "A0",
};

console.log("Arabic Deck Builder");
console.log("-------------------");
console.log(`Lesson: ${lesson.id}`);
console.log(`Title: ${lesson.title}`);
console.log(`Level: ${lesson.level}`);
