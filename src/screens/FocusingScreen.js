import { set } from 'date-fns';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Modal,
  TextInput,

} from 'react-native';
const fontInterRegular = 'Inter18pt-Regular';

const FocusingScreen = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  const [isThisTimerRunning, setIsThisTimerRunning] = useState(false);
  const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState('60:00');
  const [inputTimerValue, setInputTimerValue] = useState('');
  const [timerColor, setTimerColor] = useState('white');

  const handleMinutesChange = (value) => {
    if (/^\d*$/.test(value) && (value === '' || (parseInt(value, 10) >= 1 && parseInt(value, 10) < 100))) {
      setInputTimerValue(value);
    }
  };

  useEffect(() => {
    let interval;
    if (isThisTimerRunning) {
      interval = setInterval(() => {
        setTimeLeft(prevTimerTime => {
          const [minutes, seconds] = prevTimerTime.split(':').map(Number);
          const totalSeconds = minutes * 60 + seconds - 1;
          if (totalSeconds <= 10) {
            setTimerColor('#FF0000');
          }

          if (totalSeconds <= 0) {
            clearInterval(interval);
            setIsThisTimerRunning(false);
            return '00:00';
          }

          const newTimerMinutes = Math.floor(totalSeconds / 60);
          const newTimerSeconds = totalSeconds % 60;
          return `${String(newTimerMinutes).padStart(2, '0')}:${String(newTimerSeconds).padStart(2, '0')}`;

        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isThisTimerRunning, timeLeft]);

  const handleStartTimer = () => {
    setTimerColor('white');
    if(!isThisTimerRunning) {
      setTimeLeft(`${inputTimerValue}:00`);
      setInputTimerValue('');
      setIsTimerModalVisible(true);
      setTimeout(() => {
        setIsTimerModalVisible(false);
        setIsThisTimerRunning(true);
      }, 4000);
    } else setIsThisTimerRunning(false);
  }

  return (
    <SafeAreaView style={{
      alignItems: 'center',
      width: dimensions.width,
      position: 'relative',
      flex: 1,
      justifyContent: 'flex-start',

    }} >
      <Text style={{
        textAlign: 'center',
        fontFamily: fontInterRegular,
        fontWeight: 700,
        fontSize: dimensions.width * 0.052,
        alignItems: 'center',
        alignSelf: 'center',
        color: 'white',
      }}
      >
        Focusing Timer
      </Text>

      <View style={{ width: dimensions.width * 0.93, flex: 1, marginTop: dimensions.height * 0.03 }}>
        
          <View
            style={{
              width: dimensions.width * 0.7,
              height: dimensions.width * 0.7,
              borderRadius: dimensions.width * 0.5,
              backgroundColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: dimensions.height * 0.02,
              borderColor: 'rgba(211, 211, 211, 0.7)',
              borderWidth: 4.6,
            }}>

            {!isThisTimerRunning ? (
              <Image
                source={require('../assets/images/focusingImage.png')}
                style={{
                  width: dimensions.width * 0.3,
                  height: dimensions.width * 0.3,
                  left: dimensions.width * 0.05,
                  bottom: dimensions.width * 0.05,
                }}
                resizeMode="contain"
              />
            ) : (
              <Text
                style={{
                  fontFamily: fontInterRegular,
                  textAlign: "center",
                  fontSize: dimensions.width * 0.14,
                  fontWeight: 800,
                  color: timerColor,
                  paddingBottom: 8,

                }}
              >
                {timeLeft}
              </Text>
            )}

          </View>



          {!isThisTimerRunning && (
            <>
              <Text style={{
                fontFamily: fontInterRegular,
                color: 'white',
                fontWeight: 700,
                fontSize: dimensions.width * 0.037,
                alignSelf: 'flex-start',
                textAlign: 'center',
                marginTop: dimensions.height * 0.019,
              }}
              >
                Set Focus Time (in minutes)
              </Text>
              <TextInput
                placeholder="Enter the text..."
                value={inputTimerValue}
                onChangeText={handleMinutesChange}
                placeholderTextColor="rgba(255, 255, 255, 0.73)"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  borderWidth: dimensions.width * 0.004,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: dimensions.width * 0.035,
                  paddingHorizontal: dimensions.width * 0.04,
                  backgroundColor: 'transparent',
                  borderRadius: dimensions.width * 0.023,
                  width: '100%',
                  color: 'white',
                  fontFamily: fontInterRegular,
                  fontSize: dimensions.width * 0.041,
                  fontWeight: 500,
                  textAlign: 'left',
                  marginTop: dimensions.height * 0.01,
    
                }}
              />
            </>
          )}



        <TouchableOpacity
          onPress={handleStartTimer}
          disabled={inputTimerValue === '' && !isThisTimerRunning}
          style={{
            width: dimensions.width * 0.93,
            padding: dimensions.width * 0.04,
            backgroundColor: '#FFDE59',
            borderRadius: dimensions.width * 0.037,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginTop: dimensions.height * 0.02,
            opacity: inputTimerValue === '' && !isThisTimerRunning ? 0.5 : 1,
            position: 'absolute',
            bottom: dimensions.height * 0.12,

          }}
        >
          <Text
            style={{
              fontFamily: fontInterRegular,
              fontSize: dimensions.width * 0.037,
              color: 'black',
              fontWeight: 700,

            }}
          >
            {!isThisTimerRunning ? 'Run timer' : 'Stop timer'}
          </Text>
        </TouchableOpacity>
      </View>





      <Modal
        visible={isTimerModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignSelf: 'center',
          width: '100%',
          height: '100%',
        }}>
          <View style={{ backgroundColor: '#1D1D1D', width: '90%', height: '34%', alignSelf: 'center', borderRadius: dimensions.width * 0.1, padding: 20 }}>
            


              <Image
                source={require('../assets/images/focusingModalImage.png')}
                style={{
                  width: dimensions.height * 0.16,
                  height: dimensions.height * 0.16,

                  alignSelf: 'center',
                }}
                resizeMode="contain"
              />
              <Text style={{
                paddingBottom: 5,
                fontFamily: fontInterRegular,
                fontWeight: 500,
                textAlign: 'center',
                fontSize: dimensions.width * 0.034,
                paddingHorizontal: dimensions.width * 0.07,
                marginTop: dimensions.height * 0.021,
                color: 'white',
              }}>
                We recommend disabling Focus Mode on your iPhone for a smoother experience
              </Text>



          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FocusingScreen;
