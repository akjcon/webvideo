import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoCardProps {
  imageUrl: string;
  title: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ imageUrl, title }) => {
  return (
    <Card className="rounded-lg p-0 w-80">
      <CardContent className="p-2 relative">
        <img
          src={imageUrl}
          alt={title}
          className="rounded-lg w-full border border-gray-300"
        />
        <CardTitle className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50 m-2 rounded-lg">
          {title}
        </CardTitle>
      </CardContent>
    </Card>
  );
};

export default VideoCard;
