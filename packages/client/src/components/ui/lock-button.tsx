import React from "react";
import { Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LockButtonProps {
  isLocked: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  tooltip?: string;
}

export const LockButton: React.FC<LockButtonProps> = ({
  isLocked,
  onClick,
  className,
  tooltip,
}) => {
  const defaultTooltip = isLocked
    ? "Locked response"
    : "Create cache rule from this response";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("hover:bg-gray-700", className)}
      onClick={onClick}
      title={tooltip || defaultTooltip}
    >
      {isLocked ? (
        <Lock
          size={16}
          className="text-yellow-500 hover:text-yellow-400 drop-shadow-[0_0_12px_rgba(234,179,8,0.3)]"
        />
      ) : (
        <LockOpen size={16} className="text-gray-300 hover:text-white" />
      )}
    </Button>
  );
};
