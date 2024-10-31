import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoCardProps {
  imageUrl: string;
  title: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ imageUrl, title }) => {
  return (
    <Card className="rounded-lg p-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <img src={imageUrl} alt={title} className="rounded-lg w-full" />
      </CardContent>
    </Card>
  );
};

export default VideoCard;
