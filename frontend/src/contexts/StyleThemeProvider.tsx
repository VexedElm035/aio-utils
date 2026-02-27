import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type StyleTheme = 'retro' | 'modern';

interface StyleThemeProviderProps {
    children: React.ReactNode;
    defaultStyleTheme?: StyleTheme;
    storageKey?: string;
}

interface StyleThemeProviderState {
    styleTheme: StyleTheme;
    setStyleTheme: (theme: StyleTheme) => void;
}

const initialState: StyleThemeProviderState = {
    styleTheme: 'retro',
    setStyleTheme: () => null,
};

const StyleThemeContext = createContext<StyleThemeProviderState>(initialState);

export function StyleThemeProvider({
    children,
    defaultStyleTheme = 'retro',
    storageKey = 'aio-style-theme',
}: StyleThemeProviderProps) {
    const [styleTheme, setStyleThemeState] = useState<StyleTheme>(
        () => (localStorage.getItem(storageKey) as StyleTheme) || defaultStyleTheme
    );

    // Apply class to documentElement
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('theme-retro', 'theme-modern');
        root.classList.add(`theme-${styleTheme}`);
    }, [styleTheme]);

    const value = useMemo(() => ({
        styleTheme,
        setStyleTheme: (newTheme: StyleTheme) => {
            localStorage.setItem(storageKey, newTheme);
            setStyleThemeState(newTheme);
        },
    }), [styleTheme, storageKey]);

    return (
        <StyleThemeContext.Provider value={value}>
            {children}
        </StyleThemeContext.Provider>
    );
}

export const useStyleTheme = () => {
    const context = useContext(StyleThemeContext);

    if (context === undefined)
        throw new Error('useStyleTheme must be used within a StyleThemeProvider');

    return context;
};
