import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../common/NotificationSystem';
import { ROLES } from '../../utils/constants';
import GradientMenuButton from './GradientMenuButton';
import logoImage from '../../assets/logo/abstract-wings-cross-healthcare-removebg-preview.png';
import './GlassNavbar.css';

/**
 * GlassNavbar - Dynamic Island Style Navigation
 * 
 * Features:
 * - Dynamic Dock: Expands on hover/interaction, collapses to circle when idle
 * - Smart positioning: Bottom center (expanded) -> Bottom left (collapsed)
 * - Apple-style glassmorphism
 */
const GlassNavbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const { notify } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const idleTimerRef = useRef(null);
    const lastScrollY = useRef(0);

    // ============================================
    // DYNAMIC DOCK LOGIC
    // ============================================

    // Handle mouse interactions
    // Handle mouse interactions
    const handleMouseEnter = () => {
        setIsHovered(true);
        // Only keep awake if already expanded, don't auto-expand on hover
        if (isExpanded && idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        resetIdleTimer();
    };

    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            if (!isHovered) {
                setIsExpanded(false);
            }
        }, 3000); // Collapse after 3 seconds of inactivity
    }, [isHovered]);

    // Initial timer start
    useEffect(() => {
        resetIdleTimer();
        return () => {
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [resetIdleTimer]);

    // Toggle expansion manually
    const toggleExpansion = (e) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
        resetIdleTimer();
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isExpanded && !event.target.closest('.glass-navbar__dock')) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isExpanded]);


    // ============================================
    // ROLE-BASED MENU CONFIGURATIONS
    // ============================================

    const userMenuItems = [
        {
            id: 'dashboard',
            path: '/user/dashboard',
            label: 'Home',
            gradientFrom: '#6366f1',
            gradientTo: '#a855f7',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            )
        },
        {
            id: 'requests',
            path: '/user/blood-requests',
            label: 'Requests',
            gradientFrom: '#dc2626',
            gradientTo: '#ef4444',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
            )
        },
        {
            id: 'donations',
            path: '/user/donations',
            label: 'Donate',
            gradientFrom: '#10b981',
            gradientTo: '#34d399',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            )
        },
        {
            id: 'schedule',
            path: '/user/schedule-donation',
            label: 'Schedule',
            gradientFrom: '#f97316',
            gradientTo: '#fb923c',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            )
        },
        {
            id: 'chat',
            path: '/user/chat',
            label: 'Chat',
            gradientFrom: '#0ea5e9',
            gradientTo: '#38bdf8',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            )
        },
    ];

    const staffMenuItems = [
        {
            id: 'dashboard',
            path: '/staff/dashboard',
            label: 'Home',
            gradientFrom: '#6366f1',
            gradientTo: '#a855f7',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            )
        },
        {
            id: 'requests',
            path: '/staff/blood-requests',
            label: 'Requests',
            gradientFrom: '#dc2626',
            gradientTo: '#ef4444',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            )
        },
        {
            id: 'patients',
            path: '/staff/patients',
            label: 'Patients',
            gradientFrom: '#10b981',
            gradientTo: '#34d399',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },
        {
            id: 'inventory',
            path: '/staff/inventory',
            label: 'Inventory',
            gradientFrom: '#f97316',
            gradientTo: '#fb923c',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            )
        },
        {
            id: 'schedules',
            path: '/staff/donation-schedules',
            label: 'Schedules',
            gradientFrom: '#8b5cf6',
            gradientTo: '#a78bfa',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
            )
        },
        {
            id: 'chat',
            path: '/staff/chat',
            label: 'Chat',
            gradientFrom: '#ec4899',
            gradientTo: '#f472b6',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
            )
        }
    ];

    const adminMenuItems = [
        {
            id: 'dashboard',
            path: '/admin/dashboard',
            label: 'Home',
            gradientFrom: '#6366f1',
            gradientTo: '#a855f7',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            )
        },
        {
            id: 'users',
            path: '/admin/users',
            label: 'Users',
            gradientFrom: '#3b82f6',
            gradientTo: '#60a5fa',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        },
        {
            id: 'hospitals',
            path: '/admin/hospitals',
            label: 'Hospitals',
            gradientFrom: '#10b981',
            gradientTo: '#34d399',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
            )
        },
        {
            id: 'approvals',
            path: '/admin/staff-approvals',
            label: 'Approvals',
            gradientFrom: '#f59e0b',
            gradientTo: '#fbbf24',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
            )
        },
        {
            id: 'analytics',
            path: '/admin/analytics',
            label: 'Analytics',
            gradientFrom: '#8b5cf6',
            gradientTo: '#a78bfa',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            )
        },
        {
            id: 'settings',
            path: '/admin/settings',
            label: 'Settings',
            gradientFrom: '#64748b',
            gradientTo: '#94a3b8',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            )
        }
    ];

    const getMenuItems = () => {
        if (!user) return [];
        switch (user.role) {
            case ROLES.ADMIN: return adminMenuItems;
            case ROLES.STAFF: return staffMenuItems;
            default: return userMenuItems;
        }
    };

    const menuItems = getMenuItems();

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/login');
        setShowProfileDropdown(false);
        notify.success('Successfully logged out');
    };

    const handleNavClick = (path) => {
        navigate(path);
        resetIdleTimer(); // Keep expanded on interaction
    };

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    const getProfilePath = () => {
        if (!user) return '/';
        const role = user.role.toLowerCase();
        // Admin uses settings for profile-like actions
        if (role === 'admin') return '/admin/settings';
        return `/${role}/profile`;
    };

    return (
        <>
            {/* TOP HEADER - Logo (Left) + Profile (Right) */}
            <header className="glass-navbar-top">
                {/* Logo */}
                <Link to="/" className="glass-navbar__logo">
                    <img src={logoImage} alt="LifeForce Logo" />
                </Link>

                {/* Profile / Login */}
                {isAuthenticated ? (
                    <div className="glass-navbar__profile">
                        <button
                            className="glass-navbar__profile-btn"
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        >
                            <div className="glass-navbar__avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <svg
                                className={`glass-navbar__chevron ${showProfileDropdown ? 'glass-navbar__chevron--open' : ''}`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileDropdown && (
                            <>
                                <div
                                    className="glass-navbar__dropdown-overlay"
                                    onClick={() => setShowProfileDropdown(false)}
                                />
                                <div className="glass-navbar__dropdown">
                                    <div className="glass-navbar__dropdown-header">
                                        <div className="glass-navbar__dropdown-user">
                                            <div className="glass-navbar__dropdown-avatar">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="glass-navbar__dropdown-name">{user?.name}</div>
                                                <div className="glass-navbar__dropdown-email">{user?.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="glass-navbar__dropdown-menu">
                                        <Link
                                            to={`/${user?.role.toLowerCase()}/dashboard`}
                                            className="glass-navbar__dropdown-item"
                                            onClick={() => setShowProfileDropdown(false)}
                                        >
                                            <span className="glass-navbar__dropdown-item-icon">📊</span>
                                            Dashboard
                                        </Link>
                                        <Link
                                            to={getProfilePath()}
                                            className="glass-navbar__dropdown-item"
                                            onClick={() => setShowProfileDropdown(false)}
                                        >
                                            <span className="glass-navbar__dropdown-item-icon">👤</span>
                                            My Profile
                                        </Link>
                                        <div className="glass-navbar__dropdown-divider" />
                                        <button
                                            onClick={handleLogout}
                                            className="glass-navbar__dropdown-item glass-navbar__dropdown-item--danger"
                                        >
                                            <span className="glass-navbar__dropdown-item-icon">🚪</span>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="glass-navbar__auth">
                        {/* Only show on desktop/larger screens */}
                        <div className="hidden md:flex gap-3">
                            <Link to="/login" className="glass-navbar__auth-btn glass-navbar__auth-btn--secondary">
                                Sign In
                            </Link>
                            <Link to="/register" className="glass-navbar__auth-btn glass-navbar__auth-btn--primary">
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* DYNAMIC DOCK - Apple Dynamic Island Style */}
            {isAuthenticated && (
                <nav
                    className={`glass-navbar__dock ${isExpanded ? 'glass-navbar__dock--expanded' : 'glass-navbar__dock--collapsed'}`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {isExpanded ? (
                        /* EXPANDED STATE - Full Menu */
                        <div className="glass-navbar__dock-items">
                            {menuItems.map(item => (
                                <GradientMenuButton
                                    key={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    gradientFrom={item.gradientFrom}
                                    gradientTo={item.gradientTo}
                                    isActive={isActivePath(item.path)}
                                    onClick={() => handleNavClick(item.path)}
                                />
                            ))}
                        </div>
                    ) : (
                        /* COLLAPSED STATE - Single Circle Icon */
                        <div
                            className="glass-navbar__dock-collapsed-icon"
                            onClick={toggleExpansion}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="glass-navbar__menu-trigger">
                                <span className="glass-navbar__menu-trigger-bar"></span>
                                <span className="glass-navbar__menu-trigger-bar"></span>
                                <span className="glass-navbar__menu-trigger-bar"></span>
                            </div>
                        </div>
                    )}
                </nav>
            )}
        </>
    );
};

export default GlassNavbar;
