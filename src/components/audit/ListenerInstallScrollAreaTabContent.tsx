import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TabsContent } from "@/components/ui/tabs"
import { ReactNode } from "react";

interface ListenerInstallScrollAreaTabContentProps {
  children?: ReactNode;
  value: string;
  description: ReactNode;
  scrollContent: string;
}

function ListenerInstallScrollAreaTabContent({ children, value, description, scrollContent }: ListenerInstallScrollAreaTabContentProps) {
  return (
    <TabsContent className="data-[state=active]:grid min-h-0" value={value}>
      <p className="text-muted-foreground text-sm mb-2">
        {description}
      </p>
      <ScrollArea className='rounded-lg border'>
        <pre>
          <code className="flex flex-col">
            <span>{scrollContent}</span>
          </code>
        </pre>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
      {children}
    </TabsContent>
  )
}

export default ListenerInstallScrollAreaTabContent;
