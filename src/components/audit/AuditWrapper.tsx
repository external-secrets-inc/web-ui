import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { LucideGem } from 'lucide-react';
import Audit from './Audit';
import { AuditMockProvider, useAuditMock } from '@/services/audit/context/AuditMockContext';
import { AuditFilterProvider } from "./AuditFilterProvider";
import { useSubscription } from "@/context/SubscriptionContext";
import { Loader } from "@/components/ui/Loader";

const MockControls = () => {
  const { mockSource, setMockSource } = useAuditMock();

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium">Data Source:</span>
      <Select
        value={mockSource}
        onValueChange={setMockSource}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hooks">Use Hook Parameter</SelectItem>
          <SelectItem value="mock">Use Mock Data</SelectItem>
          <SelectItem value="api">Use Real API</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

const AuditWrapper = () => {
  const { hasFeature, isLoading: isLoadingSubscriptions } = useSubscription();
  const hasAccess = hasFeature('Listener Component');

  if (isLoadingSubscriptions) {
    return <Loader size="lg" className="flex-1 self-center" />
  }

  if (!hasAccess) {
    return (
      <Alert className='border-emerald-500'>
        <AlertTitle className='flex items-center gap-2'> <LucideGem className='text-amber-500'/>Premium Feature</AlertTitle>
        <AlertDescription>
          <p><strong>Audit</strong> is only available as a premium custom subscription.</p>
          <p>Contact support to learn more about it and get a quote!</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <AuditMockProvider>
      <div className="space-y-4">
        <MockControls />
        <AuditFilterProvider>
          <Audit />
        </AuditFilterProvider>
      </div>
    </AuditMockProvider>
  );
};

export default AuditWrapper;
