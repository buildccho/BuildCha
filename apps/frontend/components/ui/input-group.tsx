"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AlignOption = "inline-start" | "inline-end" | "block-start" | "block-end";

const alignClassNames: Record<AlignOption, string> = {
  "inline-start": "",
  "inline-end": "ml-auto",
  "block-start": "flex-col items-start gap-2",
  "block-end": "ml-auto flex-col items-start justify-end gap-2",
};

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="input-group"
      className={cn(
        "group/input-group flex min-w-0 items-stretch gap-px rounded-2xl border border-input bg-background p-2 text-sm shadow-xs transition-[border-color,box-shadow]",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40",
        className,
      )}
      {...props}
    />
  );
});
InputGroup.displayName = "InputGroup";

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: AlignOption;
  }
>(({ className, align = "inline-start", ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex shrink-0 items-center gap-2 px-1",
        alignClassNames[align],
        className,
      )}
      {...props}
    />
  );
});
InputGroupAddon.displayName = "InputGroupAddon";

type InputGroupButtonProps = React.ComponentProps<typeof Button>;

function InputGroupButton({ className, ...props }: InputGroupButtonProps) {
  return (
    <Button
      data-slot="input-group-button"
      className={cn("rounded-xl", className)}
      {...props}
    />
  );
}

type InputGroupTextProps = React.HTMLAttributes<HTMLSpanElement>;

const InputGroupText = React.forwardRef<HTMLSpanElement, InputGroupTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="input-group-text"
        className={cn(
          "text-muted-foreground inline-flex items-center whitespace-nowrap rounded-lg bg-muted/80 px-3 py-1 text-xs font-medium",
          className,
        )}
        {...props}
      />
    );
  },
);
InputGroupText.displayName = "InputGroupText";

type InputGroupInputProps = React.ComponentProps<typeof Input>;

function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "border-0 bg-transparent px-3 py-2 text-base shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

type InputGroupTextareaProps = React.ComponentProps<typeof Textarea>;

function InputGroupTextarea({ className, ...props }: InputGroupTextareaProps) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "border-0 bg-transparent px-3 py-2 text-base shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
