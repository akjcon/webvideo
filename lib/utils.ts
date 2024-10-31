import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
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
        URL.revokeObjectURL(video.src); // Clean up the object URL
        resolve(thumbnail);
      } else {
        reject("Failed to get canvas context");
      }
    };

    video.onerror = () => {
      reject("Failed to load video");
    };
  });
}
