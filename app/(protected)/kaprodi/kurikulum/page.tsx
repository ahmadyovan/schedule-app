// import FilterSemester from "@/components/filter-semester";
'use client'

import InsertModal from '@/components/kaprodi/kurikulum/InsertModal';
import DeleteModal from '@/components/kaprodi/kurikulum/DeleteModal';
import UpdateModal from '@/components/kaprodi/kurikulum/UpdateModal';
import { useMemo, useState } from 'react';
import { useUser } from '@/app/context/UserContext';
import type { Tables } from '@/types/supabase';
import { useSupabaseTableData } from '@/components/hook/useTableData';

type Course = Tables<'mata_kuliah'>;
type CoursePartial = Pick<Course, 'id' | 'kode' | 'nama' | 'sks' | 'semester'>;

const Home = () => {
	const [activeSemester, setActiveSemester] = useState<number | null>(1);
	const [isOpen, setIsOpen] = useState(0);
	const [selected, setSelected] = useState<CoursePartial>({ id: 0, kode: 0, nama: '', sks: 0, semester: 0 });

	const user = useUser();
	const prodi = user.prodi;

	const filtersMatkul = useMemo(
	() => [
		{ column: 'prodi', value: prodi },
		{ column: 'semester', value: activeSemester }
	],
	[prodi, activeSemester]
	);

	const { data, loading, refetch } = useSupabaseTableData<Tables<'mata_kuliah'>>(
		'mata_kuliah', { filters: filtersMatkul }
	);
	
  	const totalSKS = useMemo(() => {return data.reduce((total, item) => total + item.sks, 0);}, [data]);

	const prodiMap: Record<number, string> = {
		1: 'Mesin',
		2: 'Komputer',
		3: 'Industri',
		4: 'Informatika',
		5: 'DKV',
	};

	const getprodi = (id: number) => prodiMap[id] || '';

	return (
		<div className="h-full w-full flex flex-col items-center gap-5 text-[#333] xl:text-xl">
			<div className="w-full flex flex-col items-center xl:text-2xl pt-5">
				<h1 className="">Manajemen kurikulum</h1>
				<h1 className="">Teknik {getprodi(prodi)}</h1>
			</div>
			<div className='w-full flex flex-col gap-3 max-w-7xl'>
				<div className='flex flex-col gap-3'>
					<div className='w-full justify-center flex gap-3'>
						{Array.from({ length: 8 }, (_, index) => {
							const semester = index + 1;
							return (
								<button key={semester} onClick={() => setActiveSemester(semester)}
								className={`px-2 py-2 rounded-md transition-colors ${activeSemester === semester ? 'bg-[#cefdc2]' : 'bg-[#E9E9E9] hover:bg-gray-300'}`}>
								Semester {semester}
								</button>
							);
						})}
					</div>
					<div className='w-full bg-[#cefdc2] rounded-md '>
						<div className='w-full grid grid-cols-[1fr_10rem] gap-3 items-center pr-4'>
							<div className="w-full grid grid-cols-[5rem_10rem_1fr_15rem] items-center py-2 rounded gap-3">
								<div className="text-center">No</div>
								<div className="">Kode</div>
								<div className="">Mata Kuliah</div>
								<div className="text-center">SKS</div>
							</div>
							<div className=''>
							</div>
						</div>
					</div>
				</div>

				<div className="h-full w-full flex flex-col overflow-hidden">
					<div className="h-full max-h-[22rem] w-full overflow-y-scroll flex flex-col gap-4 scroll-snap-y scroll-snap-mandatory">
						{loading
						? Array(5)
							.fill(0)
							.map((_, index) => (
							<div key={index} className="grid grid-cols-4 py-2 bg-gray-300 rounded-md animate-pulse text-gray-300">loading</div>
							))
						: data.map((item, index) => (
							<div key={index} className='flex h-16 flex-col gap-3'>
								<div className="w-full grid grid-cols-[1fr_10rem] lowercase cursor-pointer gap-3">
									<div className='w-full grid grid-cols-[5rem_10rem_1fr_15rem] rounded-md gap-3 bg-[#F4F4F4] hover:bg-gray-300 py-2'>
										<div className="text-center ">{index + 1}</div>
										<div className="">{item.kode}</div>
										<div className="">{item.nama}</div>
										<div className="text-center">{item.sks}</div>
									</div>

									<div className='flex flex-1 gap-3'>
										<button onClick={() => { setIsOpen(2); setSelected(item); }} className={`w-full bg-[#E9E9E9] rounded hover:bg-gray-300 transition-colors`}> Edit </button>
										<button onClick={() => { setIsOpen(3); setSelected(item); }} className={`w-full bg-[#ffbcbc] rounded hover:bg-[#e0a4a4] transition-colors`}> Hapus </button>
									</div>
								</div>
								<div className='h-[1px] bg-[#C1C1C1]' />
							</div>
						))}
					</div>
					<div className="w-full flex gap-3 py-3">
						<div className='w-10/12 grid grid-cols-[1fr_8rem] items-center gap-3'>
							<div className='flex justify-center'>
								<button className={`px-4 py-2 rounded-md bg-[#E9E9E9] hover:bg-gray-300`} onClick={() => setIsOpen(1)}>Tambah</button>
							</div>
							<div className='text-center'>{totalSKS}</div>
						</div>
						<button className='flex-1 w-16 rounded-md bg-[#E9E9E9] hover:bg-gray-300'>Selesai</button>
					</div>
				</div>
			</div>

			<InsertModal prodi={prodi} open={isOpen === 1} onClose={() => setIsOpen(0)} onSuccess={refetch}/>
			<UpdateModal course={selected} open={isOpen === 2} onClose={() => setIsOpen(0)} onSuccess={refetch}/>
			<DeleteModal id={selected.id} open={isOpen === 3} onClose={() => setIsOpen(0)} onSuccess={refetch}/>
		</div>
	);
};

export default Home;