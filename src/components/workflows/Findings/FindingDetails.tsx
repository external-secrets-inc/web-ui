import {
  type Finding,
  FindingLocationsTable,
} from "@/components/workflows/Findings";

interface FindingDetailsProps {
  finding: Finding;
}

export function FindingDetails({ finding }: FindingDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Locations</h2>
      <FindingLocationsTable locations={finding.locations} />
    </div>
  );
}
