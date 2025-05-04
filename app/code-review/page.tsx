import CodeReviewsPage from "@/components/CodeReviewsPage";
import fs from "fs";
import path from "path";

const readFilesInFolder = async (folderPath: string): Promise<Record<string, string>> => {
  try {
    const absoluteFolderPath = path.resolve(folderPath);
    const files = await fs.promises.readdir(absoluteFolderPath);

    const fileReadPromises = files.map(async (file) => {
      const filePath = path.join(absoluteFolderPath, file);
      const stat = await fs.promises.stat(filePath);
      if (stat.isFile()) {
        const content = await fs.promises.readFile(filePath, "utf-8");
        return { [file]: content };
      }
      return {}; // Skip directories
    });

    const results = await Promise.all(fileReadPromises);
    return Object.assign({}, ...results); // Merge array of objects into one
  } catch (err: any) {
    throw new Error(`Error reading files from folder: ${err.message}`);
  }
};

const Page = async () => {
  const filePath = path.join(process.cwd(), "data/response");
  const data = await readFilesInFolder(filePath);
  return <CodeReviewsPage data={data} />;
};

export default Page;
