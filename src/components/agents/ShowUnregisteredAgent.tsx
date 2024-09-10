import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

export function ShowUnregisteredAgent({ id, agentName, enabled, currentStatus, tags }) {
  return (
    <Card className="text-left">
      <CardHeader className="text-left">
        <CardTitle >{agentName} </CardTitle>
        <div className="text-sm text-slate-500"> {id} </div>
      </CardHeader>
      <CardContent>
        <div className="font-semibold text-sm mb-3">Copy the YAML Manifest for this agent and apply it to your cluster. This card will update upon activation.</div>
        <div className="text-sm text-slate-500">Waiting for deployment...</div>
      </CardContent>
      {/** Map statuses to icons */}
      <CardFooter className="flex justify-between">
        <Button variant={"secondary"} >
          Cancel
        </Button>
        <Button variant={"outline"} >
          Preview YAML
        </Button>
        <Button >
          Copy YAML
        </Button>
      </CardFooter>
    </Card>
  )
}