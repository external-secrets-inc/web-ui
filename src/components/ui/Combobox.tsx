// Inspired by https://ui.shadcn.com/docs/components/combobox which is not installable

import * as React from "react"
import { LucideCheck } from "lucide-react"
import { CaretSortIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxItem {
  value: string
  label: string
}

export interface ComboboxProps {
  items: ComboboxItem[]
  value?: string
  onSelect?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

const Combobox = React.forwardRef<
  React.ElementRef<typeof Button>,
  ComboboxProps
>(({
  items,
  value,
  onSelect,
  placeholder = "Select an item...",
  searchPlaceholder = "Search...",
  emptyText = "No items found.",
  className,
  disabled = false,
}, ref) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full px-3 flex justify-between", className)}
        >
          {value
            ? items.find((item) => item.value === value)?.label
            : placeholder}
          <CaretSortIcon className="ml-auto flex-none opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty className="py-2.5 text-center text-sm">{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onSelect?.(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {item.label}
                  <LucideCheck
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
})
Combobox.displayName = "Combobox"

export { Combobox }


