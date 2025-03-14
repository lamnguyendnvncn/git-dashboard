import { eventEmitter } from "@/utils/eventEmitter";
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

  console.log(`Github Webhook received: ${eventType}`, payload);
  const change = await fetchBeforeAfterChange(payload);
  console.log("-----------------------------");
  console.log("Push event received:", change);

  eventEmitter.emit("webhookReceived", { eventType, payload });

  return NextResponse.json({ message: "Webhook received", data: payload, eventType });
};

// This is for fetching before after change of a commit/push
const fetchBeforeAfterChange = async (payload: any) => {
  const afterHead = payload.after || "";
  const beforeHead = payload.before || "";

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

  const after_data_text = await fetch(after_data[0].download_url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  }).then((res) => res.text());

  const before_data_text = await fetch(before_data[0].download_url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  }).then((res) => res.text());

  return { after: after_data_text, before: before_data_text };
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
    const url = `https://api.github.com/repos/lamnguyendnvncn/dummy_repo/commits?sha=${branch}`;

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
