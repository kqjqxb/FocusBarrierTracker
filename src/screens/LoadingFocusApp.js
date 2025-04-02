import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Text, Image, Dimensions, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoadingFocusApp = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const navigation = useNavigation();

  const fontTTTravelsRegular = 'TTTravels-Regular';
  const fontTTTravelsMedium = 'TTTravels-Medium';

  const [focusPercentage, setFocusPercentage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      navigation.replace('Home');
    }, 3000);
  }, []);

  useEffect(() => {
    if (focusPercentage < 100) {
      const timer = setTimeout(() => {
        setFocusPercentage(focusPercentage + 1);
      }, 12);
      return () => clearTimeout(timer);
    }
  }, [focusPercentage]);

  return (
    <View style={{
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
      backgroundColor: '#FFFFFF',
    }}>
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Image
          resizeMode='contain'
          style={{
            height: dimensions.width * 0.4,
            marginTop: -dimensions.height * 0.05,
            width: dimensions.width * 0.4,
          }}
          source={require('../assets/images/focusBarierLoadingImage.png')}
        />
        <Text style={{
          paddingHorizontal: dimensions.width * 0.05,
          color: '#000000',
          fontSize: dimensions.width * 0.1,
          textAlign: 'center',
          fontFamily: fontTTTravelsMedium,
          marginTop: dimensions.height * 0.01,
        }}>
          Focus Barrier Tracker
        </Text>
      </Animated.View>

      <View style={{
        width: dimensions.width * 0.93,
        position: 'absolute',
        bottom: dimensions.height * 0.091,
      }}>
        <View style={{
          alignSelf: 'flex-end',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: dimensions.width * 0.01,
        }}>
          <Text style={{
            fontFamily: fontTTTravelsRegular,
            color: 'black',
            fontSize: dimensions.width * 0.045,
            textAlign: 'center',
            fontWeight: '600',
            marginTop: dimensions.height * 0.01,
            alignSelf: 'flex-end',
            marginRight: dimensions.width * 0.01,
          }}>
            {focusPercentage}%
          </Text>

          <Image
            resizeMode='contain'
            style={{
              width: dimensions.height * 0.025,
              height: dimensions.height * 0.025,
              alignSelf: 'center',
            }}
            source={require('../assets/images/starImage.png')}
          />
        </View>

        <View style={{
          width: dimensions.width * 0.9,
          alignSelf: 'center',
          height: dimensions.height * 0.032,
          borderRadius: dimensions.width * 0.6,
          borderWidth: dimensions.width * 0.003,
          marginTop: dimensions.height * 0.001,
          borderColor: '#B08711',
          overflow: 'hidden',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}>
          <View style={{
            width: dimensions.width * 0.9 * (focusPercentage / 100),
            height: dimensions.height * 0.032,
            backgroundColor: '#B08711',
            borderRadius: dimensions.width * 0.6,
          }}></View>
        </View>
      </View>
    </View>
  );
};

export default LoadingFocusApp;