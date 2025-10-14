import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = (
    {
       children,
       onClick,
       type = 'button',
       variant = 'primary',
       disabled = false,
    }) => {
    return (
        <button
            type={type}
            className={`${styles.button} ${styles[variant]}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;
