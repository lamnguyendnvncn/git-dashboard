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

  switch (eventType) {
    case "push":
      console.log("Push event received:", payload);
      break;
    case "pull_request":
      console.log("Pull request event received:", payload);
      break;
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return NextResponse.json({ message: "Webhook received" });
};

const verifySignature = (payload: string, signature: string | null): boolean => {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

export const GET = async (req: NextRequest) => {
  const commitInfo = await fetchCommitsInfo();

  const result = {
    commits: commitInfo,
  };
  return NextResponse.json(result);
};

const fetchCommitsInfo = async () => {
  const url = `https://api.github.com/repos/lamnguyendnvncn/dummy_repo/commits`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    return { error: "Failed to fetch repo's commits" };
  }

  return response.json();
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
