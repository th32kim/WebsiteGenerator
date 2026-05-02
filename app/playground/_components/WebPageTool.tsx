'use client'
import { Code2Icon, Download, Monitor, SquareArrowOutUpRight, TabletSmartphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import ViewCodeBlock from './ViewCodeBlock'

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
<body id="root">{code}</body>
</html>`;

export default function WebPageTool({selectedScreenSize, setSelectedScreenSize, generatedCode}:any) {

    const [finalCode, setFinalCode] = useState<string>();

    useEffect(()=>{
        const cleanCode = (HTML_CODE.replace('{code}',generatedCode)||'')
        .replaceAll("```html",'')
        .replace('```','')
        .replace('html','')

        setFinalCode(cleanCode);
    },[generatedCode])

    const ViewInNewTab = () => {
        if(!finalCode) return;


        const blob = new Blob([finalCode ?? ''], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        window.open(url, '_blank');
    }

    const downloadCode = () => {
        const blob = new Blob([finalCode ?? ''], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return (
    <div className='p-2 shadow rounded-xl w-full flex items-center justify-between'>
        <div className='flex gap-2'>
            <Button variant={'ghost'} 
            className={`${selectedScreenSize == 'web' ? 'border border-primary':null}`}
            onClick={()=>setSelectedScreenSize('web')}><Monitor/></Button>
            <Button variant={'ghost'} 
            className={`${selectedScreenSize == 'mobile' ? 'border border-primary':null}`}
            onClick={()=>setSelectedScreenSize('mobile')}><TabletSmartphone/></Button>
        </div>

        <div className='flex gap-2'>
            <Button variant={'outline'} onClick={()=>ViewInNewTab()}>View <SquareArrowOutUpRight/></Button>
            <ViewCodeBlock code={finalCode}>
                <Button>Code <Code2Icon/></Button>
            </ViewCodeBlock>
            
            <Button onClick={downloadCode}>Download <Download/></Button>
        </div>
    </div>
    )
}
