export interface MataKuliah {
    'KODE'?: string;
    'MATA KULIAH'?: string;
    'SKS'?: string;
}
  
export interface Priode {
    [key: string]: MataKuliah;
}
  
export interface Semester {
    [key: string]: Priode;
}
  
export interface Prodi {
    [key: string]: Semester;
}

export interface Courses {
    [key: string]: Prodi;
}

