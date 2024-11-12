import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LucideInfo, LucideAlertCircle } from "lucide-react"
import { ReactNode } from 'react'

interface AuditAlertPropsBase {
  description: ReactNode;
}

interface AuditAlertWithWarning extends AuditAlertPropsBase {
  warning: true;
  title: ReactNode; // required when warning is true
}

interface AuditAlertWithoutWarning extends AuditAlertPropsBase {
  warning?: false;
  title?: ReactNode; // optional when warning is false or undefined
}

type AuditAlertProps = AuditAlertWithWarning | AuditAlertWithoutWarning;

function AuditAlert({ warning = false, title = '', description }: AuditAlertProps) {
  if (warning) {
    const defaultTitle = 'Warning'
    return (
      <Alert
        variant="warning"
        className="mt-4"
      >
        <AlertTitle className="flex gap-2 items-center">
          <LucideAlertCircle className="text-orange-500" />
          {title || defaultTitle}
        </AlertTitle>
        <AlertDescription>
          {description}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mt-4">
      <AlertDescription className="flex gap-2 items-center">
        <LucideInfo className="flex-none" />
        {description}
      </AlertDescription>
    </Alert>
  )
}

export default AuditAlert;
