import { cn } from "@/lib/utils";
import React from "react";

interface ColorfulTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  as?: React.ElementType;
}

export default function ColorfulTitle({ title, className, as: Component = "h2", children, ...props }: ColorfulTitleProps) {
  return (
    <Component className={cn("text-section-title uppercase text-primary-pink", className)} {...props}>
      {title}
      {children}
    </Component>
  );
}
