import { db, ref, get, set, onValue, update, remove, Unsubscribe, push } from '@/app/libs/firebase/firebase';
import { Courses, MataKuliah, RegisteredCourse, ExtendedMataKuliah } from '@/app/component/types';
import { Dispatch, SetStateAction } from 'react';
import { DataSnapshot, equalTo, orderByChild, query } from 'firebase/database';
import { log } from 'console';
  
enum CourseIndex {
    KODE,
    PROGRAM_STUDI,
    PERIODE,
    SEMESTER,
    MATA_KULIAH,
	SKS,
    DOSEN,
    HARI,
    WAKTU
}

interface Course {
    [CourseIndex.KODE]: string;
    [CourseIndex.PROGRAM_STUDI]: string;
    [CourseIndex.PERIODE]: string;
    [CourseIndex.SEMESTER]: string;
    [CourseIndex.MATA_KULIAH]: string;
    [CourseIndex.DOSEN]: string;
    [CourseIndex.SKS]: string;
    [CourseIndex.HARI]: string;
    [CourseIndex.WAKTU]: string;
}

type Schedule = {
    [programStudi: string]: Course[];
};

export const fetchCourses = (prodi: string, setCourses: (courses: Courses) => void): Unsubscribe => {
    const rootRef = ref(db, "courses/" + prodi + "/");
  
    // Attach the onValue event listener
    const unsubscribe = onValue(rootRef, (snapshot) => {
		if (snapshot.exists()) {
			const courses = snapshot.val();
			setCourses(courses);
		} else {
			console.log('No data available');
			setCourses({});
		}
    }, (error) => {
      	console.error('Error fetching data:', error);
    });
  
    return unsubscribe;
};

export const fetchRegisteredCourses = ( prodiFilter: string, setRegisteredCourses: (courses: RegisteredCourse[]) => void ): Unsubscribe => {
	const registeredCoursesRef = ref(db, 'registeredCourses');
	
	const unsubscribe = onValue(registeredCoursesRef, (snapshot) => {
	  const data = snapshot.val();
	  if (data) {
		const courses: RegisteredCourse[] = Object.entries(data).map(([key, value]) => ({
		  key,
		  ...(value as Omit<RegisteredCourse, 'key'>)
		})).filter(course => prodiFilter === '' || course.prodi === prodiFilter);
	
		setRegisteredCourses(courses);
	  } else {
		console.log('No data available');
		setRegisteredCourses([]);
	  }
	}, (error) => {
	  console.error('Error fetching registered courses:', error);
	});
	
	return unsubscribe;
};

export const fetchAllCourses = (setCourses: (courses: Courses) => void): Unsubscribe => {
    const rootRef = ref(db, "courses/");
  
    // Attach the onValue event listener
    const unsubscribe = onValue(rootRef, (snapshot) => {
		if (snapshot.exists()) {
			const courses = snapshot.val();
			setCourses(courses);
		} else {
			console.log('No data available');
			setCourses({});
		}
    }, (error) => {
      	console.error('Error fetching data:', error);
    });
  
    return unsubscribe;
};

// export const fetchNotRegisteredCourses = (prodi: string, setNotRegisteredCourses: (courses: ExtendedMataKuliah[]) => void): Unsubscribe => {
// 	const unsubscribe = onValue(ref(db, `courses/${prodi}`), (coursesSnapshot) => {
// 	  const allCourses: Courses[string] = coursesSnapshot.val() || {};
  
// 	  onValue(ref(db, 'registeredCourses'), (registeredCoursesSnapshot) => {
// 		const registeredCourses: { [key: string]: RegisteredCourse } = registeredCoursesSnapshot.val() || {};
  
// 		// Hitung jumlah mata kuliah pagi dan sore yang sudah terdaftar
// 		const registeredPagiCount = Object.values(registeredCourses).filter(course => course.time === "Pagi").length;
// 		const registeredSoreCount = Object.values(registeredCourses).filter(course => course.time === "Sore").length;
  
