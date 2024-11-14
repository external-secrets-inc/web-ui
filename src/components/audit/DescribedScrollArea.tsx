import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ReactNode } from "react";

interface DescribedScrollAreaProps {
  description: ReactNode;
  content: string;
}

function DescribedScrollArea({ description, content }: DescribedScrollAreaProps) {
  return (
    <>
      <p className="text-muted-foreground text-sm mb-2">
        {description}
      </p>
      <ScrollArea className='rounded-lg border'>
        <pre>
          <code className="flex flex-col">
            <span>{content}</span>
          </code>
        </pre>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
    </>
  )
}

export default DescribedScrollArea;
