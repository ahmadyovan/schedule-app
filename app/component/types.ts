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

export interface RegisteredCourse {
    key: string;
    course: string;
    day: string;
    dosen: string;
    dosenID: string;
    kode: string;
    period: string;
    prodi: string;
    semester: string;
    time: string;
}

export interface ExtendedMataKuliah extends MataKuliah {
    semester: string;
    periode: string;
}

export interface Dosen {
    uid: string;
    name: string;
}

export interface CoursesKey {
    [semester: string]: {
      period: {
        key: MataKuliah;
      };
    };
}
