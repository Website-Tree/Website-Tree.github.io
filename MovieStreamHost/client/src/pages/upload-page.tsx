import { UploadForm } from "@/components/movies/upload-form";

export default function UploadPage() {
  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">Upload Movie</h2>
        <UploadForm />
      </div>
    </div>
  );
}
