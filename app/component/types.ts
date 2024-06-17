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
  
export interface Courses {
    [key: string]: Semester;
}