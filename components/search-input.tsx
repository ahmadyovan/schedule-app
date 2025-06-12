'use client';

import React, { useState } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void; // Fungsi untuk menangani pencarian
}

const SearchInput: React.FC<SearchInputProps> = ({ placeholder = 'Search...', onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Memanggil fungsi pencarian dengan input terbaru
  };

  return (
    <div className="w-full flex items-center gap-2">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-300"
      />
    </div>
  );
};

export default SearchInput;
