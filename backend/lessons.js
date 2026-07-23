import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const lessonsPath = path.join(__dirname, "lessons.json");

export const loadLessonsData = () => {
  const raw = fs.readFileSync(lessonsPath, "utf8");
  return JSON.parse(raw);
};

export const saveLessonsData = (data) => {
  fs.writeFileSync(lessonsPath, JSON.stringify(data, null, 2), "utf8");
  return data;
};

const lessonsData = loadLessonsData();
export default lessonsData;
