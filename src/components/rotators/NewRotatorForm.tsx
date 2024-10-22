import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { CardFooter, CardHeader } from "../ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useRef } from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { NewFeatureFormProps } from "@/components/FeatureList/FeatureList.interfaces"

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Cannot be empty",
  }),
})

type FormSchemaType = z.infer<typeof formSchema>


export function NewRotatorForm({ performCreate, onSuccess, onCancel }: NewFeatureFormProps) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onCancel()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("mousedown", handleClickOutside)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onCancel])

  async function handleCreateRotator(values: FormSchemaType) {
    try {
      performCreate({featureName: values.name})
      onSuccess();
    } catch (error) {
      console.error("Failed to create rotator:", error);
    }
  }

  return (
    <div
      className="flex flex-col h-full"
      ref={formRef}
    >
      <Form {...form}>
        <CardHeader>
          <form
            id="new-rotator-form"
            autoComplete="off"
            onSubmit={form.handleSubmit(handleCreateRotator)}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name your async rotator</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="New Async Rotator"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </CardHeader>

        <CardFooter className="flex justify-between flex-1 items-end">
          <Button
            type="button"
            aria-keyshortcuts="Escape"
            variant={"secondary"}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-rotator-form"
          >
            Create
          </Button>
        </CardFooter>
      </Form>
    </div>
  )
}