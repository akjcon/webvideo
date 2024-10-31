import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onExport: () => void;
  disabled: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport, disabled }) => {
  return (
    <Button
      onClick={onExport}
      variant="outline"
      className="w-auto ml-0"
      disabled={disabled}
    >
      <Download className="h-4 w-4" /> Export Video
    </Button>
  );
};

export default ExportButton;
