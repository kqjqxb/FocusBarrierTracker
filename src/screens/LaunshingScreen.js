import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Text, Image, Dimensions, PanResponder, ImageBackground, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LaunshingScreen = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const navigation = useNavigation();

  const fontInterRegular = 'Inter18pt-Regular';

  const [loadCrovvns, setLoadCrovvns] = useState(0);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (loadCrovvns < 5) {
      const timer = setTimeout(() => {
        setLoadCrovvns(loadCrovvns + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      navigation.replace('Home');
    }
  }, [loadCrovvns, navigation]);

  useEffect(() => {
    if (percentage < 100) {
      const timer = setTimeout(() => {
        setPercentage(percentage + 1);
      }, 12);
      return () => clearTimeout(timer);
    }
  }, [percentage]);



  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090909' }}>
      <Image
        resizeMode='contain'
        style={{
          width: dimensions.width * 0.7,
          height: dimensions.width * 0.7,

        }}
        source={require('../assets/images/onboardingCalendar.png')}
      />
      <Text style={{
        fontFamily: fontInterRegular,
        color: 'white',
        fontSize: dimensions.width * 0.091,
        textAlign: 'center',
        fontWeight: 800,
        marginTop: dimensions.height * 0.01,
      }}>
        Crovvn Planner
      </Text>


      <View style={{
        width: dimensions.width * 0.93,
        position: 'absolute',
        bottom: dimensions.height * 0.091,
      }}>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          width: dimensions.width * 0.93,
          marginTop: dimensions.height * 0.01,
          
        }}>
          {[1, 2, 3, 4, 5].map((crovvn) => (
            <View key={crovvn} onPress={() => handleStarPress(crovvn)}>
              <Image
                source={loadCrovvns >= crovvn
                  ? require('../assets/icons/crovvnIcon.png')
                  : require('../assets/icons/whiteCrovvnIcon.png')
                }
                style={{
                  textAlign: 'center', width: dimensions.width * 0.139, height: dimensions.width * 0.139,
                  opacity: loadCrovvns >= crovvn ? 1 : 0.4,
                }}
                resizeMode="contain"
              />
            </View>
          ))}
        </View>
        <Text style={{
          fontFamily: fontInterRegular,
          color: 'white',
          fontSize: dimensions.width * 0.034,
          textAlign: 'center',
          fontWeight: 800,
          marginTop: dimensions.height * 0.01,
          alignSelf: 'flex-start',
          marginLeft: dimensions.width * 0.03,
        }}>
          {percentage}%
        </Text>
      </View>


    </View>
  );
};

export default LaunshingScreen;