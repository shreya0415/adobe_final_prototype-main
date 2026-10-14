import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ExpandableButtonProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function ExpandableButton({
  icon,
  title,
  description,
}: ExpandableButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => setOpen(!open)}
      >
        {icon}
        {title}
      </Button>

      {/* Slide-down description */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-40 mt-2" : "max-h-0"
        }`}
      >
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
          {description}
        </p>
      </div>
    </div>
  );
}
