import axios from "axios";
import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";

type ConvertedType = {
  originalName: string;
  name: string;
};

type ErrorType = {
  message: string;
};

const Content = () => {
  const [arrConverted, setArrConverted] = useState<ConvertedType[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadError, setIsUploadError] = useState("");
  const handleFile = useCallback(async (acceptedFiles: File[] | FileList) => {
    if (isUploadError) {
      setIsUploadError("");
    }
    const formData = new FormData();

    formData.append("document", acceptedFiles[0]);
    try {
      setIsUploading(true);
      const result = await axios.post(
        "http://localhost:5000/api/convert",
        formData
      );
      setArrConverted((prev) => [...prev, result.data.data]);
    } catch (error) {
      console.log(error);
      setIsUploadError((error as ErrorType).message);
    }
    setIsUploading(false);
  }, []);

  const { getRootProps, getInputProps, open, isDragActive, isDragAccept } =
    useDropzone({
      onDrop: handleFile,
      accept: {
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
        "application/vnd.oasis.opendocument.text": [".odt"],
      },
    });
  const inputRef = useRef<HTMLDivElement>(null);

  const handleDownload = async ({
    filename,
    originalName,
  }: {
    filename: string;
    originalName: string;
  }) => {
    const res = await axios({
      method: "get",
      url: `http://localhost:5000/api/download?filename=${filename}`,
      responseType: "blob",
    });
    try {
      // Create a temporary URL for the blob data
      const url = window.URL.createObjectURL(new Blob([res.data]));

      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", originalName + ".pdf"); // Set the desired file name
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div
      {...getRootProps()}
      className="mt-32 flex flex-col gap-2 justify-center items-center  text-center"
      onClick={(e) => e.target === inputRef.current && open()}
    >
      {/* dropzone overlay */}
      {isDragActive && (
        <div
          className={`fixed ${
            isDragAccept ? "bg-green-950/60" : "bg-red-950/60"
          }  top-0 bottom-0 left-0 right-0 flex justify-center items-center`}
        >
          <p className="text-white text-2xl font-bold">
            {isDragAccept ? "Just drop it !" : "Invalid file type !"}
          </p>
        </div>
      )}
      {/* title */}
      <h1 className="text-4xl font-bold">Upload Document</h1>
      <p className="text-gray-500">Convert doc, docx, odt to pdf.</p>
      {/* input component */}
      <div
        ref={inputRef}
        className="w-[90%] p-4 md:w-[36rem] h-[16rem] mt-4 flex justify-center items-center shadow-lg text-gray-500 rounded-xl hover:shadow-xl transition-shadow cursor-pointer group border"
      >
        {/* loading upload component */}
        {isUploading && (
          <div className="flex flex-col gap-4 items-center">
            <div className="w-16 h-16 border-4 animate-spin rounded-full border-t-transparent" />
            <p>uploading....</p>
          </div>
        )}

        {/* error upload compoennt */}
        {isUploadError && (
          <div className="w-full h-full relative flex justify-center items-center bg-red-500/10">
            <button
              onClick={() => setIsUploadError("")}
              className="absolute right-2 top-2 px-4 py-2 bg-white rounded-full font-semibold hover:bg-red-500 hover:text-white"
            >
              close {"(x)"}
            </button>
            <p className="text-red-500 font-bold">{isUploadError}</p>
          </div>
        )}

        {/* input upload component */}
        {!isUploading && !isUploadError && (
          <>
            <input {...getInputProps()} />
            <p className="text-black/50 group-hover:text-black transition-all">
              Drag and drop files here, or click to browse
            </p>
          </>
        )}
      </div>
      {arrConverted.length > 0 && (
        <>
          {/* separator */}
          <div className="w-32 flex items-center gap-2 my-6">
            <div className="flex-1 h-[1px] bg-black/50" />
            <p>Result</p>
            <div className="flex-1 h-[1px] bg-black/50" />
          </div>
          {/* result lists */}
          <div className="w-[90%] md:w-[36rem] flex flex-col gap-4">
            {arrConverted?.map((converted, idx) => (
              <div
                key={idx}
                className="px-6 py-4 flex justify-between items-center gap-4 shadow-md text-gray-500 rounded-xl hover:shadow-lg transition-shadow group border"
              >
                <div className="bg-gray-500 w-6 h-6 flex-shrink-0 rounded-md"></div>
                <p>{converted.originalName}</p>
                <button
                  onClick={() =>
                    handleDownload({
                      filename: converted.name,
                      originalName: converted.originalName,
                    })
                  }
                  className="bg-black py-2 w-28 text-white font-bold rounded-lg text-sm hover:bg-black/60 transition-all duration-200 flex-shrink-0"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Content;
