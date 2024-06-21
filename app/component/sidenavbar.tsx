
interface selectType {
    onMenuSelect: (menu: 'matakuliah' | 'verifikasi') => void;
}

const SideNavbar = ({ onMenuSelect }: selectType) => {

    return (
        <div className="h-full w-20 hover:w-40 bg-neutral-900 transition-width duration-300 ease-in-out side-navbar">
            <div className="child cursor-pointer" onClick={() => onMenuSelect('matakuliah')}>mata kuliah</div>
            <div className="child cursor-pointer" onClick={() => onMenuSelect('verifikasi')}>Verifikasi</div>
        </div>
    )
}

export default SideNavbar