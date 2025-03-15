import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button"; // Import Shadcn UI Button
import { Progress } from "@/components/ui/progress"; // Import Progress Bar component
import { uploadImage } from "@/lib/firebase/storage";
import Image from "next/image";

export const ImageUpload = ({ relativePath,  onUploadComplete, value}: { relativePath: string, onUploadComplete: (fp: string, url: string)=>void, value: string[] }) => {
  const [progress, setProgress] = useState<number>(0);
  
  const [uploadError, setUploadError] = useState<string | null>(null);
//   const [imageUrl, setImageUrl] = useState<string | null>(null);
  

  // Handle file upload
  const handleUpload = async (file: File) => {
    setUploadError(null); // Reset any previous errors

    try {
      await uploadImage(
        relativePath,
        file,
        (progress) => setProgress(progress),
        (error) => setUploadError(error.message),
        (fp, url) => {
            onUploadComplete(fp, url)
            // setImageUrl(url) // Set the URL once upload is successful
        }
      );
    } catch (error) {
      setUploadError("An unexpected error occurred during upload.");
    }
  };

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, // Accept only image files
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      {/* Dropzone area */}
      {/* Show uploaded image */}
      {value?.[1] && (
        <div>
          <Image
            height={200}
            width={200}
            src={value?.[1]}
            alt="Uploaded"
            className="rounded-2xl h-[200px] w-auto"
          />
        </div>
      )}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-4 rounded-lg cursor-pointer ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the image here...</p>
        ) : (
          <p>Drag & drop an image here, or click to select one</p>
        )}
      </div>

      {/* Progress Bar */}
      {progress > 0 && <Progress value={progress} max={100} className="h-4" />}

      {/* Display upload errors */}
      {uploadError && <p className="text-red-600">{uploadError}</p>}
    </div>
  );
};
