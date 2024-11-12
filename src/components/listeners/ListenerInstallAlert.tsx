import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LucideInfo } from "lucide-react"
import { ReactNode } from 'react'

interface ListenerInstallAlertPropsBase {
  description: ReactNode;
}

interface ListenerInstallAlertWithWarning extends ListenerInstallAlertPropsBase {
  warning: true;
  title: ReactNode; // required when warning is true
}

interface ListenerInstallAlertWithoutWarning extends ListenerInstallAlertPropsBase {
  warning?: false;
  title?: ReactNode; // optional when warning is false or undefined
}

type ListenerInstallAlertProps = ListenerInstallAlertWithWarning | ListenerInstallAlertWithoutWarning;

function ListenerInstallAlert({ warning = false, title = '', description }: ListenerInstallAlertProps) {
  if (warning) {
    const defaultTitle = 'Warning'
    return (
      <Alert
        variant="warning"
        className="mt-4"
      >
        <AlertTitle className="flex gap-2 items-center">
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

export default ListenerInstallAlert;
