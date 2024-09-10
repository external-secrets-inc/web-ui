import { Form, Link, redirect } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import axios from "axios"
import { useState } from "react"

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents`
const BEARER_TOKEN = `Bearer ${import.meta.env.VITE_JWT_TOKEN}`

export function NewAgentForm({onSuccess, onCancel}) {
  const [name, setName] = useState('')

  function updateName(e) {
    setName(e.target.value);
  }

  function createAgent() {
    axios.post(URL, {name}, {headers: {Authorization: BEARER_TOKEN}}).then(() => onSuccess())
  }

  return (
    <Card className="hover:cursor-pointer">
      <CardHeader className="text-left">
        <CardTitle className="flex" >
          <div className="grow">New Agent</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form>
          <Label>Name your agent</Label>
          <Input value={name} onChange={updateName}></Input>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant={"secondary"} onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={() => createAgent()}>
          Create
        </Button>
      </CardFooter>
    </Card>
  )
}