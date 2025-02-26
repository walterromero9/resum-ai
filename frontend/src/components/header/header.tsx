import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ResumAI</h1>
          </div>
          <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => window.open("https://github.com/walterromero9", "_blank")}>
                <Github className="mr-2 h-4 w-4" />
                Github
              </Button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
