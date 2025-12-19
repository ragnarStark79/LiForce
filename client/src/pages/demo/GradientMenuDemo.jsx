import React, { useState } from 'react';
import GradientMenuButton, { GradientMenuButtonGroup } from '../../components/navigation/GradientMenuButton';
import './GradientMenuDemo.css';

/**
 * Demo page showcasing the Gradient Menu Icon Button component
 * Demonstrates various configurations, themes, and usage patterns
 */
const GradientMenuDemo = () => {
    const [activeItem, setActiveItem] = useState('home');

    // Menu items with unique gradients
    const menuItems = [
        {
            id: 'home',
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
            id: 'explore',
            label: 'Explore',
            gradientFrom: '#0ea5e9',
            gradientTo: '#38bdf8',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            )
        },
        {
            id: 'create',
            label: 'Create',
            gradientFrom: '#10b981',
            gradientTo: '#34d399',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            )
        },
        {
            id: 'notifications',
            label: 'Alerts',
            gradientFrom: '#f97316',
            gradientTo: '#fb923c',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
            )
        },
        {
            id: 'profile',
            label: 'Profile',
            gradientFrom: '#e11d48',
            gradientTo: '#fb7185',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            )
        },
    ];

    return (
        <div className="gradient-menu-demo">
            {/* Background gradient */}
            <div className="demo-background"></div>

            {/* Header */}
            <header className="demo-header">
                <h1>Gradient Menu Button</h1>
                <p>Premium Interactive Navbar Component</p>
            </header>

            {/* Main Content */}
            <main className="demo-content">

                {/* Section 1: Standard Navbar */}
                <section className="demo-section">
                    <h2>Standard Navbar</h2>
                    <p className="demo-description">
                        Horizontal layout with glass morphism background
                    </p>
                    <GradientMenuButtonGroup>
                        {menuItems.map(item => (
                            <GradientMenuButton
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                gradientFrom={item.gradientFrom}
                                gradientTo={item.gradientTo}
                                isActive={activeItem === item.id}
                                onClick={() => setActiveItem(item.id)}
                            />
                        ))}
                    </GradientMenuButtonGroup>
                </section>

                {/* Section 2: Dark Navbar */}
                <section className="demo-section dark-bg">
                    <h2>Dark Mode Navbar</h2>
                    <p className="demo-description">
                        Perfect for dark-themed dashboards and creative apps
                    </p>
                    <GradientMenuButtonGroup className="dark">
                        {menuItems.map(item => (
                            <GradientMenuButton
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                gradientFrom={item.gradientFrom}
                                gradientTo={item.gradientTo}
                                isActive={activeItem === item.id}
                                onClick={() => setActiveItem(item.id)}
                            />
                        ))}
                    </GradientMenuButtonGroup>
                </section>

                {/* Section 3: Individual Buttons */}
                <section className="demo-section">
                    <h2>Theme Presets</h2>
                    <p className="demo-description">
                        Built-in gradient themes for quick styling
                    </p>
                    <div className="theme-grid">
                        <div className="theme-item">
                            <GradientMenuButton
                                className="theme-purple"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                        <path d="M2 17l10 5 10-5"></path>
                                        <path d="M2 12l10 5 10-5"></path>
                                    </svg>
                                }
                                label="Purple"
                            />
                            <span>Purple Violet</span>
                        </div>
                        <div className="theme-item">
                            <GradientMenuButton
                                className="theme-ocean"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                    </svg>
                                }
                                label="Ocean"
                            />
                            <span>Ocean Blue</span>
                        </div>
                        <div className="theme-item">
                            <GradientMenuButton
                                className="theme-sunset"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                }
                                label="Sunset"
                            />
                            <span>Sunset Orange</span>
                        </div>
                        <div className="theme-item">
                            <GradientMenuButton
                                className="theme-rose"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                }
                                label="Rose"
                            />
                            <span>Rose Pink</span>
                        </div>
                        <div className="theme-item">
                            <GradientMenuButton
                                className="theme-emerald"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                }
                                label="Emerald"
                            />
                            <span>Emerald Green</span>
                        </div>
                        <div className="theme-item">
                            <GradientMenuButton
                                className="theme-cyber"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                }
                                label="Cyber"
                            />
                            <span>Cyber Neon</span>
                        </div>
                        <div className="theme-item">
                            <GradientMenuButton
                                className="theme-gold"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                }
                                label="Gold"
                            />
                            <span>Gold Premium</span>
                        </div>
                        <div className="theme-item">
                            <GradientMenuButton
                                className="theme-blood"
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                                    </svg>
                                }
                                label="Blood"
                            />
                            <span>Blood Red</span>
                        </div>
                    </div>
                </section>

                {/* Code Example */}
                <section className="demo-section code-section">
                    <h2>Usage Example</h2>
                    <pre className="code-block">
                        {`import GradientMenuButton, { GradientMenuButtonGroup } 
  from './components/navigation/GradientMenuButton';

<GradientMenuButtonGroup>
  <GradientMenuButton
    icon={<HomeIcon />}
    label="Home"
    gradientFrom="#6366f1"
    gradientTo="#a855f7"
    isActive={activeItem === 'home'}
    onClick={() => setActiveItem('home')}
  />
</GradientMenuButtonGroup>`}
                    </pre>
                </section>
            </main>

            {/* Floating Dock Demo */}
            <GradientMenuButtonGroup className="floating dark">
                {menuItems.slice(0, 4).map(item => (
                    <GradientMenuButton
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        gradientFrom={item.gradientFrom}
                        gradientTo={item.gradientTo}
                        isActive={activeItem === item.id}
                        onClick={() => setActiveItem(item.id)}
                    />
                ))}
            </GradientMenuButtonGroup>
        </div>
    );
};

export default GradientMenuDemo;
