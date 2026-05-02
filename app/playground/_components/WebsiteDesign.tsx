import React, { useCallback, useEffect, useRef, useState } from "react";
import WebPageTool from "./WebPageTool";

type Props = {
  generatedCode: string;
  /** True while the model is streaming; shows a small live indicator without changing injection logic. */
  isStreaming?: boolean;
};

const HTML_CODE = `<!DOCTYPE html>
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
  const [selectedScreenSize, setSelectedScreenSize] = useState('web');
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

  //For user selecting parts of the ui
  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    let hoverEl: HTMLElement | null = null;
    let selectedEl: HTMLElement | null = null;
  
    const handleMouseOver = (e: MouseEvent) => {
      if (selectedEl) return;
      const target = e.target as HTMLElement;
      if (hoverEl && hoverEl !== target) {
        hoverEl.style.outline = "";
      }
      hoverEl = target;
      hoverEl.style.outline = "2px dotted blue";
    };
  
    const handleMouseOut = (e: MouseEvent) => {
      if (selectedEl) return;
      if (hoverEl) {
        hoverEl.style.outline = "";
        hoverEl = null;
      }
    };
  
    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
  
      if (selectedEl && selectedEl !== target) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
      }
  
      selectedEl = target;
      selectedEl.style.outline = "2px solid red";
      selectedEl.setAttribute("contenteditable", "true");
      selectedEl.focus();
      console.log("Selected element:", selectedEl);
    };
  
    const handleBlur = () => {
      if (selectedEl) {
        console.log("Final edited element:", selectedEl.outerHTML);
      }
    };
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedEl) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
        selectedEl.removeEventListener("blur", handleBlur);
        selectedEl = null;
      }
    };
  
    doc.body?.addEventListener("mouseover", handleMouseOver);
    doc.body?.addEventListener("mouseout", handleMouseOut);
    doc.body?.addEventListener("click", handleClick);
    doc?.addEventListener("keydown", handleKeyDown);
  
    // Cleanup on unmount
    return () => {
      doc.body?.removeEventListener("mouseover", handleMouseOver);
      doc.body?.removeEventListener("mouseout", handleMouseOut);
      doc.body?.removeEventListener("click", handleClick);
      doc?.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="p-5 w-full flex items-center flex-col">
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
        className={`${selectedScreenSize == 'web' ? 'w-full' : 'w-130'} h-[600px] border-2 rounded-xl`}
        srcDoc={HTML_CODE}
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => injectGenerated(codeRef.current)}
      />
      <WebPageTool selectedScreenSize={selectedScreenSize} setSelectedScreenSize={(v:string)=>setSelectedScreenSize(v)} generatedCode={generatedCode}/>
    </div>
  );
}

export default WebsiteDesign;
