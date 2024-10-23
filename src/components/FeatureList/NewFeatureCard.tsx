import { trackAddNewFeatureClicked, trackFeatureCreated } from "@/analytics";
import { NewFeatureCardProps, NewFeatureFormProps } from "@/components/FeatureList/FeatureList.interfaces";
import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

const NewFeatureCard = <T extends NewFeatureFormProps>({ featureName, performCreate, Form, formProps }: NewFeatureCardProps<T>) => {
  const [showForm, setShowForm] = useState(false)

  const defaultFormProps = {
    ...formProps,
    onCancel: () => setShowForm(false),
    onSuccess: () => {
      setShowForm(false)
      trackFeatureCreated(featureName)
    },
    performCreate: performCreate
  };


  const handleAddNewFeatureClick = () => {
    trackAddNewFeatureClicked(featureName);
    setShowForm(true)
  }
  return (
    <Card
      className={
        showForm
          ? "border-solid"
          : "p-4 border-2 hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:bg-muted/15 border-dashed shadow-none light transition-all"
      }
      onClick={!showForm ? handleAddNewFeatureClick : undefined}
    >
      {showForm ? (
        <Form {...(defaultFormProps as T)}/>
      ) : (
        <div className="flex h-full items-center justify-center">
          <PlusIcon className="inline-block mr-2" />
          New {featureName}
        </div>
      )}
    </Card>
  );
}

export default NewFeatureCard;