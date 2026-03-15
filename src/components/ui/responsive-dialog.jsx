import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "./drawer";

/**
 * ResponsiveDialog — renders Dialog on desktop, Vaul Drawer on mobile.
 * Same API as Radix Dialog for easy drop-in replacement.
 */
function ResponsiveDialog({ children, ...props }) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? Drawer : Dialog;
  return <Comp {...props}>{children}</Comp>;
}

function ResponsiveDialogContent({ className, children, ...props }) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <DrawerContent className={className} {...props}>
        {children}
      </DrawerContent>
    );
  }
  return (
    <DialogContent className={className} {...props}>
      {children}
    </DialogContent>
  );
}

function ResponsiveDialogHeader({ className, children, ...props }) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? DrawerHeader : DialogHeader;
  return <Comp className={className} {...props}>{children}</Comp>;
}

function ResponsiveDialogTitle({ className, children, ...props }) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? DrawerTitle : DialogTitle;
  return <Comp className={className} {...props}>{children}</Comp>;
}

function ResponsiveDialogDescription({ className, children, ...props }) {
  const isMobile = useIsMobile();
  const Comp = isMobile ? DrawerDescription : DialogDescription;
  return <Comp className={className} {...props}>{children}</Comp>;
}

export {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
};
