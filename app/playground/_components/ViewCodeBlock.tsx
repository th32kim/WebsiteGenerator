import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Copy } from "lucide-react";
  import SyntaxHighlighter from "react-syntax-highlighter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function ViewCodeBlock({children, code}:any) {

    const handleCopy = async() => {
        await navigator.clipboard.writeText(code);
        toast.success('Code Copied!')
    }
  return (
    <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="min-w-5xl max-h-[600px] overflow-auto">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex gap-4 items-center">
                            Source Code <span><Button onClick={handleCopy}><Copy/></Button></span>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Preview of the generated HTML source.
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <SyntaxHighlighter language="html">
                        {code}
                    </SyntaxHighlighter>
                </div>
            </DialogContent>
    </Dialog>
  )
}

export default ViewCodeBlock