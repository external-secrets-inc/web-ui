import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useAuditMock, MockSource } from '@/services/audit/context/AuditMockContext';

/**
 * Toggle component to switch between API and Mock data sources for Audit features.
 * Only intended for use in non-production environments with the 'auditMockToggle' feature flag enabled.
 */
const AuditMockToggle = () => {
  const { mockSource, setMockSource } = useAuditMock();

  const handleValueChange = (value: string) => {
    if (value === 'api' || value === 'mock' || value === 'hooks') {
      setMockSource(value as MockSource);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ToggleGroup
        id="mock-toggle"
        type="single"
        variant="outline"
        size="sm"
        value={mockSource}
        onValueChange={handleValueChange}
        aria-label="Data Source Toggle"
      >
        <Tooltip>
            <ToggleGroupItem value="hooks">
          <TooltipTrigger asChild>
              <div>Hooks</div>
          </TooltipTrigger>
            </ToggleGroupItem>
          <TooltipContent>
            Use the explicitly set mock parameter in the code for each React Query hook's query.
          </TooltipContent>
        </Tooltip>
        <Tooltip>
            <ToggleGroupItem value="api">
          <TooltipTrigger asChild>
              <div>API</div>
          </TooltipTrigger>
            </ToggleGroupItem>
          <TooltipContent>
            Force all hooks to use real API calls, regardless of individual settings.
          </TooltipContent>
        </Tooltip>
        <Tooltip>
            <ToggleGroupItem value="mock">
          <TooltipTrigger asChild>
              <div>Mock</div>
          </TooltipTrigger>
            </ToggleGroupItem>
          <TooltipContent>
            Force all hooks to use mock data, regardless of individual settings.
          </TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </div>
  );
};

export default AuditMockToggle;