import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";

export function ShowRegisteredAgent({ id, agentName, enabled, currentStatus, tags }) {
  return (
    <Card>
      <CardHeader className="text-left">
        <CardTitle className="flex" >
          <div className="grow">{agentName}
          </div> <div>{currentStatus}</div></CardTitle>
        <div className="text-sm text-slate-500"> {id} </div>
      </CardHeader>
    </Card>
  )
}
