import {
  ref,
  uploadBytesResumable,
  UploadTaskSnapshot,
  getDownloadURL,
  StorageError,
  getMetadata,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/lib/firebase/firebase";
import { Dispatch, SetStateAction } from "react";

export async function uploadToStorage(
  relativePath: string,
  image: File,
  setProgress: (progress: number)=>void,
  uploadError: (error: StorageError)=>void,
  setImageUrl: (fp: string, url: string)=>void
) {
  const filePath = `${relativePath}`;
  const newImageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(newImageRef, image);

  uploadTask.on(
	  "state_changed", 
    (snapShot: UploadTaskSnapshot) => {
      const progress = (snapShot.bytesTransferred / snapShot.totalBytes) * 100;
      setProgress(Number(progress?.toFixed(1)));
    },
    error => {
      console.log(error.message)
      uploadError(error)
    },
    async () => {
      // on complete
      try{
        const url = await getDownloadURL(newImageRef);
        setImageUrl(filePath, url)
      } catch (error){
        console.log('error', error)
      }
      
    }
  );
}

export async function uploadImage(
  relativePath: string,
  image: File,
  setProgress: (progress: number)=>void,
  uploadError: (error: StorageError)=>void,
  setImageUrl: (fp: string, url: string)=>void
) {
  const filePath = `images/${relativePath}`;
  const newImageRef = ref(storage, filePath);
  const uploadTask = uploadBytesResumable(newImageRef, image);
  console.log('uploadTask', uploadTask)
  uploadTask.on(
	  "state_changed", 
    (snapShot: UploadTaskSnapshot) => {
      const progress = (snapShot.bytesTransferred / snapShot.totalBytes) * 100;
      setProgress(Number(progress?.toFixed(1)));
    },
    error => {
      console.log(error.message)
      uploadError(error)
    },
    async () => {
      // on complete
      try{
        const url = await getDownloadURL(newImageRef);
        setImageUrl(filePath, url)
      } catch (error){
        console.log('error', error)
      }
      
    }
  );
}

export async function uploadQRCodeToStorage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  try {
    // Create reference with qrcodes prefix
    const filePath = `qrcodes/${filename}`;
    const qrCodeRef = ref(storage, filePath);

    // Upload buffer
    await uploadBytes(qrCodeRef, buffer, {
      contentType: 'image/png',
    });

    // Get download URL
    const downloadURL = await getDownloadURL(qrCodeRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading QR code:', error);
    throw new Error('Failed to upload QR code to storage');
  }
}

export async function getFileMetaData(fileName: string) {
  const forestRef = ref(storage, fileName);

  // Get metadata properties
  try {
    const metadata = await getMetadata(forestRef);
    return metadata;
  } catch {
    return null;
  }
}
