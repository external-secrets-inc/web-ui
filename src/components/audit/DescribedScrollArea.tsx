import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ReactNode } from "react";
import { Loader } from "@/components/ui/Loader";

interface DescribedScrollAreaProps {
  description: ReactNode;
  content: string;
  isLoadingContent?: boolean;
}

function DescribedScrollArea({ description, content, isLoadingContent }: DescribedScrollAreaProps) {
  return (
    <>
      <p className="text-muted-foreground text-sm mb-2">
        {description}
      </p>
      <ScrollArea className='rounded-lg border'>
        <pre>
          <code className="flex flex-col">
            {isLoadingContent ? <Loader className="self-center"/> : <span>{content}</span>}
          </code>
        </pre>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
    </>
  )
}

export default DescribedScrollArea;
