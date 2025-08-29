import {
  type Finding,
  FindingLocationsTable,
} from "@/components/workflows/Findings";
import { Consumer } from "../Consumers/Consumers.interfaces";
import { ConsumerDataTable } from "../Consumers";

interface FindingDetailsProps {
  finding: Finding;
  consumers: Consumer[];
}

export function FindingDetails({ finding, consumers }: FindingDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Locations</h2>
      <FindingLocationsTable locations={finding.locations} />
      <ConsumerDataTable consumers={consumers} title="Consumers"/>
    </div>
  );
}
