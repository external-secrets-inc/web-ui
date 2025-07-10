import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import useOrgLink from "@/hooks/useOrgLink";
import {
  type Finding,
  type WorkflowTemplateCandidate,
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

      <h2 className="text-xl font-semibold tracking-tight mt-6">
        Workflow Template Candidates
      </h2>
      <div className="flex flex-col gap-2">
        {finding.workflowTemplateCandidates?.map((candidate, index) => (
          <WorkflowCandidateItem key={index} candidate={candidate} />
        )) || <p>No workflow template candidates found.</p>}
      </div>
    </div>
  );
}

function WorkflowCandidateItem({
  candidate,
}: {
  candidate: WorkflowTemplateCandidate;
}) {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  const goToTemplate = () => {
    navigate(
      getOrgLink(
        `/workflows/templates/${candidate.namespace}/${candidate.name}`
      )
    );
  };
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      <div>
        <p className="font-semibold">{candidate.name}</p>
      </div>
      <Button variant="outline" size="sm" onClick={goToTemplate}>
        Preview Template
      </Button>
    </div>
  );
}
