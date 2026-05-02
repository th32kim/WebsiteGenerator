'use client'
import PlaygroundHeader from "../_components/PlaygroundHeader"
import ChatSection from "../_components/ChatSection"
import WebsiteDesign from "../_components/WebsiteDesign"
import { useParams, useSearchParams } from "next/navigation"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

/** Prevents duplicate auto-send when React Strict Mode runs effects twice in dev. */
const autoSentInitialPromptKeys = new Set<string>()

export type Frame = {
    projectId: string,
    frameId: string,
    designCode:string,
    chatMessages:Messages[]
}

export type Messages={
    role:string,
    content:string
}

const SYSTEM_PROMPT = `userInput: {userInput}

Instructions:

1. If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code"), then:

- Generate a complete HTML Tailwind CSS code using Flowbite UI components.
- Use a modern design with **blue as the primary color theme**.
- Only include the <body> content (do not add <head> or <title>).
- Make it fully responsive for all screen sizes.
- All primary components must match the theme color.

- Add proper padding and margin for each element.
- Components should be independent; do not connect them.
- Use placeholders for all images (must be stable hotlink-friendly URLs):
  - Light mode: https://picsum.photos/seed/saaslight/1200/800
  - Dark mode: https://picsum.photos/seed/saasdark/1200/800
  - Add alt tag describing the image prompt.

- Use the following libraries/components where appropriate:
  - FontAwesome icons (fa fa-)
  - Flowbite UI components: buttons, modals, forms, tables, tabs, alerts, cards, dialogs, dropdowns, accordions, etc.
  - Chart.js for charts & graphs
  - Swiper.js for sliders/carousels
  - Tippy.js for tooltips & popovers

- Include interactive components like modals, dropdowns, and accordions.
- Ensure proper spacing, alignment, hierarchy, and theme consistency.
- Ensure charts are visually appealing and match the theme color.
- Header menu options should be spread out and not connected.
- Do not include broken links.
- Do not add any extra text before or after the HTML code.

**Quality & layout (must follow to avoid broken UIs):**
- Wrap main content in a centered column: e.g. outer \`max-w-md w-full mx-auto px-4 py-8\` (or \`max-w-lg\` for wider forms). Avoid orphan links floating with \`absolute\` or \`float\` unless inside a clear header bar.
- Forms: stack label → input vertically. Every input must have a real \`<label for="id">\` matching \`input id\`. The password field label must describe the field (e.g. "Password"), never use "Show password" as the field label—use a separate checkbox or button for show/hide.
- Text and links: put normal spaces between words and between inline links (e.g. "Terms of Service and Privacy Policy" with spaces; never concatenate words like "Serviceand").
- Secondary actions (e.g. "Sign in"): place in a dedicated row below the primary button, or use \`flex justify-between items-center\` on a single header row—do not push links to the far edge of the viewport away from the form column.
- Prefer flex/grid with gap utilities (\`gap-4\`, \`space-y-4\`) over manual margins that break alignment.
- Use semantic HTML (\`main\`, \`section\`, \`form\`, \`button type="submit"\` for primary actions).

2. If the user input is **generate text or greetings** (e.g., "Hi", "Hello", "How are you?") **or does not explicitly ask to generate code**, then:

- Respond with a simple, friendly text message instead of generating any code.

Example:

- User: "Hi" → Response: "Hello! How can I help you today?"
- User: "Build a responsive landing page with Tailwind CSS" → Response: [generate full HTML code as per instructions above]`;

/** Strip markdown fences while the model is still streaming (partial response). */
function extractStreamingPreview(raw: string): string {
  let s = raw;
  s = s.replace(/^```[a-z]*\s*/i, "");
  s = s.replace(/```\s*$/g, "");
  return s;
}

