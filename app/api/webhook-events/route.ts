import { eventEmitter } from "@/utils/eventEmitter";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      eventEmitter.on("webhookReceived", sendEvent);

      req.signal.addEventListener("abort", () => {
        eventEmitter.off("webhookReceived", sendEvent);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
