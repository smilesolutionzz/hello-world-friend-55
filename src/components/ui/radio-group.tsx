import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, onValueChange, value, ...props }, ref) => {
  const handleItemClick = React.useCallback((itemValue: string) => {
    if (itemValue === value && onValueChange) {
      onValueChange(itemValue);
    }
  }, [value, onValueChange]);

  return (
    <RadioGroupContext.Provider value={{ onItemClick: handleItemClick }}>
      <RadioGroupPrimitive.Root
        className={cn("grid gap-2", className)}
        value={value}
        onValueChange={onValueChange}
        {...props}
        ref={ref}
      />
    </RadioGroupContext.Provider>
  )
})

const RadioGroupContext = React.createContext<{ onItemClick?: (value: string) => void }>({});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, onClick, ...props }, ref) => {
  const { onItemClick } = React.useContext(RadioGroupContext);
  
  const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (props.value) {
      onItemClick?.(props.value as string);
    }
  }, [onClick, onItemClick, props.value]);

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
