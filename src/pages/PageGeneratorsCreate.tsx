import { LayoutPage } from "@/components/layout";
import { GeneratorCreate } from "@/components/workflows/Generators";

export function PageGeneratorsCreate() {
  return (
    <LayoutPage
      title="New Generator"
      description="Create a new Workflow Generator."
      width="compact"
    >
      <GeneratorCreate />
    </LayoutPage>
  );
}