function PlayGround() {
    const params = useParams();
    const searchParams = useSearchParams();
    const projectIdRaw = params.projectId;
    const projectId = Array.isArray(projectIdRaw)
      ? projectIdRaw[0]
      : projectIdRaw;
    const frameId = searchParams.get("frameId");

    const [frameDetails, setFrameDetails] = useState<Frame>();
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Messages[]>([]);
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [streamingPreview, setStreamingPreview] = useState<string>('');
    const [rateLimitUntil, setRateLimitUntil] = useState<number>(0);
    const sendMessageRef = useRef<(input: string) => void>(() => {});
    const pendingStreamRef = useRef<string>('');
    const streamRafRef = useRef<number | null>(null);

    const cancelStreamRaf = () => {
      if (streamRafRef.current != null) {
        cancelAnimationFrame(streamRafRef.current);
        streamRafRef.current = null;
      }
    };

    const scheduleStreamingPreview = () => {
      if (streamRafRef.current != null) return;
      streamRafRef.current = requestAnimationFrame(() => {
        streamRafRef.current = null;
        setStreamingPreview(extractStreamingPreview(pendingStreamRef.current));
      });
    };

    useEffect(() => {
        if (!frameId || !projectId) return;

        const autoKey = `${projectId}:${frameId}`;

        const getFrameDetails = async () => {
            try {
                const result = await axios.get(
                    `/api/frames?frameId=${encodeURIComponent(frameId)}&projectId=${encodeURIComponent(projectId)}`
                );
                console.log(result.data);
                setFrameDetails(result.data);
                const designCode = result.data?.designCode;
                if (typeof designCode === "string" && designCode.length > 0) {
                    const fenceIdx = designCode.indexOf("```html");
                    
                    if (fenceIdx >= 0) {
                        const after = designCode.slice(fenceIdx + 7);
                        const endFence = after.indexOf("```");
                        setGeneratedCode(
                            endFence >= 0
                                ? after.slice(0, endFence).trim()
                                : after.trim()
                        );
                    } else {
                        setGeneratedCode(designCode);
                    }
                }
                
                if (result.data?.chatMessages?.length === 1) {
                    if (autoSentInitialPromptKeys.has(autoKey)) return;
                    autoSentInitialPromptKeys.add(autoKey);
                    const userMsg = result.data.chatMessages[0].content as string;
                    sendMessageRef.current(userMsg);
                }else{
                    setMessages(result.data?.chatMessages);
                }
            } catch (e) {
                console.error(e);
            }
        };

        void getFrameDetails();
    }, [frameId, projectId]);

    const sendMessage = async(userInput:string) => {
        if (loading) return;

        if (Date.now() < rateLimitUntil) {
            const waitSeconds = Math.max(1, Math.ceil((rateLimitUntil - Date.now()) / 1000));
            setMessages((prev)=>[
                ...prev,
                { role:'assistant', content:`Rate limited. Please wait ${waitSeconds}s and try again.` }
            ]);
            return;
        }

        cancelStreamRaf();
        pendingStreamRef.current = "";
        setStreamingPreview("");
        setLoading(true);
        setGeneratedCode("");
        setMessages((prev)=>[
            ...prev,
            {role:'user',content:userInput}
        ]);

        let codeToPersist: string | null = null;

        try {
            // Only very short openers skip the API (saves latency / quota). Questions like "how are you?" go to the model.
            const isTinyGreeting = /^(hi|hello|hey|yo|good (morning|afternoon|evening))[\s!.?]*$/i.test(userInput.trim());
            if (isTinyGreeting) {
                setMessages((prev)=>[
                    ...prev,
                    { role: 'assistant', content: 'Hello! How can I help you today?' }
                ]);
                return;
            }

            const result = await fetch('/api/ai-model',{
                method:'POST',
                body:JSON.stringify({
                    messages:[
                        { role:'system', content:SYSTEM_PROMPT },
                        { role:'user', content:userInput }
                    ]})
            });

            if (!result.ok) {
                let apiError = "Unable to generate response right now.";
                if (result.status === 429) {
                    const retryAfterHeader = result.headers.get("retry-after");
                    const retrySeconds = retryAfterHeader ? Number(retryAfterHeader) : 20;
                    const safeRetrySeconds = Number.isFinite(retrySeconds) && retrySeconds > 0 ? retrySeconds : 20;
                    setRateLimitUntil(Date.now() + safeRetrySeconds * 1000);
                }

                try {
                    const errorPayload = await result.json() as { error?: string };
                    if (errorPayload?.error) apiError = errorPayload.error;
                } catch {
                    // Keep default fallback when response is not JSON
                }

                setMessages((prev)=>[
                    ...prev,
                    {role:'assistant',content:`Error: ${apiError}`}
                ]);
                return;
            }

            const reader = result.body?.getReader();
            if (!reader) {
                setMessages((prev)=>[
                    ...prev,
                    {role:'assistant',content:'Error: No response stream was returned.'}
                ]);
                return;
            }

            const decoder = new TextDecoder();
            let aiResponse='';

            while(true){
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, {stream:true});
                aiResponse += chunk;
                pendingStreamRef.current = aiResponse;
                scheduleStreamingPreview();
            }
            aiResponse += decoder.decode();
            pendingStreamRef.current = aiResponse;
            setStreamingPreview(extractStreamingPreview(aiResponse));

            const trimmed = aiResponse.trim();
            const fenceMatch = trimmed.match(/```[a-z]*\s*([\s\S]*?)```/i);
            const extractedCode = fenceMatch?.[1]?.trim();
            const hasMarkup =
                !extractedCode && /<[a-zA-Z][a-zA-Z0-9:-]*(\s|\/?>)/.test(trimmed);

            if (extractedCode || hasMarkup) {
                const code = extractedCode ?? trimmed;
                codeToPersist = code;
                setGeneratedCode(code);
                setMessages((prev)=>[
                    ...prev,
                    {role:'assistant',content:'Your code is ready!'}
                ]);
            } else {
                setMessages((prev)=>[
                    ...prev,
                    {
                        role:'assistant',
                        content:
                            trimmed ||
                            'No text came back from the model (empty stream). Saving chat still works — try sending again or check the AI API / model.',
                    }
                ]);
            }
        } catch (error) {
            console.error(error);   
            setMessages((prev)=>[
                ...prev,
                {role:'assistant',content:'Error: Request failed. Please try again in a moment.'}
            ]);
        } finally {
            cancelStreamRaf();
            setStreamingPreview("");
            setLoading(false);
            if (codeToPersist && frameId && projectId) {
                await SaveGeneratedCode(codeToPersist);
            }
        }
    }

    sendMessageRef.current = sendMessage;

    useEffect(() => {
        if(messages.length>1 && !loading){
            SaveMessages();
        }
    }, [messages]);

    const SaveMessages = async()=>{
        const result = await axios.post('/api/chats',{
            messages:messages,
            frameId:frameId
        });
        console.log(result);
    }

    const SaveGeneratedCode = async(code:string)=>{
        const result = await axios.post('/api/frames',{
            designCode:code,
            frameId:frameId,
            projectId:projectId
        });
        console.log(result.data);
        toast.success('Website is Ready!');
    }

    
  return (
    <div>
        <PlaygroundHeader/>

        <div className="flex">
        {/* Chat Section */}
        <ChatSection messages={messages ?? []} 
            onSend={(userInput:string)=>sendMessage(userInput)}
            loading={loading}/>

        {/* Website Design Section */}
        <WebsiteDesign
          generatedCode={
            loading
              ? streamingPreview ||
                '<div class="flex h-full min-h-[200px] items-center justify-center text-sm text-gray-400">Generating preview…</div>'
              : generatedCode || '<div>No code generated</div>'
          }
          isStreaming={loading}
        />

        {/* Setting Section */}
        {/* <ElementSettingSection/> */}
        </div>
    </div>
  )
}

export default PlayGround