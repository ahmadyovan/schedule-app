import { createClientSupabase } from "@/utils/supabase/client"
import { Database } from '@/app/component/types/supabase';
import { RealtimeChannel } from "@supabase/supabase-js";

const supabase = createClientSupabase();

type TableNames = keyof Database['public']['Tables'];

interface OptimizedSchedule {
    Schedule_Jadwal_id: number
    Schedule_Sks: number;
    Schedule_Prodi: number;
    Schedule_Semester: number;
    Schedule_Dosen_num: string;
    Schedule_Hari: string;
    Schedule_Waktu: string;
}

function getIdColumnName(table: TableNames): string {
    switch (table) {
		case 'user':
			return 'user_id';
		case 'course':
			return 'course_id';
		case 'jadwal':
			return 'jadwal_id';
		case 'preferensi':
			return 'preferensi_id';
		case 'prodi':
			return 'prodi_id';
		default:
			throw new Error(`Unknown table: ${table}`);
    }
}

export const getCoursesByProdi = async (prodiId: number) => {
    const supabase = await createClientSupabase();
    
    const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('course_prodi', prodiId);
    
    const subscription = supabase
    .channel('custom-channel-name')
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'course',
        filter: `course_prodi=eq.${prodiId}`
    }, (payload) => {
        console.log('Change received!', payload);
    })
    .subscribe();

    if (error) {
        console.error('Error fetching courses:', error);
        return { data: null, error, subscription };
    }
    
    return { data, error: null, subscription };
};

// Modified getRow function
export const getRow = async <T extends TableNames>(
  table: T,
  id: string | number
) => {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(getIdColumnName(table), id)
    .single();

  return { data, error };
};

export interface Course {
  course_id: number;
  course_kode: string;
  course_name: string;
  course_sks: number;
  course_semester: string;
  course_prodi: number | undefined;
}
  
  export const setupRealtimeSubscription = async (onUpdate: (table: string) => void) => {
    const supabase = await createClientSupabase();
    
    const channel: RealtimeChannel = supabase.channel('db-changes');

    channel
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'jadwal',
        }, (payload) => {
            console.log('Jadwal change received!', payload);
            onUpdate('jadwal');
        })
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'course',
        }, (payload) => {
            console.log('Course change received!', payload);
            onUpdate('course');
        });

    const subscription = channel.subscribe();
    
    return () => {
        subscription.unsubscribe();
    };
};
  
  export const fetchCourses = async (prodi: number) => {    
    const { data, error } = await supabase.from('course').select('*').eq("course_prodi", prodi)
    if (error) throw error
    return data as Course[]
  }
  
  export const addCourse = async (newCourse: Omit<Course, 'course_id'>) => {
    const { data, error } = await supabase
      .from('course')
      .insert(newCourse)
      .select()
  
    if (error) throw error
    return data[0] as Course
  }
  
  export const updateCourse = async (id: number, updatedCourse: Partial<Course>) => {
    const { data, error } = await supabase
      .from('course')
      .update(updatedCourse)
      .eq('course_id', id)
      .select()
  
    if (error) throw error
    return data[0] as Course
  }
  
  export const deleteCourse = async (id: number) => {
    const { error } = await supabase.from('course').delete().eq('course_id', id)
    if (error) throw error
  }

  export const createOptimizedScheduleTable = async () => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS optimized_schedule (
        schedule_id serial PRIMARY KEY,
        schedule_kode varchar NOT NULL,
        schedule_name varchar NOT NULL,
        schedule_sks int NOT NULL,
        schedule_prodi varchar NOT NULL,
        schedule_semester varchar NOT NULL,
        schedule_dosen varchar NOT NULL,
        schedule_hari varchar NOT NULL,
        schedule_jam varchar NOT NULL,
        created_at timestamp DEFAULT current_timestamp
      );
    `;
  
    try {
      const { data, error } = await supabase.rpc('execute_sql', { sql: createTableQuery });
  
      if (error) {
        throw error;
      }
  
      console.log('Table created successfully:', data);
    } catch (error) {
      console.error('Error creating table:', error);
    }
  };


export const insertSchedule = async (schedule: OptimizedSchedule) => {
  
  
    const { data, error } = await supabase
        .from('schedule')
        .insert([
            {
                schedule_jadwal_id: schedule.Schedule_Jadwal_id,
                schedule_sks: schedule.Schedule_Sks,
                schedule_prodi: schedule.Schedule_Prodi,
                schedule_semester: schedule.Schedule_Semester,
                schedule_dosen_num: schedule.Schedule_Dosen_num,
                schedule_hari: schedule.Schedule_Hari,
                schedule_waktu: schedule.Schedule_Waktu,
            },
        ]);

    if (error) {
      console.log(error);
      
        throw error;
    }

    return data;
};

export const deleteAllData = async (tableName: string) => {
  const { data, error } = await supabase
      .from(tableName)
      .delete()
      .neq('schedule_id', -1); // Menggunakan kondisi yang selalu benar untuk menghapus semua data

  if (error) {
      console.error('Error deleting all data:', error);
  } else {
      console.log('All data deleted:', data);
  }
};