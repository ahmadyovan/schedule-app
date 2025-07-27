import { insertData } from "@/utils/functions";

type Modal = {
    data: { id: number; nama?: string }[];
    onExit: (value: boolean) => void;
}

const Modal = ({data, onExit}: Modal) => { 

    const handleInsert = async () => {
            const table = 'nama_tabel';
            const payload = {
                nama: 'Nama',
            };
    
            const result = await insertData({ table, payload });
    
            if (result.success) {
                console.log('Data berhasil dimasukkan!');
            } else {
                console.log('Gagal memasukkan data:', result.message);
            }
    };

    return (
        <div>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-3xl">
                <div className="bg-white h-full max-h-[30rem] flex flex-col rounded-xl shadow-lg max-w-md w-full p-6">
                    <h2 className="text-lg w-full text-center font-semibold mb-4">Daftar Ruangan</h2>
                    <div className="overflow-hidden">
                        <div className="overflow-y-auto h-full flex flex-col gap-3">
                            {data.map((ruangan) => (
                                <div key={ruangan.id} className="px-4 py-2 border border-gray-300 flex justify-between rounded-md shadow-sm bg-gray-50" >
                                    <div>
                                         {ruangan.nama == 'name'? `Ruangan ${ruangan.id}` : ruangan.nama}
                                    </div>
                                    <div>
                                        <button>hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between gap-2 mt-4">
                        <button className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-gray-200 transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" 
                        >
                            tambah ruangan</button>
                        <button 
                            className="rounded-md border border-transparent px-4 py-2 text-base font-medium text-black bg-gray-200 transition-colors duration-200 shadow hover:border-blue-600 focus:outline-none" 
                            onClick={() => onExit(false)}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal;