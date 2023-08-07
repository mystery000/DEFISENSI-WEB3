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
    const [user, setUser] = useLocalStorage('user', { _id: '64cd1ecea799c9d828b5d6c3', address: '0x98dC5C7fB775C01cab30D3f71e31d6606972Bd57' });

    return (
        <AppContext.Provider value={{ user, setUser }}>
            {children}
        </AppContext.Provider>
    );
};

export const ManagedAppContext = ({ children }) => {
    return <AppContextProvider>{children}</AppContextProvider>;
};

