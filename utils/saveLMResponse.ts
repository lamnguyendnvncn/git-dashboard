import fs from "fs";
import path from "path";

export const saveReviewToMarkdown = (data: string, outputDir: string, dateString: string, timeString: string) => {
  let markdownContent = "# Code Review Analysis\n";
  const fileName = `code-review-${dateString}-${timeString}.md`;

  markdownContent += data;

  const outputPath = path.join(outputDir, fileName);

  fs.writeFileSync(outputPath, markdownContent);
};

export const saveGitChanges = (data: string, outputDir: string, dateString: string, timeSting: string) => {
  const fileName = `git-changes-${dateString}-${timeSting}.json`;

  const outputPath = path.join(outputDir, fileName);
  fs.writeFileSync(outputPath, data, "utf-8");
};
