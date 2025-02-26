import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500 text-center">
          ResumAI © {new Date().getFullYear()} - Powered by Walter Romero
        </p>
      </div>
    </footer>
  );
};

export default Footer;
