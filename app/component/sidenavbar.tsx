
interface selectType {
    onMenuSelect: (menu: 'matakuliah' | 'verifikasi' | 'jadwal') => void;
}

const SideNavbar = ({ onMenuSelect }: selectType) => {

    return (
        <div className="h-full w-40 bg-neutral-900 py-5">
            <div className="flex flex-col px-5 gap-3">
                <div className="cursor-pointer" onClick={() => onMenuSelect('matakuliah')}>mata kuliah</div>
                <div className="cursor-pointer" onClick={() => onMenuSelect('verifikasi')}>Verifikasi</div>
                <div className="cursor-pointer" onClick={() => onMenuSelect('jadwal')}>Jadwal</div>
            </div>
        </div>
    )
}

export default SideNavbar