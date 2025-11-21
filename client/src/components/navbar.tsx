import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./theme-provider";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  const scrollToDemo = () => {
    const section = document.getElementById("demo-section");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-lg font-bold">MM</span>
            </div>
            <span className="text-xl font-semibold">MeetMate AI</span>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <button
              onClick={scrollToDemo}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-product"
            >
              Product
            </button>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-how-it-works"
            >
              How it works
            </a>
            <a
              href="#demo-section"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-demo"
            >
              Demo
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={scrollToDemo} data-testid="button-try-demo">
              Try Live Demo
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              data-testid="button-theme-toggle"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
