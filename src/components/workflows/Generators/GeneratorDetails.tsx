import { LayoutPortalHeaderActions } from "@/components/layout";
import { CodeViewerSheet } from "@/components/ui/CodeViewerSheet";
import { DetailsCard } from "@/components/ui/DetailsCard";
import { LucideSquareCode, LucideInfo } from "lucide-react";
import type { GeneratorData } from "./Generators.interfaces";
import { GeneratorStateDataTable } from "./GeneratorStateDataTable";

export function GeneratorDetails({
  generator,
  yamlString,
}: {
  generator: GeneratorData;
  yamlString: string;
}) {
  const detailsFields = [
    ...(generator.status.output && Object.entries(generator.status.output).length > 0
      ? Object.entries(generator.status.output).map(([key, value]) => ({
          label: key,
          value: <span className="font-mono break-all">{value}</span>,
        }))
      : []),
    {
      label: "Kind",
      value: <span className="font-mono">{generator.kind}</span>,
    },
  ];

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
            title="Generator Output"
            fields={detailsFields}
          />

          <GeneratorStateDataTable />
        </div>
      </div>
    </>
  );
}
