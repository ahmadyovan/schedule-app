'use client'

import { useState } from "react"

const Home = () => {
    
    const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;
    return;

    // const formData = new FormData();
    // formData.append('file', file);

    // const res = await fetch('/api/import-dosen', {
    //   method: 'POST',
    //   body: formData,
    // });

    // const result = await res.json();
    // console.log(result);
  };

  return (
    <div className="p-4">
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload CSV
      </button>
    </div>
  );
}

export default Home