import React from 'react';
import './GradientMenuButton.css';

/**
 * GradientMenuButton - A premium interactive navbar button
 * 
 * Features:
 * - Circular → Expanding pill-style on hover
 * - Icon-first → Text-reveal on hover
 * - Unique gradient per button
 * - Neon glow effect on hover
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - The icon component to display
 * @param {string} props.label - The text label to reveal on hover
 * @param {string} props.gradientFrom - Starting gradient color (hex or CSS color)
 * @param {string} props.gradientTo - Ending gradient color (hex or CSS color)
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.isActive - Active state indicator
 */
const GradientMenuButton = ({
    icon,
    label,
    gradientFrom = '#6366f1',
    gradientTo = '#a855f7',
    onClick,
    isActive = false,
    className = ''
}) => {
    const gradientStyle = {
        '--gradient-from': gradientFrom,
        '--gradient-to': gradientTo,
    };

    return (
        <button
            className={`gradient-menu-btn ${isActive ? 'active' : ''} ${className}`}
            style={gradientStyle}
            onClick={onClick}
            aria-label={label}
        >
            {/* Glow effect layer */}
            <span className="gradient-menu-btn__glow" aria-hidden="true"></span>

            {/* Main button content */}
            <span className="gradient-menu-btn__content">
                {/* Icon container */}
                <span className="gradient-menu-btn__icon">
                    {icon}
                </span>

                {/* Label container */}
                <span className="gradient-menu-btn__label">
                    {label}
                </span>
            </span>
        </button>
    );
};

/**
 * GradientMenuButtonGroup - Container for multiple GradientMenuButtons
 * Ideal for navbar or floating dock usage
 */
export const GradientMenuButtonGroup = ({ children, className = '' }) => {
    return (
        <nav className={`gradient-menu-group ${className}`}>
            {children}
        </nav>
    );
};

export default GradientMenuButton;
