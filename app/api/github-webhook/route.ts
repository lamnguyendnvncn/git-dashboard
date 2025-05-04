/* eslint-disable @typescript-eslint/no-explicit-any */
import { eventEmitter } from "@/utils/eventEmitter";
import { saveGitChanges, saveReviewToMarkdown } from "@/utils/saveLMResponse";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN || "";

export const POST = async (req: NextRequest) => {
  const signature = req.headers.get("x-hub-signature-256");
  const body = await req.text();

  if (!verifySignature(body, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(body);
  const eventType = req.headers.get("x-github-event");

  if (eventType === "push") {
    const change = await fetchBeforeAfterChange(payload);
    console.log("-----------------------------");
    console.log("Push event received:", change);
    console.log("-----------------------------");
    const respond = await sendChangeToLMStudio(change);
    storeResponse(respond);
  }

  eventEmitter.emit("webhookReceived", { eventType, payload });

  return NextResponse.json({ message: "Webhook received", data: payload, eventType });
};

const storeResponse = (response: any) => {
  const { data, change } = response;
  const lmResponse = data.choices[0].message.content;
  const date = new Date();
  const dateString = date.toISOString().replace(/[:.]/g, "-").split("T")[0];
  const timeString = date.toTimeString().slice(0, 8).replace(/:/g, "-");
  saveReviewToMarkdown(lmResponse, "data/response", dateString, timeString);
  saveGitChanges(JSON.stringify(change), "data/commits", dateString, timeString);
};

const sendChangeToLMStudio = async (change: any) => {
  const url = "http://127.0.0.1:1234/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen2.5-coder-7b-instruct",
      messages: [
        {
          role: "system",
          content: `You are a meticulous and helpful AI coding assistant that performs code reviews on software projects.

You are given the result of a git diff-style update in JSON format via JSON.stringify(). The JSON object contains two keys: before and after. Each key holds a list of file states. Each file object includes:
- type: whether the file was modified, added, or removed (before modified, after modified, before removed, after removed, etc.)
- path: the full file path
- content: the full content of the file at that stage

Your job is to:
- Review only source code files (e.g., .py, .js, .ts, .cpp, .c, .java, etc.)
- Ignore non-code files (e.g., .md, .txt, .jpg, .png, .pdf, etc.)
- Compare the before and after versions of each code file
- Identify and explain any issues, such as:
  - Bugs or logical mistakes
  - Bad practices or code smells
  - Missing comments or unclear code
  - Style or formatting inconsistencies
  - Opportunities for improvement or simplification
- Be constructive and concise in your feedback
- Format your response in clear bullet points or paragraphs per file

Your response should help developers understand what was changed and whether anything could be improved or fixed.`,
        },
        {
          role: "user",
          content: `What is the difference between these two code snippets? It's under JSON.stringify() format.
          ${JSON.stringify(change)}`,
        },
      ],
    }),
  });

  const data = await response.json();
  return { data, change };
};

// This is for fetching before after change of a commit/push
const fetchBeforeAfterChange = async (payload: any) => {
  const afterHead = payload.after || "";
  const beforeHead = payload.before || "";
  const addedFiles = payload.head_commit?.added || [];
  const modifiedFiles = payload.head_commit?.modified || [];
  const removedFiles = payload.head_commit?.removed || [];

  const after_url = `https://api.github.com/repos/lamnguyendnvncn/dummy_repo/contents?ref=${afterHead}`;
  const before_url = `https://api.github.com/repos/lamnguyendnvncn/dummy_repo/contents?ref=${beforeHead}`;

  const after_response = await fetch(after_url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  const before_response = await fetch(before_url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!after_response.ok || !before_response.ok) {
    return { error: "Failed to fetch repo info" };
  }

  const after_data = await after_response.json();
  const before_data = await before_response.json();

  const after_data_info = [];

  for (const data of after_data) {
    if (addedFiles.includes(data.name)) {
      const data_text = await fetch(data.download_url, {
        headers: {
          Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }).then((res) => res.text());
      after_data_info.push({
        type: "after added",
        path: data.path,
        content: data_text,
      });
    } else if (modifiedFiles.includes(data.name)) {
      const data_text = await fetch(data.download_url, {
        headers: {
          Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }).then((res) => res.text());
      after_data_info.push({
        type: "after modified",
        path: data.path,
        content: data_text,
      });
    } else if (!modifiedFiles.includes(data.name) && !addedFiles.includes(data.name)) {
      after_data_info.push({
        type: "after removed",
        path: data.path,
      });
    }
  }

  const before_data_info = [];

  for (const data of before_data) {
    if (removedFiles.includes(data.name)) {
      const data_text = await fetch(data.download_url, {
        headers: {
          Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }).then((res) => res.text());
      before_data_info.push({
        type: "before removed",
        path: data.path,
        content: data_text,
      });
    } else if (modifiedFiles.includes(data.name)) {
      const data_text = await fetch(data.download_url, {
        headers: {
          Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }).then((res) => res.text());
      before_data_info.push({
        type: "before modified",
        path: data.path,
        content: data_text,
      });
    } else if (addedFiles.includes(data.name)) {
      const data_text = await fetch(data.download_url, {
        headers: {
          Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }).then((res) => res.text());
      before_data_info.push({
        type: "before added",
        path: data.path,
        content: data_text,
      });
    }
  }

  return { after: after_data_info, before: before_data_info };
};

const verifySignature = (payload: string, signature: string | null): boolean => {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

export const GET = async (req: NextRequest) => {
  const branchInfo = await fetchBranchInfo();
  const branchNames = branchInfo.map((branch: any) => branch.name);
  const commitInfo = await fetchCommitsInfo(branchNames);
  const pullRequestInfo = await fetchPullRequestsInfo();
  const contributorsInfo = await fetchContributorsInfo();

  const result = {
    commits: commitInfo,
    branches: branchInfo,
    pull_requests: pullRequestInfo,
    contributors: contributorsInfo,
  };
  return NextResponse.json(result);
};

const fetchBranchInfo = async () => {
  const url = `https://api.github.com/repos/lamnguyendnvncn/dummy_repo/branches`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    return { error: "Failed to fetch repo info" };
  }

  return response.json();
};

const fetchCommitsInfo = async (branchNames: string[]) => {
  const allCommits: { [key: string]: any } = {};

  for (const branch of branchNames) {
    const url = `https://api.github.com/repos/lamnguyendnvncn/dummy_repo/commits?sha=${branch}&per_page=1000`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return { error: "Failed to fetch repo's commits" };
    }

    allCommits[branch] = await response.json();
  }

  return allCommits;
};

const fetchPullRequestsInfo = async () => {
  const url = `https://api.github.com/repos/lamnguyendnvncn/dummy_repo/pulls`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    return { error: "Failed to fetch repo info" };
  }

  return response.json();
};

const fetchContributorsInfo = async () => {
  const url = "https://api.github.com/repos/lamnguyendnvncn/dummy_repo/contributors";

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    return { error: "Failed to fetch repo info" };
  }

  return response.json();
};
