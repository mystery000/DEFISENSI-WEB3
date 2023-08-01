import { createContext, useContext, useState } from 'react';
import useLocalStorage from '../lib/hooks/useLocalStroage';

const initialState = {
    user: { _id: '', address: '' },
    setUser: () => { }
}

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error(`useAppContext must be used within a AppContextProvider`);
    }
    return context;
};

export const AppContext = createContext(initialState);
AppContext.displayName = 'AppContext';

const AppContextProvider = ({ children }) => {
    const [user, setUser] = useLocalStorage('user', { _id: '64c7d274e3e3fc5d2ec9b7c0', address: '0xDe10E8d03b9E293A332A248a114F6ae37eADB6Ce' });

    return (
        <AppContext.Provider value={{ user, setUser }}>
            {children}
        </AppContext.Provider>
    );
};

export const ManagedAppContext = ({ children }) => {
    return <AppContextProvider>{children}</AppContextProvider>;
};

