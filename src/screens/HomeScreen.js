import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';



import FocusingScreen from './FocusingScreen';
import FocusHabitDetailsScreen from './FocusHabitDetailsScreen';
import FocusSettingsScreen from './FocusSettingsScreen';

import { ArrowLeftIcon, CheckIcon, XMarkIcon } from 'react-native-heroicons/solid';

import DateTimePicker from '@react-native-community/datetimepicker';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import FocusAnalysScreen from './FocusAnalysScreen';
import FocusTestScreen from './FocusTestScreen';


const homePagesButtons = [
  { screen: 'Home', title: 'Habit', iconImage: require('../assets/icons/simpleFocusIcons/proCalendar.png'), selectedIconImage: require('../assets/icons/goldFocusIcons/proCalendar.png') },
  { screen: 'Focusing', title: ' Productivity', iconImage: require('../assets/icons/simpleFocusIcons/proCase.png'), selectedIconImage: require('../assets/icons/goldFocusIcons/proCase.png') },
  { screen: 'Analysis', title: 'Analysis', iconImage: require('../assets/icons/simpleFocusIcons/proAnalysis.png'), selectedIconImage: require('../assets/icons/goldFocusIcons/proAnalysis.png') },
  { screen: 'FocusTest', title: 'Test', iconImage: require('../assets/icons/simpleFocusIcons/proTest.png'), selectedIconImage: require('../assets/icons/goldFocusIcons/proTest.png') },
  { screen: 'Settings', title: 'Settings', iconImage: require('../assets/icons/simpleFocusIcons/proSettings.png'), selectedIconImage: require('../assets/icons/goldFocusIcons/proSettings.png') },
];



const fontInterRegular = 'Inter18pt-Regular';

const fontTTTravelsRegular = 'TTTravels-Regular';
const fontTTTravelsBlack = 'TTTravels-Black';
const fontTTTravelsBold = 'TTTravels-Bold';