// 		const notRegisteredCourses: ExtendedMataKuliah[] = Object.entries(allCourses)
// 		  .flatMap(([semester, semesterData]) => 
// 			Object.entries(semesterData).flatMap(([periode, periodeData]) => 
// 			  Object.entries(periodeData).map(([key, mataKuliah]) => ({
// 				...mataKuliah,
// 				semester,
// 				periode
// 			  }))
// 			)
// 		  )
// 		  .filter(course => {
// 			const registeredCoursesForCode = Object.values(registeredCourses).filter(
// 			  registeredCourse => registeredCourse.kode === course.KODE
// 			);
  
// 			if (registeredCoursesForCode.length === 0) {
// 			  // Jika mata kuliah belum terdaftar sama sekali
// 			  return (registeredPagiCount < 3 || registeredSoreCount < 3);
// 			}
  
// 			const hasPagi = registeredCoursesForCode.some(rc => rc.time === "Pagi");
// 			const hasSore = registeredCoursesForCode.some(rc => rc.time === "Sore");
  
// 			// Jika belum memiliki kedua waktu (pagi dan sore), dan belum mencapai batas
// 			if (!hasPagi && registeredPagiCount < 3) return true;
// 			if (!hasSore && registeredSoreCount < 3) return true;
  
// 			return false;
// 		  });
  
// 		setNotRegisteredCourses(notRegisteredCourses);
// 	  }, (error) => {
// 		console.error('Error fetching registered courses:', error);
// 		setNotRegisteredCourses([]);
// 	  });
// 	}, (error) => {
// 	  console.error('Error fetching courses:', error);
// 	  setNotRegisteredCourses([]);
// 	});
  
// 	return unsubscribe;
//   };

  export const fetchNotRegisteredCourses = (prodi: string, setNotRegisteredCourses: (courses: ExtendedMataKuliah[]) => void): Unsubscribe => {
	const unsubscribe = onValue(ref(db, `courses/${prodi}`), (coursesSnapshot) => {
	  const allCourses: Courses[string] = coursesSnapshot.val() || {};
  
	  onValue(ref(db, 'registeredCourses'), (registeredCoursesSnapshot) => {
		const registeredCourses: { [key: string]: RegisteredCourse } = registeredCoursesSnapshot.val() || {};
  
		const notRegisteredCourses: ExtendedMataKuliah[] = Object.entries(allCourses)
		  .flatMap(([semester, semesterData]) => 
			Object.entries(semesterData).flatMap(([periode, periodeData]) => 
			  Object.entries(periodeData).map(([key, mataKuliah]) => ({
				...mataKuliah,
				semester,
				periode
			  }))
			)
		  )
		  .filter(course => {
			const registeredCoursesForCode = Object.values(registeredCourses).filter(
			  registeredCourse => registeredCourse.kode === course.KODE
			);
  
			if (registeredCoursesForCode.length === 0) {
			  return true;
			}
  
			const hasPagi = registeredCoursesForCode.some(rc => rc.time === "Pagi");
			const hasMalam = registeredCoursesForCode.some(rc => rc.time === "Sore");
  
			// Jika belum memiliki kedua waktu (pagi dan malam), maka ambil
			return !(hasPagi && hasMalam);
		  });
  
		setNotRegisteredCourses(notRegisteredCourses);
	  }, (error) => {
		console.error('Error fetching registered courses:', error);
		setNotRegisteredCourses([]);
	  });
	}, (error) => {
	  console.error('Error fetching courses:', error);
	  setNotRegisteredCourses([]);
	});
  
	return unsubscribe;
  };

export const addCourse = async (prodi: string, selectedSemester: string, selectedPeriod: string, newCourse: MataKuliah): Promise<void> => {
	try {
		const periodRef = ref(db, `courses/${prodi}/${selectedSemester}/${selectedPeriod}`);
		const periodSnapshot = await get(periodRef);

		let newRowNumber;
		if (periodSnapshot.exists()) {
			const existingRows = Object.keys(periodSnapshot.val());
			newRowNumber = existingRows.length + 1;	
		} else {
			newRowNumber = 1;
		}

		const newRowRef = ref(db, `courses/${prodi}/${selectedSemester}/${selectedPeriod}/Row ${newRowNumber}`);
		await set(newRowRef, newCourse);
	} catch (error) {
		console.error('Error adding course:', error);
	}
};

