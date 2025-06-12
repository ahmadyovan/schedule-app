'use client';

import { deleteData } from "@/utils/functions";

interface Props {
    open: boolean;
    id: number;
    onClose: () => void;
}

const DeleteCourseModal = ({ open, id, onClose }: Props) => {

    const handleDelete = async () => {
        await deleteData({ table: 'mata_kuliah', id });
    };

    return open ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg">
                <h2 className="text-xl mb-4">Konfirmasi Hapus</h2>
                <p className="mb-4">Apakah Anda yakin ingin menghapus course ini?</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" >
                        Tidak
                    </button>
                    <button onClick={() => {handleDelete(); onClose()}} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" >
                        Ya
                    </button>
                </div>
            </div>
        </div>
    ) : null
};

export default DeleteCourseModal;
