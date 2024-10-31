import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";

interface ExportButtonProps {
  onExport: () => void;
  disabled: boolean;
  loading: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled,
  loading,
}) => {
  return (
    <Button
      onClick={onExport}
      variant="outline"
      className="w-auto ml-0"
      disabled={disabled}
    >
      {loading ? (
        <LoadingSpinner className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export Video
    </Button>
  );
};

export default ExportButton;
