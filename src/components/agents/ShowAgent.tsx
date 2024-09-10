import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

function UnregisteredBody({id}) {
  return (
    <div>
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
    </div>
  )
}

function RegisteredBody() {
  return (<></>)
}

export function ShowAgent({ id, agentName, enabled, currentStatus, tags }) {

  return (
    <Card className="text-left">
      <CardHeader className="text-left">
        <CardTitle className="flex" >
          <div className="grow">{agentName}</div>
          <div>{currentStatus}</div>
        </CardTitle>
        <div className="text-sm text-slate-500"> {id} </div>
      </CardHeader>
      {['PENDING_REGISTRATION', 'PROVISIONING'].includes(currentStatus) ? <UnregisteredBody id={id} /> : <RegisteredBody />}
    </Card>
  )
}