const HomeScreen = () => {

  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [selectedScreen, setSelectedScreen] = useState('Home');

  const [favorites, setFavorites] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSwipeableId, setActiveSwipeableId] = useState(null);
  const swipeableRefs = useRef(new Map());

  const [focusTestStarted, setFocusTestStarted] = useState(false);

  const [focusHabits, setFocusHabits] = useState([])
  const [focusTime, setFocusTime] = useState(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPeriodicity, setSelectedPeriodicity] = useState('');
  const [selectedReminder, setSelectedReminder] = useState('');

  const [selectedFocusHabit, setSelectedFocusHabit] = useState(null);

  const handleFocusTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setFocusTime(selectedTime);
    }
  };

  const renderRightProjectActions = (proj) => (
    <TouchableOpacity
      onPress={() => removeProject(proj)}
      style={{
        justifyContent: 'center',
        backgroundColor: 'transparent',
        alignItems: 'center',
        height: '100%',
        width: 68,
      }}
    >
      <XMarkIcon size={dimensions.height * 0.05} color='#FFDE59' />
    </TouchableOpacity>
  );

  const removeProject = async (projectToRemove) => {
    try {
      const updatedProjects = focusHabits.filter(proj =>
        !(proj.id === projectToRemove.id)
      );
      await AsyncStorage.setItem('focusHabits', JSON.stringify(updatedProjects));
      setFocusHabits(updatedProjects);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove fHabit from focusHabits.');
    }
  };



  const handleSwipeableToOpen = (id) => {
    swipeableRefs.current.forEach((ref, key) => {
      if (key !== id && ref) {
        ref.close();
      }
    });
    setActiveSwipeableId(id);
  };


  const handleSwipeableClose = (id) => {
    if (activeSwipeableId === id) {
      setActiveSwipeableId(null);
    }
  };


  const handleSwipeableProjectOpen = (id) => {
    swipeableRefs.current.forEach((ref, key) => {
      if (key !== id && ref) {
        ref.close();
      }
    });
    setActiveSwipeableId(id);
  };


  const handleSwipeableProjectClose = (id) => {
    if (activeSwipeableId === id) {
      setActiveSwipeableId(null);
    }
  };



  const saveFocusHabit = async () => {
    try {
      const exFocusBarHabbits = await AsyncStorage.getItem('focusHabits');
      const focusHabits = exFocusBarHabbits ? JSON.parse(exFocusBarHabbits) : [];
      const newFocusHabId = focusHabits.length > 0 ? Math.max(...focusHabits.map(fHabit => fHabit.id)) + 1 : 1;

      const fHabit = {
        id: newFocusHabId,
        title,
        description: description.replace(/\s/g, '').length === 0 ? 'No description' : description,
        time: focusTime,
        periodicity: selectedPeriodicity,
        reminder: selectedReminder,
        doneDays: [],
        notFullfilledDays: [],
        updatedDate: new Date(),
      };

      focusHabits.unshift(fHabit);
      await AsyncStorage.setItem('focusHabits', JSON.stringify(focusHabits));
      setFocusHabits(focusHabits);

      setTitle('');
      setDescription('');
      setFocusTime(new Date());
      setSelectedPeriodicity('');
      setSelectedReminder('');

      setModalVisible(false);
    } catch (error) {
      console.error('Error saving fHabit:', error);
    }
  };

  useEffect(() => {
    const loadFocusBarHabits = async () => {
      try {
        const exFocusBarHabbits = await AsyncStorage.getItem('focusHabits');
        if (exFocusBarHabbits) {
          setFocusHabits(JSON.parse(exFocusBarHabbits));
        }
      } catch (error) {
        console.error('Error loading focusHabits:', error);
      }
    };

    loadFocusBarHabits();
  }, [selectedScreen]);

  const formatFocusBarTime = (time) => {
    const date = new Date(time);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#f6f6f6',
      width: dimensions.width
    }}>

      {selectedScreen === 'Home' ? (
        <SafeAreaView style={{
          width: dimensions.width,
          height: dimensions.height * 0.9,
        }}>
          <Text style={{
            textAlign: 'center',
            fontFamily: fontTTTravelsBlack,
            fontSize: dimensions.width * 0.06,
            alignItems: 'center',
            alignSelf: 'center',
            color: '#000000',
          }}
          >
            Habit tracker
          </Text>

          {focusHabits.length === 0 ? (
            <View style={{
              width: dimensions.width * 0.9,
              backgroundColor: 'white',
              borderRadius: dimensions.width * 0.05,
              paddingVertical: dimensions.height * 0.02,
              paddingHorizontal: dimensions.width * 0.05,
              alignSelf: 'center',
              marginTop: dimensions.height * 0.02,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: dimensions.height * 0.01,
              },
              shadowOpacity: 0.16,
              shadowRadius: dimensions.width * 0.03,
              elevation: 5,
            }}>
              <Image
                source={require('../assets/images/noHabitsImage.png')}
                style={{
                  width: dimensions.height * 0.6,
                  height: dimensions.height * 0.24,
                  alignSelf: 'center',

                }}
                resizeMode='contain'
              />

              <Text style={{
                textAlign: 'center',
                fontFamily: fontTTTravelsBlack,
                fontSize: dimensions.width * 0.042,
                alignItems: 'center',
                alignSelf: 'center',
                color: '#000000',
                marginTop: dimensions.height * 0.013,
              }}
              >
                You haven't created habits yet
              </Text>

              <TouchableOpacity 
                onPress={() => {
                  setModalVisible(true);
                }}
              style={{
                width: dimensions.width * 0.83,
                backgroundColor: '#B08711',
                borderRadius: dimensions.width * 0.6,
                height: dimensions.height * 0.065,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: dimensions.height * 0.02,
              }}>
                <Text style={{
                  textAlign: 'center',
                  fontFamily: fontTTTravelsBlack,
                  fontSize: dimensions.width * 0.045,
                  alignItems: 'center',
                  alignSelf: 'center',
                  color: 'white',
                }}
                >
                  Add habit
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={{
              alignSelf: 'center',
            }} contentContainerStyle={{
              paddingBottom: dimensions.height * 0.16,
            }} showsVerticalScrollIndicator={false}>
              {focusHabits.map((fHabit, index) => (
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedFocusHabit(fHabit);
                    setSelectedScreen('HabitDetails');
                  }}
                key={index} style={{
                  width: dimensions.width * 0.9,
                  backgroundColor: 'white',
                  borderRadius: dimensions.width * 0.05,
                  paddingVertical: dimensions.height * 0.012,
                  paddingHorizontal: dimensions.width * 0.05,
                  alignSelf: 'center',
                  marginTop: dimensions.height * 0.01,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: dimensions.height * 0.005,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: dimensions.width * 0.02,
                }}>
                  <TouchableOpacity style={{
                    position: 'absolute',
                    top: dimensions.height * 0.005,
                    right: dimensions.width * 0.01,
                    zIndex: 5,
                  }}>
                    <Image
                      source={require('../assets/icons/arrowUpRightIcon.png')}
                      style={{
                        width: dimensions.height * 0.074,
                        height: dimensions.height * 0.074,
                      }}
                      resizeMode='contain'
                    />

                  </TouchableOpacity>
                  <Text style={{
                    textAlign: 'left',
                    fontFamily: fontTTTravelsBold,
                    fontSize: dimensions.width * 0.045,
                    alignSelf: 'flex-start',
                    color: 'black',
                    maxWidth: dimensions.width * 0.67,
                  }}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {fHabit.title}
                  </Text>

                  <Text style={{
                    textAlign: 'left',
                    fontFamily: fontTTTravelsBlack,
                    fontSize: dimensions.width * 0.07,
                    marginTop: dimensions.height * 0.017,
                    alignSelf: 'flex-start',
                    color: '#B08711',
                  }}
                  >
                    {formatFocusBarTime(fHabit.time)}
                  </Text>

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    marginTop: dimensions.height * 0.007,
                  }}>
                    <View style={{
                      paddingHorizontal: dimensions.width * 0.035,
                      height: dimensions.height * 0.04,
                      backgroundColor: '#D8D8D8',
                      borderRadius: dimensions.width * 0.6,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Text style={{
                        textAlign: 'left',
                        fontFamily: fontTTTravelsRegular,
                        fontSize: dimensions.width * 0.03,
                        fontWeight: 500,
                        alignSelf: 'flex-start',
                        color: 'rgba(0, 0, 0, 0.5)',
                      }}
                      >
                        {fHabit.periodicity}
                      </Text>
                    </View>

                    <View style={{
                      paddingHorizontal: dimensions.width * 0.025,
                      height: dimensions.height * 0.04,
                      backgroundColor: '#D8D8D8',
                      borderRadius: dimensions.width * 0.6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginLeft: dimensions.width * 0.01,
                    }}>
                      <Text style={{
                        textAlign: 'left',
                        fontFamily: fontTTTravelsRegular,
                        fontSize: dimensions.width * 0.03,
                        fontWeight: 500,
                        alignSelf: 'flex-start',
                        color: 'rgba(0, 0, 0, 0.5)',
                      }}
                      >
                        {fHabit.reminder}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(true);
                }}
                style={{
                  width: dimensions.width * 0.9,
                  backgroundColor: '#B08711',
                  borderRadius: dimensions.width * 0.6,
                  height: dimensions.height * 0.065,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: dimensions.height * 0.02,
                }}>
                <Text style={{
                  textAlign: 'center',
                  fontFamily: fontTTTravelsBlack,
                  fontSize: dimensions.width * 0.045,
                  alignItems: 'center',
                  alignSelf: 'center',
                  color: 'white',
                }}
                >
                  Add habit
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}

        </SafeAreaView>
      ) : selectedScreen === 'Settings' ? (
        <FocusSettingsScreen setSelectedScreen={setSelectedScreen}
          favorites={favorites} setFavorites={setFavorites}
        />
      ) : selectedScreen === 'HabitDetails' ? (
        <FocusHabitDetailsScreen setSelectedScreen={setSelectedScreen} selectedScreen={selectedScreen} selectedFocusHabit={selectedFocusHabit} 
          setSelectedFocusHabit={setSelectedFocusHabit} focusHabits={focusHabits} setFocusHabits={setFocusHabits}
        />
      ) : selectedScreen === 'Focusing' ? (
        <FocusingScreen setSelectedScreen={setSelectedScreen} selectedScreen={selectedScreen} />
      ) : selectedScreen === 'Analysis' ? (
        <FocusAnalysScreen setSelectedScreen={setSelectedScreen} selectedScreen={selectedScreen} />
      ) : selectedScreen === 'FocusTest' ? (
        <FocusTestScreen setSelectedScreen={setSelectedScreen} selectedScreen={selectedScreen} setFocusTestStarted={setFocusTestStarted} focusTestStarted={focusTestStarted}/>
      ) : null}

      {!(selectedScreen === 'FocusTest' && focusTestStarted) && (

        <View
          style={{
            position: 'absolute',
            bottom: dimensions.height * 0.04,
            paddingBottom: dimensions.height * 0.03,
            paddingTop: dimensions.height * 0.019,
            paddingHorizontal: dimensions.width * 0.055,
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: dimensions.height * 0.01,
            },
            shadowOpacity: 0.16,
            shadowRadius: dimensions.width * 0.03,
            elevation: 5,
            width: dimensions.width * 0.91,
            height: dimensions.height * 0.08,
            borderRadius: dimensions.width * 0.5,

            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
            paddingVertical: dimensions.height * 0.004,
            zIndex: 5000,
          }}
        >
          {homePagesButtons.map((buttn, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedScreen(buttn.screen)}
              style={{
                marginHorizontal: dimensions.width * 0.001,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                height: dimensions.height * 0.03,
              }}
            >
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                textDecorationLine: 'underline',
                textDecorationLineColor: '#B08711',
                textDecorationLineWidth: dimensions.width * 0.005,
                borderBottomWidth: selectedScreen === buttn.screen ? dimensions.width * 0.005 : 0,
                borderBottomColor: '#B08711',
                paddingBottom: dimensions.height * 0.01,
              }}>
                <Image
                  source={selectedScreen === buttn.screen ? buttn.selectedIconImage : buttn.iconImage}
                  style={{
                    width: dimensions.height * 0.027,
                    height: dimensions.height * 0.027,
                    textAlign: 'center',
                  }}
                  resizeMode="contain"
                />
              </View>

              {selectedScreen === buttn.screen && (
                <Text
                  style={{
                    fontFamily: fontTTTravelsBold,
                    fontSize: dimensions.width * 0.033,
                    color: '#B08711',
                    fontWeight: 700,
                    alignSelf: 'flex-start',
                    textAlign: 'left',
                    marginLeft: dimensions.width * 0.01,
                    top: -dimensions.height * 0.005,
                    maxWidth: dimensions.width * 0.25,
                  }}
                >
                  {buttn.title}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}


      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView
            style={{
              alignSelf: 'center',
              alignItems: 'center',
              width: '100%',
              paddingHorizontal: dimensions.width * 0.052,
              width: dimensions.width,
              zIndex: 999,
              backgroundColor: '#f6f6f6',
              height: dimensions.height,
            }}
          >
            <View style={{
              width: dimensions.width * 0.9,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',

            }}>
              <TouchableOpacity
                style={{
                  width: dimensions.height * 0.063,
                  height: dimensions.height * 0.063,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: dimensions.width * 0.6,
                  backgroundColor: '#B08711',
                }}
                onPress={() => {
                  setModalVisible(false);
                  setTitle('');
                  setDescription('');
                  setFocusTime(new Date());
                  setSelectedPeriodicity('');
                  setSelectedReminder('');

                }}
              >
                <ArrowLeftIcon size={dimensions.width * 0.07} color='white' />
              </TouchableOpacity>

              <Text style={{
                textAlign: 'center',
                fontFamily: fontTTTravelsBlack,
                fontSize: dimensions.width * 0.06,
                alignItems: 'center',
                alignSelf: 'center',
                color: '#000',
              }}
              >
                Add habit
              </Text>

              <TouchableOpacity
                disabled={title.replace(/\s/g, '').length === 0 || selectedPeriodicity === '' || selectedReminder === ''}
                style={{
                  width: dimensions.height * 0.063,
                  height: dimensions.height * 0.063,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: dimensions.width * 0.6,
                  backgroundColor: title.replace(/\s/g, '').length === 0 || selectedPeriodicity === '' || selectedReminder === '' ? '#8A8A8E' : '#B08711',
                }}
                onPress={() => {
                  saveFocusHabit();
                }}
              >
                <CheckIcon size={dimensions.width * 0.07} color='white' />
              </TouchableOpacity>
            </View>

            <ScrollView style={{
              alignSelf: 'center',
              width: dimensions.width,
            }} contentContainerStyle={{
              paddingBottom: dimensions.height * 0.15,
              alignItems: 'center',
            }} showsVerticalScrollIndicator={false}>
              <Image
                source={require('../assets/images/noHabitsImage.png')}
                style={{
                  width: dimensions.width * 0.4,
                  height: dimensions.width * 0.4,
                }}
                resizeMode='contain'
              />

              <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="#8A8A8E"
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: dimensions.width * 0.035,
                  paddingHorizontal: dimensions.width * 0.04,
                  backgroundColor: 'transparent',
                  borderRadius: dimensions.width * 0.7,
                  width: dimensions.width * 0.9,
                  color: '#000000',
                  fontFamily: fontTTTravelsRegular,
                  fontSize: dimensions.width * 0.041,
                  fontWeight: title.length === 0 ? 600 : 700,
                  textAlign: 'left',
                  marginTop: dimensions.height * 0.01,
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: dimensions.height * 0.01,
                  },
                  shadowOpacity: 0.16,
                  shadowRadius: dimensions.width * 0.03,
                  elevation: 5,

                }}
              />

              <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#8A8A8E"
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: dimensions.width * 0.035,
                  paddingHorizontal: dimensions.width * 0.04,
                  backgroundColor: 'transparent',
                  borderRadius: dimensions.width * 0.06,
                  width: dimensions.width * 0.9,
                  color: '#000000',
                  fontFamily: fontTTTravelsRegular,
                  fontSize: dimensions.width * 0.041,
                  fontWeight: description.length === 0 ? 600 : 700,
                  textAlign: 'left',
                  marginTop: dimensions.height * 0.01,
                  backgroundColor: '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: dimensions.height * 0.01,
                  },
                  shadowOpacity: 0.16,
                  shadowRadius: dimensions.width * 0.03,
                  elevation: 5,
                  height: dimensions.height * 0.14,
                  textAlignVertical: 'top',
                }}
                multiline={true}
              />

              <Text style={{
                textAlign: 'left',
                fontFamily: fontTTTravelsRegular,
                fontSize: dimensions.width * 0.04,
                alignSelf: 'flex-start',
                color: '#000',
                fontWeight: 400,
                paddingHorizontal: dimensions.width * 0.05,
                marginTop: dimensions.height * 0.02,
              }}
              >
                Periodicity selection
              </Text>

              {['Daily', 'Twice a week', '3 times a week', '4 times a week', 'Once a week'].map((periodicity, index) => (
                <TouchableOpacity
                  onPress={() => {
                    if (selectedPeriodicity === periodicity) {
                      setSelectedPeriodicity('');
                    } else setSelectedPeriodicity(periodicity);
                  }}
                  key={index} style={{
                    width: dimensions.width * 0.9,
                    alignSelf: 'center',
                    backgroundColor: selectedPeriodicity === periodicity ? '#B08711' : 'white',
                    borderRadius: dimensions.width * 0.6,
                    height: dimensions.height * 0.065,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: dimensions.height * 0.006,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: dimensions.height * 0.01,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: dimensions.width * 0.03,
                    elevation: 5,
                  }}>
                  <Text style={{
                    textAlign: 'center',
                    fontFamily: fontTTTravelsRegular,
                    fontSize: dimensions.width * 0.05,
                    alignSelf: 'center',
                    color: selectedPeriodicity === periodicity ? '#fff' : '#000',
                    fontWeight: 600,
                  }}
                  >
                    {periodicity}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={{
                textAlign: 'left',
                fontFamily: fontTTTravelsRegular,
                fontSize: dimensions.width * 0.04,
                alignSelf: 'flex-start',
                color: '#000',
                fontWeight: 400,
                paddingHorizontal: dimensions.width * 0.05,
                marginTop: dimensions.height * 0.02,
              }}
              >
                Start time
              </Text>
              <DateTimePicker
                value={focusTime || new Date()}
                mode="time"
                display="spinner"
                textColor='white'
                zIndex={1000}
                onChange={(event, selectedTime) => {
                  handleFocusTimeChange(event, selectedTime);
                }}
                style={{
                  width: dimensions.width * 0.9,
                  fontSize: dimensions.width * 0.03,
                  alignSelf: 'center',
                  color: 'black',
                }}
                themeVariant='light'
                textColor='black'
              />

              <Text style={{
                textAlign: 'left',
                fontFamily: fontTTTravelsRegular,
                fontSize: dimensions.width * 0.04,
                alignSelf: 'flex-start',
                color: '#000',
                fontWeight: 400,
                paddingHorizontal: dimensions.width * 0.05,
                marginTop: dimensions.height * 0.02,
              }}
              >
                A reminder for
              </Text>

              {['10 minutes before the start', '30 minutes before the start', 'An hour before the start', 'Two hours before the start', 'Three hours before the start'].map((reminder, index) => (
                <TouchableOpacity
                  onPress={() => {
                    if (selectedReminder === reminder) {
                      setSelectedReminder('');
                    } else setSelectedReminder(reminder);
                  }}
                  key={index} style={{
                    width: dimensions.width * 0.9,
                    alignSelf: 'center',
                    backgroundColor: selectedReminder === reminder ? '#B08711' : 'white',
                    borderRadius: dimensions.width * 0.6,
                    height: dimensions.height * 0.065,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: dimensions.height * 0.006,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: dimensions.height * 0.01,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: dimensions.width * 0.03,
                    elevation: 5,
                  }}>
                  <Text style={{
                    textAlign: 'center',
                    fontFamily: fontTTTravelsRegular,
                    fontSize: dimensions.width * 0.05,
                    alignSelf: 'center',
                    color: selectedReminder === reminder ? '#fff' : '#000',
                    fontWeight: 600,
                  }}
                  >
                    {reminder}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default HomeScreen;
