"use client";

import Image from "next/image";
import { VideoUploadComponent } from "@/components/video-upload";
import { useState, useRef } from "react";
import VideoCard from "@/components/video-card";

interface VideoFile {
  file: File;
  thumbnail: any;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<VideoFile[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const addFile = (file: File) => {
    const videoFile: VideoFile = {
      file,
      thumbnail: generateThumbnail(file),
    };
    setSelectedFiles([...selectedFiles, videoFile]);
  };

  const generateThumbnail = (file: File) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.currentTime = 1; // Capture the thumbnail at 1 second into the video

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL("image/png");
        return thumbnail;
      }
      URL.revokeObjectURL(video.src); // Clean up the object URL
    };
  };

  return (
    <div className="bg-[#333] min-h-screen flex items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <div>
        <VideoUploadComponent addFile={addFile} />
        <div>
          {selectedFiles.map(({ thumbnail, file }, index) => (
            <VideoCard key={index} imageUrl={thumbnail} title={file.name} />
          ))}
        </div>
      </div>
    </div>
  );
}
