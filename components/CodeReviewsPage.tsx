"use client";

import { useState } from "react";
import Markdown from "react-markdown";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface Props {
  data: Record<string, string>;
}

const CodeReviewsPage = ({ data }: Props) => {
  const fileNames = Object.keys(data);
  const fileContents = Object.values(data);
  const [selectedReview, setSelectedReview] = useState(0);

  return (
    <div className="markdown-body">
      <Select
        value={fileNames[selectedReview]}
        onValueChange={(value) => {
          const index = fileNames.indexOf(value);
          if (index !== -1) {
            setSelectedReview(index);
          }
        }}>
        <SelectTrigger className="w-full sm:w-[300px]">
          <SelectValue placeholder="Select a review" />
        </SelectTrigger>
        <SelectContent>
          {fileNames.map((review, index) => (
            <SelectItem key={index} value={review}>
              {review}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Markdown>{fileContents[selectedReview]}</Markdown>
    </div>
  );
};

export default CodeReviewsPage;
