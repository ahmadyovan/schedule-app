export interface UserData {
    user_id: string;        // UUID format, so it's a string
    user_email: string;     // Email, also a string
    user_name: string;      // Name, string type
    user_job: string;       // Job title or role, string type
    user_prodi: number;     // Assuming it's an ID for 'prodi', number type
    created_at: string;     // Date in ISO format, string type
    user_num: number;       // Some numeric identifier or number type
}
  
export interface ApiUserDataResponse {
    userData: UserData;     // Nested object for user data
}