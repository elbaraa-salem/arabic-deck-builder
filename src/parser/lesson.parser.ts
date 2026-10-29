import { readFile } from "node:fs/promises";
import { parse } from "yaml";

import {
  lessonSchema,
  type Lesson,
} from '../schema/lesson.schema.ts';

export async function loadLesson(filePath: string): Promise<Lesson> {
  const fileContent = await readFile(filePath, "utf8");

  const rawData: unknown = parse(fileContent);

  const lesson = lessonSchema.parse(rawData);

  return lesson;
}
