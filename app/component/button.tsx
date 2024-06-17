'use client'

interface buttonInterface {
  label: string;
  onClick: () => void;
}

const Button = ({ label, onClick } : buttonInterface) => {
    
    return (
        <button type="button" onClick={onClick} >
            {label}
        </button>
    );
};

export default Button;