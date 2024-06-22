import { db, ref, get, set, onValue, update, remove, Unsubscribe } from '@/app/libs/firebase/firebase';
import { Courses, MataKuliah } from '@/app/component/types';

interface RegisteredCourse {
	key: string;
	kode:string;
	course: string;
	day: string;
	dosenID: string
	dosen: string;
	period: string;
	prodi: string;
	semester: string;
	time: string;
}
  

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


type RegisteredCourseOrInvalid = RegisteredCourse | { key: string };

export const fetchRegisteredCourses = (
	setRegisteredCourses: (courses: RegisteredCourse[]) => void,
	prodiFilter: string
  ) => {
	const registeredCoursesRef = ref(db, 'registeredCourses');
  
	const unsubscribe = onValue(registeredCoursesRef, (snapshot) => {
	  const data = snapshot.val();
	  if (data) {
		const courses: RegisteredCourseOrInvalid[] = [];
  
		// Iterasi melalui setiap anak dari node registeredCourses
		Object.entries(data).forEach(([userId, userCourses]) => {
		  if (typeof userCourses === 'object' && userCourses !== null) {
			Object.entries(userCourses).forEach(([key, value]) => {
			  if (typeof value === 'object' && value !== null) {
				const course = { key, ...value } as RegisteredCourse;
				if (course.prodi === prodiFilter) {
				  courses.push(course);
				}
			  } else {
				courses.push({ key } as RegisteredCourseOrInvalid);
			  }
			});
		  }
		});
  
		setRegisteredCourses(courses.filter((course): course is RegisteredCourse => 'course' in course));
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

export const addregister = async (registered: boolean, ) => {
	try {
		const courseRef = ref(db, `/`);
		await update(courseRef, {"register": registered});
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

export const getUserRole = async (userId: string) => {
	try {
		const snapshot = await get(ref(db, `user/${userId}/Job`));
		console.log(snapshot.val);
		return snapshot.val();
		
		
	} catch (error) {
		console.error('Error getting user role:', error);
		return null;
	}
};

export const getProdi = async (userId: string) => {
	try {
		const snapshot = await get(ref(db, `user/${userId}/Prodi`));
		return snapshot.val();
		
	} catch (error) {
		console.error('Error getting user role:', error);
		return null;
	}
};

export const getnama = async (userId: string) => {
	try {
		const snapshot = await get(ref(db, `user/${userId}/name`));
		return snapshot.val();
		
	} catch (error) {
		console.error('Error getting user role:', error);
		return null;
	}
};