
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => Promise<void>;
  isAdmin: boolean;
}

const Header = ({ setSidebarOpen, handleLogout, isAdmin }: HeaderProps) => {
  return (
    <header className="h-16 border-b border-border flex items-center px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="ml-auto flex items-center space-x-4">
        {isAdmin && (
          <span className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white">
            Admin Account
          </span>
        )}
        <span className="text-sm font-medium text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="hidden md:flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
