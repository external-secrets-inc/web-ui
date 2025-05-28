import { Button } from "@/components/ui/button";
import { LucideLoader } from "lucide-react";
import { ReactNode, RefObject } from "react";

interface AuthCommonSubmitButtonProps {
  isLoading: boolean;
  text: ReactNode;
  className?: string;
  buttonRef?: RefObject<HTMLButtonElement>;
  disabled?: boolean;
  onClick?: () => void;
  tabIndex?: number;
}

export function AuthCommonSubmitButton({
  isLoading,
  text,
  className = "",
  buttonRef,
  disabled = false,
  onClick,
  tabIndex,
}: AuthCommonSubmitButtonProps) {
  return (
    <Button
      ref={buttonRef}
      type={onClick ? "button" : "submit"}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`
        grid [&>*]:row-start-1 [&>*]:column-start-1 place-items-center
        ${className}
      `}
      tabIndex={tabIndex}
    >
      <span className={isLoading ? "invisible [grid-area:1/1]" : ""}>
        {text}
      </span>
      {isLoading && <LucideLoader className="animate-spin [grid-area:1/1]" />}
    </Button>
  );
}