export const AddRegister = async (registered: boolean, ) => {
	try {
		const courseRef = ref(db, `RegiteredDosen`);
		await push(courseRef, {"register": registered});
	} catch (error) {
		console.error('Error updating course:', error);
	}
};

export const updateCourse = async (prodi: string, selectedSemester: string, selectedPeriod: string, row: string, updatedCourse: MataKuliah): Promise<void> => {
	try {
		const courseRef = ref(db, `courses/${prodi}/${selectedSemester}/${selectedPeriod}/${row}`);
		await update(courseRef, updatedCourse);
	} catch (error) {
		console.error('Error updating course:', error);
	}
};

export const updateCourseField = async (
	userId: string,
	courseKey: string,
	field: keyof RegisteredCourse,
	value: string
  ) => {
	try {
	  const courseRef = ref(db, `registeredCourses/${userId}/${courseKey}`);
	  await update(courseRef, { [field]: value });
	  console.log(`Successfully updated ${field} for course ${courseKey}`);
	} catch (error) {
	  console.error(`Error updating ${field} for course ${courseKey}:`, error);
	  throw error;
	}
  };	

export const deleteCourse = async (prodi: string, selectedSemester: string, selectedPeriod: string, row: string): Promise<void> => {
	try {
		const courseRef = ref(db, `courses/${prodi}/${selectedSemester}/${selectedPeriod}/${row}`);
		await remove(courseRef);
	} catch (error) {
		console.error('Error deleting course:', error);
	}
};

export const getUserDataByLocalId = async (localId: string): Promise<any | null> => {
	try {
	  const usersRef = ref(db, 'users');
	  const snapshot: DataSnapshot = await get(usersRef);
	  
	  if (snapshot.exists()) {
		const users = snapshot.val();
		for (const key in users) {
		  if (users[key].localId === localId) {
			return users[key];
		  }
		}
	  }
	  console.log('No user found with the given localId');
	  return null;
	} catch (error) {
	  console.error('Error getting user data:', error);
	  return null;
	}
};

export const getProdi = async (localId: string): Promise<string | null> => {
	const userData = await getUserDataByLocalId(localId);
	return userData ? userData.prodi : null;
};
  
export const getJob = async (localId: string): Promise<string | null> => {
	const userData = await getUserDataByLocalId(localId);
	return userData ? userData.job : null;
};

export const getUserName = async (localId: string): Promise<string | null> => {
	const userData = await getUserDataByLocalId(localId);
	return userData ? userData.name : null;
};

export const sendDataToFirebase = async (coursesData: any) => {
	const coursesRef = ref(db, 'registeredCourses');
	try {
	  for (const course of coursesData) {
		const courseRef = push(coursesRef);
		await set(courseRef, course);
	  }
	  return { success: true, message: "Berhasil menyimpan" };
	} catch (error: any) {
	  return { error, message: "Gagal menyimpan: " + error.message };
	}
};

export async function checkUserRegistration(uid: string): Promise<boolean> {
    const registeredUsersRef = ref(db, 'registeredUsers');
    const snapshot = await get(registeredUsersRef);
    
    if (snapshot.exists()) {
        const registeredUsers = snapshot.val();
        return uid !== undefined && registeredUsers[uid] === true;
    }
    
    return false;
}

export const saveScheduleToFirebase = async (scheduleData: Schedule, prodi: string) => {
	const scheduleRef = ref(db, 'jadwal'); // Ganti 'userId' dengan ID pengguna atau ID unik lainnya
	try {
	  	await set(scheduleRef, scheduleData);
	  	console.log("Schedule berhasil disimpan ke Firebase");
	} catch (error) {
	  	console.error("Gagal menyimpan schedule ke Firebase:", error);
	}
};
  

export const getScheduleFromServer = async (): Promise<Schedule> => {
	const response = await fetch('/api/courses');
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}
	return response.json();
};