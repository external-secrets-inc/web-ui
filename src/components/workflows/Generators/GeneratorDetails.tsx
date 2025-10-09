import { LayoutPortalHeaderActions } from "@/components/layout";
import { CodeViewerSheet } from "@/components/ui/CodeViewerSheet";
import { DetailsCard } from "@/components/ui/DetailsCard";
import { LucideSquareCode, LucideInfo, LucideFileOutput } from "lucide-react";
import type { GeneratorData } from "./Generators.interfaces";
import { GeneratorStateDataTable } from "./GeneratorStateDataTable";

export function GeneratorDetails({
  generator,
  yamlString,
}: {
  generator: GeneratorData;
  yamlString: string;
}) {
  const outputFields =
    generator.status.output && Object.entries(generator.status.output).length > 0
      ? Object.entries(generator.status.output).map(([key, value]) => ({
          label: key,
          value,
        }))
      : [];

  return (
    <>
      <LayoutPortalHeaderActions>
        <CodeViewerSheet
          code={yamlString}
          language="yaml"
          title="Manifest Spec"
          icon={<LucideSquareCode />}
          triggerLabel="View Manifest Spec"
          triggerIcon={<LucideSquareCode />}
          triggerVariant="secondary"
        />
      </LayoutPortalHeaderActions>

      <div>
        <div className="space-y-6">
          <DetailsCard
            icon={LucideInfo}
            title="Generator Details"
            fields={[
              {
                label: "Kind",
                value: generator.kind,
              },
            ]}
            sections={
              outputFields.length > 0
                ? [
                    {
                      title: "Output",
                      icon: LucideFileOutput,
                      fields: outputFields,
                    },
                  ]
                : undefined
            }
          />

          <GeneratorStateDataTable />
        </div>
      </div>
    </>
  );
}
