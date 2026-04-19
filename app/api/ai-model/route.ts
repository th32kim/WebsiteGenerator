import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

/** Pull assistant text from OpenAI-compatible streaming chunks (OpenRouter + variants). */
function extractStreamText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as Record<string, unknown>;

  if ("error" in d && d.error) {
    const e = d.error;
    if (typeof e === "object" && e && "message" in e) {
      return String((e as { message?: unknown }).message ?? "");
    }
    return String(e);
  }

  const choices = d.choices;
  if (!Array.isArray(choices) || choices.length === 0) return "";

  const choice = choices[0] as Record<string, unknown>;
  const delta = choice.delta as Record<string, unknown> | undefined;
  const message = choice.message as Record<string, unknown> | undefined;

  const raw =
    delta?.content ??
    delta?.text ??
    delta?.reasoning ??
    message?.content;

  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((p) => {
        if (typeof p === "object" && p && p !== null && "text" in p) {
          return String((p as { text?: unknown }).text ?? "");
        }
        return "";
      })
      .join("");
  }
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY_2;
    const model = "nvidia/nemotron-3-super-120b-a12b:free";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY_2 is not set" },
        { status: 500 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages must be a non-empty array" },
        { status: 400 }
      );
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "My Next.js App",
        },
        responseType: "stream",
        timeout: 120000,
      }
    );

    const stream = response.data;
    const encoder = new TextEncoder();

    let isClosed = false;
    let lineBuffer = "";
    let totalChars = 0;

    const readable = new ReadableStream({
      async start(controller) {
        const closeOnce = () => {
          if (isClosed) return;
          try {
            controller.close();
          } catch {
            // ignore
          } finally {
            isClosed = true;
          }
        };

        const errorOnce = (err: unknown) => {
          if (isClosed) return;
          try {
            controller.error(err);
          } catch {
            // ignore
          } finally {
            isClosed = true;
          }
        };

        const processLine = (line: string) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          if (trimmed === "[DONE]" || trimmed === "data: [DONE]") {
            closeOnce();
            return;
          }

          if (!trimmed.startsWith("data:")) return;

          const jsonStr = trimmed.slice(5).trimStart();
          if (!jsonStr || jsonStr === "[DONE]") {
            closeOnce();
            return;
          }

          try {
            const data = JSON.parse(jsonStr) as unknown;
            const text = extractStreamText(data);
            if (text) {
              totalChars += text.length;
              controller.enqueue(encoder.encode(text));
            }
          } catch (err) {
            console.error("ai-model SSE JSON parse error:", err, jsonStr.slice(0, 240));
          }
        };

        const flushLines = (chunk: string) => {
          lineBuffer += chunk.replace(/\r\n/g, "\n");
          let idx: number;
          while ((idx = lineBuffer.indexOf("\n")) >= 0) {
            const line = lineBuffer.slice(0, idx);
            lineBuffer = lineBuffer.slice(idx + 1);
            processLine(line);
          }
        };

        stream.on("data", (chunk: Buffer | string) => {
          if (isClosed) return;
          flushLines(typeof chunk === "string" ? chunk : chunk.toString());
        });

        stream.on("end", () => {
          if (lineBuffer.trim()) {
            for (const line of lineBuffer.split("\n")) {
              processLine(line);
            }
            lineBuffer = "";
          }
          if (process.env.NODE_ENV === "development" && totalChars === 0) {
            console.warn(
              "[ai-model] Stream ended with 0 characters of assistant text. Free models can return empty output; try another model or retry."
            );
          }
          closeOnce();
        });

        stream.on("error", (err: unknown) => {
          console.error("Stream error", err);
          errorOnce(err);
        });
      },
      cancel() {
        isClosed = true;
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const upstreamData = error.response?.data;
      const retryAfter = error.response?.headers?.["retry-after"];

      console.error("OpenRouter API error:", upstreamData ?? error.message);

      return NextResponse.json(
        {
          error:
            (typeof upstreamData === "object" &&
              upstreamData !== null &&
              "error" in upstreamData &&
              typeof (upstreamData as { error?: unknown }).error === "object" &&
              (upstreamData as { error?: { message?: string } }).error?.message) ||
            error.message ||
            "OpenRouter request failed",
        },
        {
          status,
          headers:
            status === 429 && retryAfter
              ? { "Retry-After": String(retryAfter) }
              : undefined,
        }
      );
    }

    console.error("API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
