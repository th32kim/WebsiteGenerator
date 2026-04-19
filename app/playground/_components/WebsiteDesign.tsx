import React, { useCallback, useEffect, useRef } from "react";

type Props = {
  generatedCode: string;
  /** True while the model is streaming; shows a small live indicator without changing injection logic. */
  isStreaming?: boolean;
};

const IFRAME_SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
    <title>AI Website Builder</title>

    <script src="https://cdn.tailwindcss.com"></script>

    <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.11.2/lottie.min.js"></script>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>

    <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
    <script src="https://unpkg.com/@popperjs/core@2"></script>
    <script src="https://unpkg.com/tippy.js@6"></script>
</head>
<body id="root"></body>
</html>`;

function stripMarkdownFences(code: string): string {
  return code.replaceAll("```html", "").replaceAll("```", "").trim();
}

function WebsiteDesign({ generatedCode, isStreaming = false }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** Always inject latest HTML on iframe load (avoids stale closure if code arrived before load). */
  const codeRef = useRef(generatedCode);
  codeRef.current = generatedCode;

  const injectGenerated = useCallback((code: string) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const root = doc.getElementById("root");
    if (root) {
      root.innerHTML = code ? stripMarkdownFences(code) : "";
    }
  }, []);

  useEffect(() => {
    injectGenerated(generatedCode);
  }, [generatedCode, injectGenerated]);

  return (
    <div className="relative flex-1 overflow-auto p-5">
      {isStreaming ? (
        <div
          className="pointer-events-none absolute right-7 top-7 z-10 rounded-full bg-blue-600/90 px-3 py-1 text-xs font-medium text-white shadow"
          aria-live="polite"
        >
          Live preview
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        title="Website preview"
        className="h-[min(91vh,800px)] min-h-[480px] w-full rounded-lg border bg-white"
        srcDoc={IFRAME_SHELL}
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => injectGenerated(codeRef.current)}
      />
    </div>
  );
}

export default WebsiteDesign;
