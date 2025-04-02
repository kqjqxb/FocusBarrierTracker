import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadFocusTrackerUser = async () => {
      try {
        const storedFocusTrackerUser = await AsyncStorage.getItem('currentUser');
        if (storedFocusTrackerUser) {
          setUser(JSON.parse(storedFocusTrackerUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadFocusTrackerUser();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
