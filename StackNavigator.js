import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FocusHomeScreen from './src/screens/FocusHomeScreen';
import LoadingFocusApp from './src/screens/LoadingFocusApp';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider, UserContext } from './src/context/UserContext';
import { Provider, useDispatch } from 'react-redux';
import store from './src/redux/store';
import { loadUserData } from './src/redux/userSlice';


const Stack = createNativeStackNavigator();

const FocusTracker = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <UserProvider>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </UserProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

const AppNavigator = () => {
  const dispatch = useDispatch();
  const { user, setUser } = useContext(UserContext);

  const [initializingFocusTrackerApp, setInitializingFocusTrackerApp] = useState(true);

  useEffect(() => {
    dispatch(loadUserData());
  }, [dispatch]);

  useEffect(() => {
    const loadFocusTrackerUser = async () => {
      try {
        const deviceFocusId = await DeviceInfo.getUniqueId();
        const storageKey = `currentUser_${deviceFocusId}`;
        const storedFocusTrackerUser = await AsyncStorage.getItem(storageKey);
        
        if (storedFocusTrackerUser) {
          setUser(JSON.parse(storedFocusTrackerUser));
        } 
      } catch (error) {
        console.error('Error load focus user', error);
      } finally {
        setInitializingFocusTrackerApp(false);
      }
    };
    loadFocusTrackerUser();
  }, [setUser]);

  if (initializingFocusTrackerApp) {
    return (
      <View style={{
        backgroundColor: '#f6f6f6',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
      }}>
        <ActivityIndicator size="large" color="#B08711" />
      </View>
    );
  }

  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName={'LoadingFocusApp'}>
          <Stack.Screen name="Home" component={FocusHomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoadingFocusApp" component={LoadingFocusApp} options={{ headerShown: false }} />
        </Stack.Navigator>
    </NavigationContainer>
  );
};


export default FocusTracker;
