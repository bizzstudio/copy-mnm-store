import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';
import { useTranslations } from "next-intl";
import requests from '@services/httpServices';
import Image from 'next/image';

const Uploader = ({ setImageUrl, imageUrl }) => {
  const t = useTranslations();
  const [files, setFiles] = useState([]);

  const removeImage = () => {
    setFiles([]);
    setImageUrl('');
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"]
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const filteredFiles = acceptedFiles.filter((file) => {
        if (file.size > 3 * 1024 * 1024) {
          alert(t('fileToBig'));
          return false;
        }
        return true;
      });

      if (filteredFiles.length > 0) {
        // מחיקת תמונה ישנה מידית כאשר מתקבלת חדשה
        removeImage();
        setFiles(
          filteredFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );
      }
    },
  });

  const thumbs = files.map((file) => (
    <div key={file.name} className="relative flex items-center justify-center">
      <img
        className="border-2 border-gray-100 w-24 max-h-24 brightness-50 object-cover"
        src={file.preview}
        alt={file.name}
      />
      <img
        src="/loader/spinner.gif"
        alt="Loading"
        width={40}
        height={40}
        className='absolute saturate-0'
      />
      <button
        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
        onClick={removeImage}
      >
        <AiOutlineClose />
      </button>
    </div>
  ));

  useEffect(() => {
    if (files.length > 0) {
      files.forEach((file) => {
        const formData = new FormData();
        formData.append('file', file); // מוסיף את הקובץ ל-FormData

        requests.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then((res) => {
            setImageUrl(res.link); // קבלת הלינק של התמונה מהשרת שלך
          })
          .catch((err) => console.log('Error uploading file:', err));
      });
    }
  }, [files, setImageUrl]);

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <div className="w-full text-center">
      <div
        className="px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <span className="mx-auto flex justify-center">
          <FiUploadCloud className="text-3xl text-mainColor" />
        </span>
        <p className="text-sm mt-2">Drag your image here</p>
        <em className="text-xs text-gray-400">
          (Only *.jpeg and *.png images will be accepted)
        </em>
      </div>
      <aside className="flex flex-row flex-wrap mt-4">
        {imageUrl ? (
          <div className="relative inline-block">
            <Image
              className="border rounded-md border-gray-100 w-24 max-h-24 p-2"
              width={90}
              height={90}
              src={imageUrl}
              alt="image"
            />
            <button
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              onClick={removeImage}
            >
              <AiOutlineClose />
            </button>
          </div>
        ) : (
          thumbs
        )}
      </aside>
    </div>
  );
};

export default Uploader;
