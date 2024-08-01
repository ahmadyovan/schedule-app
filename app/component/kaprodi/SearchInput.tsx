// components/SearchInput.js
import { useState } from 'react';

const SearchInput = ({ onSearch }: any) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event: { target: { value: any; }; }) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value); // Call onSearch whenever input changes
  };

  return (
    <div className='h-full'>
      <input className='bg-neutral-600 h-full px-1'
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SearchInput;
