"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function VideoUploadComponent({
  addFile,
}: {
  addFile: (file: File) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "video/mp4") {
        setSelectedFile(file);
        setError(null);
        console.log("file", file);
        addFile(file);
      } else {
        setSelectedFile(null);
        setError("Please select a valid .mp4 file.");
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 flex flex-col items-center">
      <div className="flex items-center space-x-2 justify-center">
        <Input
          id="video-upload"
          type="file"
          accept=".mp4,video/mp4"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button onClick={handleButtonClick} className="w-full ml-0">
          <Upload className="h-4 w-4" /> Choose Video
        </Button>
      </div>
      {selectedFile && (
        <p className="text-sm text-muted-foreground text-center">
          Selected file: {selectedFile.name}
        </p>
      )}
      {error && (
        <Alert variant="destructive" className="w-full text-center">
          <AlertCircle className="h-4 w-4 mx-auto" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
