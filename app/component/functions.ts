import { db, ref, get, set, onValue, update, remove, Unsubscribe } from '@/app/libs/firebase/firebase';
import { Courses, MataKuliah } from '@/app/component/types';



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

export const updateCourse = async (prodi: string, selectedSemester: string, selectedPeriod: string, row: string, updatedCourse: MataKuliah): Promise<void> => {
	try {
		const courseRef = ref(db, `courses/${prodi}/${selectedSemester}/${selectedPeriod}/${row}`);
		await update(courseRef, updatedCourse);
	} catch (error) {
		console.error('Error updating course:', error);
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
		const snapshot = await get(ref(db, `User/${userId}/Job`));
		return snapshot.val();
		
	} catch (error) {
		console.error('Error getting user role:', error);
		return null;
	}
};

export const getProdi = async (userId: string) => {
	try {
		const snapshot = await get(ref(db, `User/${userId}/Prodi`));
		return snapshot.val();
		
	} catch (error) {
		console.error('Error getting user role:', error);
		return null;
	}
};


