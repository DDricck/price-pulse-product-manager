
import { cn } from "@/lib/utils";

interface SidebarOverlayProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const SidebarOverlay = ({ sidebarOpen, setSidebarOpen }: SidebarOverlayProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}
      onClick={() => setSidebarOpen(false)}
    />
  );
};

export default SidebarOverlay;
