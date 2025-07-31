import {
  GeneratorData,
} from "./Generators.interfaces";
import { GeneratorStateDataTable } from "./GeneratorStateDataTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CodeTextarea } from "@/components/ui/CodeTextarea";

export function GeneratorDetails({
  generator,
  yamlString,
}: {
  generator: GeneratorData;
  yamlString: string;
}) {
  return (
    <div>
      <div className="mb-4">
        <Accordion className="mb-4" type="single" collapsible>
          <AccordionItem value="details" className="space-y-4 text-sm">
            <AccordionTrigger className="font-bold text-base">
              Details
            </AccordionTrigger>
            <AccordionContent>
              {generator.status.output && Object.entries(generator.status.output).length > 0 ? (
                Object.entries(generator.status.output).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <div className="font-semibold mb-2">{key}</div>
                    <div className="text-muted-foreground pl-4 border-l py-2 ml-4">
                      {value}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">
                  No output defined
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="manifest">
            <AccordionTrigger className="font-bold text-base">
              Manifest Spec
            </AccordionTrigger>
            <AccordionContent>
              <CodeTextarea
                className="max-h-72 !overflow-auto"
                language="yaml"
                value={yamlString}
                disabled
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <GeneratorStateDataTable />
      </div>
    </div>
  );
}
