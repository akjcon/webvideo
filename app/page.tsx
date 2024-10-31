"use client";

import Image from "next/image";
import { VideoUploadComponent } from "@/components/video-upload";
import { useState, useRef, useEffect } from "react";
import VideoCard from "@/components/video-card";
import ExportButton from "@/components/export-button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface VideoFile {
  file: File;
  thumbnail: any;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<VideoFile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  };

  const generateThumbnail = (file: File): Promise<string> => {
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
  };

  const addFile = async (file: File) => {
    try {
      const thumbnail = await generateThumbnail(file);
      const videoFile: VideoFile = {
        file,
        thumbnail,
      };
      setSelectedFiles([...selectedFiles, videoFile]);
    } catch (error) {
      console.error("Error generating thumbnail:", error);
    }
  };

  const handleExport = async () => {
    if (!loaded) {
      console.error("FFmpeg is not loaded yet.");
      return;
    }

    const ffmpeg = ffmpegRef.current;

    // Write each video file to FFmpeg's virtual filesystem
    for (let i = 0; i < selectedFiles.length; i++) {
      await ffmpeg.writeFile(
        `input${i}.webm`,
        await fetchFile(selectedFiles[i].file)
      );
    }

    // Create a `concat.txt` file listing each input file, one per line
    let concatFileContent = selectedFiles
      .map((_, index) => `file 'input${index}.webm'`)
      .join("\n");
    await ffmpeg.writeFile("concat.txt", concatFileContent);

    // Run FFmpeg command to concatenate the videos listed in `concat.txt`
    await ffmpeg.exec([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "concat.txt",
      "-c",
      "copy",
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const videoUrl = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );

    // Trigger download
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "output.mp4";
    a.click();

    // Clean up
    URL.revokeObjectURL(videoUrl);
  };

  return (
    <div className="bg-[#333] min-h-screen flex items-center justify-center font-[family-name:var(--font-geist-sans)]">
      <div>
        <div>
          {selectedFiles.map(({ thumbnail, file }, index) => (
            <div key={index} className="p-2">
              <VideoCard key={index} imageUrl={thumbnail} title={file.name} />
            </div>
          ))}
        </div>
        <div className="mt-10">
          <VideoUploadComponent addFile={addFile} />
        </div>
        <div className="mt-2 flex items-center justify-center mx-auto">
          <ExportButton
            onExport={handleExport}
            disabled={selectedFiles.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
