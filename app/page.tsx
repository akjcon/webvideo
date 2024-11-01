"use client";

import { VideoUploadComponent } from "@/components/video-upload";
import React, { useState, useRef, useEffect } from "react";
import VideoCard from "@/components/video-card";
import ExportButton from "@/components/export-button";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { generateThumbnail } from "@/lib/utils";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface VideoFile {
  file: File;
  thumbnail: string;
}

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<VideoFile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    // if a user is on the page, they're likely to export a video
    // we preload ffmpeg so that export is super snappy
    load();
  }, []);

  const load = async () => {
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
    setIsLoading(true);
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
    const concatFileContent = selectedFiles
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
      "-c:v",
      "libx264", // Video codec
      "-crf",
      "23", // Constant Rate Factor for quality (lower is better quality)
      "-preset",
      "ultrafast", // Preset for encoding speed vs. compression
      "output.mp4",
    ]);

    const data = await ffmpeg.readFile("output.mp4");
    const videoUrl = URL.createObjectURL(
      new Blob([data], { type: "video/mp4" })
    );

    // Trigger download
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = "output.mp4";
    a.click();

    // Clean up
    URL.revokeObjectURL(videoUrl);
    setIsLoading(false);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedFiles((items) => {
        const oldIndex = items.findIndex(
          (item) => item.file.name === active.id
        );
        const newIndex = items.findIndex((item) => item.file.name === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = (file: File) => {
    console.log("deleting", file);
    setSelectedFiles(selectedFiles.filter((item) => item.file !== file));
  };

  const cards = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
    content: `This is the content for card ${i + 1}.`,
  }));

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Horizontal Scrolling Cards
        </h1>
        <div className="flex flex-col gap-6 overflow-x-auto pb-6">
          <div className="flex gap-6 w-max">
            {cards.map((card) => (
              <Card key={card.id} className="w-80 flex-shrink-0 bg-white">
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{card.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#333] min-h-screen flex flex-col items-center justify-center font-[family-name:var(--font-geist-sans)] p-5">
        <h2 className="text-3xl text-white text-opacity-80 mb-10 ">
          Web Video Editor
        </h2>
        <p className="text-[#ccc] text-opacity-80 mb-2">
          Add as many videos as you want.
        </p>
        <p className="text-[#ccc] text-opacity-80 mb-2">
          Drag and drop videos to reorder them.
        </p>
        <p className="text-[#ccc] text-opacity-80 mb-6">
          Export your video with a single click.
        </p>
        <div className="flex flex-col gap-2 overflow-x-auto pb-6 w-full items-center justify-center">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={selectedFiles.map(({ file }) => file.name)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex gap-1 w-max items-center justify-center">
                {selectedFiles.map(({ thumbnail, file }, index) => (
                  <React.Fragment key={file.name}>
                    <VideoCard
                      id={file.name}
                      imageUrl={thumbnail}
                      title={file.name}
                      onDelete={() => handleDelete(file)}
                      sortable={true}
                    />
                    {selectedFiles.length > 1 &&
                      index < selectedFiles.length - 1 && (
                        <Separator
                          orientation="vertical"
                          className="flex h-20 items-center text-sm text-opacity-40"
                        />
                      )}
                  </React.Fragment>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        <div className="mt-10">
          <VideoUploadComponent addFile={addFile} />
        </div>
        <div className="mt-2 flex flex-col items-center justify-center mx-auto pb-5">
          <ExportButton
            onExport={handleExport}
            disabled={selectedFiles.length === 0}
            loading={isLoading}
          />
          {isLoading && (
            <p className="text-[#ccc] text-opacity-80 pt-3 text-xs">
              If videos are large, this may take a minute...
            </p>
          )}
        </div>
      </div>
    </>
  );
}
