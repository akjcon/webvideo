import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface VideoCardProps {
  imageUrl: string;
  title: string;
  onDelete: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ imageUrl, title, onDelete }) => {
  return (
    <Card className="rounded-lg p-0 w-80">
      <CardContent className="p-2 relative">
        <img
          src={imageUrl}
          alt={title}
          className="rounded-lg w-full border border-gray-300"
        />
        <div
          className="absolute top-4 right-4 p-1 bg-white bg-opacity-80 rounded-full z-50"
          onClick={onDelete}
        >
          <X className="h-4 w-4 text-black" />
        </div>
        <CardTitle className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 m-2 rounded-lg">
          {title}
        </CardTitle>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
