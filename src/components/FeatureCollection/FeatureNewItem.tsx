import { cn } from "@/lib/utils"
import { trackAddNewFeatureClicked, trackFeatureCreated } from "@/analytics";
import { FeatureNewItemProps } from "@/components/FeatureCollection/FeatureCollection.interfaces";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  name: z.string().min(1, { message: "Cannot be empty" }),
})

const FeatureNewItem = ({
  colSpan,
  featureType,
  performCreate,
  variant = 'card',
}: FeatureNewItemProps) => {
  const [showForm, setShowForm] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!showForm) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleCancel()
    }

    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleCancel()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("mousedown", handleClickOutside)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showForm])

  const handleAddNewFeatureClick = () => {
    trackAddNewFeatureClicked(featureType);
    setShowForm(true)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      performCreate({ featureName: values.name })
      setShowForm(false)
      form.reset()
      trackFeatureCreated(featureType)
    } catch (error) {
      console.error("Failed to create:", error)
    }
  }

  const handleCancel = () => setShowForm(false)

  if (variant === 'row') {
    return showForm ? (
      <TableRow>
        <TableCell colSpan={colSpan}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              ref={formRef}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex flex-1 items-center space-y-0 gap-2">
                    <FormControl>
                      <Input
                        className="w-fit"
                        placeholder={`Name your ${featureType.toLowerCase()}`}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <Button type="button" variant="secondary" size="sm" onClick={handleCancel}>Cancel</Button>
                    <Button type="submit" size="sm">Create</Button>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </TableCell>
      </TableRow>
    ) : (
      <TableRow
        onClick={handleAddNewFeatureClick}
        className="cursor-pointer text-muted-foreground hover:text-foreground"
      >
        <TableCell colSpan={colSpan}>
          <div className="flex items-center h-9 sticky left-2 w-fit">
            <PlusIcon className="inline-block mr-2" />
            New {featureType}
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Card
      className={cn(
        showForm
          ? "border-solid"
          : "p-4 border-2 hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:bg-muted/15 border-dashed shadow-none light transition-all",
      )}
      onClick={!showForm ? handleAddNewFeatureClick : undefined}
    >
      {showForm ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="h-full flex flex-col"
            ref={formRef}
          >
            <CardHeader className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name your {featureType.toLowerCase()}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Name your ${featureType.toLowerCase()}`}
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardHeader>
            <CardFooter className="flex justify-between gap-2 p-6 pt-0 mt-auto">
              <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
              <Button type="submit">Create</Button>
            </CardFooter>
          </form>
        </Form>
      ) : (
        <div className="flex h-full items-center justify-center">
          <PlusIcon className="inline-block mr-2" />
          New {featureType}
        </div>
      )}
    </Card>
  );
}

export default FeatureNewItem;