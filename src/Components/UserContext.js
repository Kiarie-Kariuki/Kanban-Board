import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Set user data upon sign-in
  const login = (userData) => {
    setUser(userData); 
  };

  // Set user data upon sign-in
  const signOut = () => {
    setUser(null); 
  };

  return (
    <UserContext.Provider value={{ user, login, signOut }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
