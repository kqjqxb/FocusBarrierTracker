import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,

} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ArrowLeftIcon, PauseIcon, PlayIcon, PlusIcon, XMarkIcon } from 'react-native-heroicons/solid';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

const fontTTTravelsRegular = 'TTTravels-Regular';
const fontTTTravelsBlack = 'TTTravels-Black';
const fontTTTravelsMedium = 'TTTravels-Medium';

const FocusProductivityScreen = ({ selectedScreen }) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const styles = createStyles(dimensions);

  const [isFocusTimerStarted, setFocusTimerStarted] = useState(false);

  const [focusTimeLeft, setFocusTimeLeft] = useState('60:00:00');
  const [hours, minutes, seconds] = focusTimeLeft.split(':');
  const [inputFocusTimerValue, setInputFocusTimerValue] = useState('');

  const [selectedFocusTimerMode, setSelectedFocusTimerMode] = useState('Operation timer');
  const [addStatModalVisible, setAddStatModalVisible] = useState(false);
  const [completedTitle, setCompletedTitle] = useState('');
  const [listOfCompletedTasks, setListOfCompletedTasks] = useState([]);

  const [accomplishmentsTitle, setAccomplishmentsTitle] = useState('');
  const [accomplishmentsList, setAccomplishmentsList] = useState([]);

  const [difficultyTitle, setDifficultyTitle] = useState('');
  const [difficultyList, setDifficultyList] = useState([]);

  const [moodLevel, setMoodLevel] = useState(50);

  const [prodOfTheDay, setProdOfTheDay] = useState(null);

  const [timerSettingsModalVisible, setTimerSettingsModalVisible] = useState(false);


  useEffect(() => {
    const loadProdOfTheDay = async () => {
      try {
        const storedProdOfTheDay = await AsyncStorage.getItem('prodOfTheDay');
        if (storedProdOfTheDay) {
          const parsedProd = JSON.parse(storedProdOfTheDay);
          const today = new Date().toDateString();
          if (Array.isArray(parsedProd) && parsedProd.length > 0) {
            const latestProd = parsedProd[0];
            if (latestProd.dateAdded && new Date(latestProd.dateAdded).toDateString() === today) {
              setProdOfTheDay(latestProd);
            } else {
              setProdOfTheDay(null);
            }
          } else if (parsedProd.dateAdded && new Date(parsedProd.dateAdded).toDateString() === today) {
            setProdOfTheDay(parsedProd);
          } else {
            setProdOfTheDay(null);
          }
        }
      } catch (error) {
        console.error('Error loading prodOfTheDay:', error);
      }
    };

    loadProdOfTheDay();
  }, [selectedScreen, addStatModalVisible]);

  const saveProductivityOfTheDay = async () => {
    try {
      const exProdOfTheDay = await AsyncStorage.getItem('prodOfTheDay');
      const prodOfTheDay = exProdOfTheDay ? JSON.parse(exProdOfTheDay) : [];
      const newProdOfTheDaID = prodOfTheDay.length > 0 ? Math.max(...prodOfTheDay.map(newObj => newObj.id)) + 1 : 1;

      const newObj = {
        id: newProdOfTheDaID,
        dateAdded: new Date(),
        moodAssessment: moodLevel,
        completedTasks: listOfCompletedTasks,
        accomplishments: accomplishmentsList,
        difficulties: difficultyList,
      };

      prodOfTheDay.unshift(newObj);
      await AsyncStorage.setItem('prodOfTheDay', JSON.stringify(prodOfTheDay));

      setMoodLevel(50);
      setListOfCompletedTasks([]);
      setAccomplishmentsList([]);
      setDifficultyList([]);
      setCompletedTitle('');
      setAccomplishmentsTitle('');
      setDifficultyTitle('');

      setProdOfTheDay(newObj);
      setAddStatModalVisible(false);
    } catch (error) {
      console.error('Error saving newObj:', error);
    }
  };

  const handleFocusTimeInputChange = (text) => {
    let digits = text.replace(/:/g, '').substring(0, 6);
    let formatted = '';
    if (digits.length > 2) {
      formatted = digits.substring(0, 2);
      if (digits.length > 2) {
        formatted += ':' + digits.substring(2, Math.min(4, digits.length));
      }
      if (digits.length > 4) {
        formatted += ':' + digits.substring(4, Math.min(6, digits.length));
      }
    } else {
      formatted = digits;
    }
    setInputFocusTimerValue(formatted);
  };

  const lastStartTimeRef = useRef(null);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  const parseTime = (timeStr) => {
    const [hrs, mins, secs] = timeStr.split(':').map(Number);
    return hrs * 3600 + mins * 60 + secs;
  };

  const formatTime = (secondsValue) => {
    const hrs = Math.floor(secondsValue / 3600);
    const mins = Math.floor((secondsValue % 3600) / 60);
    const secs = secondsValue % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const startTimer = async () => {
    const startingSeconds = parseTime(focusTimeLeft);
    lastStartTimeRef.current = Date.now();

    if (selectedFocusTimerMode === 'Break timer') {
      await AsyncStorage.setItem('breakTimer', Date.now().toString());
    } else if (selectedFocusTimerMode === 'Operation timer') {
      await AsyncStorage.setItem('operationTimer', Date.now().toString());
    }

    const intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastStartTimeRef.current) / 1000);
      const newRemaining = startingSeconds - elapsed;
      if (newRemaining <= 0) {
        setFocusTimeLeft(formatTime(0));
        clearInterval(intervalId);
        setTimerIntervalId(null);
        setFocusTimerStarted(false);
      } else {
        setFocusTimeLeft(formatTime(newRemaining));
      }
    }, 1000);

    setTimerIntervalId(intervalId);
  };

  const pauseTimer = () => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
    setFocusTimerStarted(false);
  };

  const handleToggleTimer = () => {
    if (!isFocusTimerStarted) {
      startTimer();
      setFocusTimerStarted(true);
    } else {
      pauseTimer();
    }
  };

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
        color: '#000000',
        fontSize: dimensions.width * 0.06,
        alignItems: 'center',
        alignSelf: 'center',
        fontFamily: fontTTTravelsBlack,
      }}
      >
        Productivity control
      </Text>

      <View style={{
        width: dimensions.width * 0.9,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: dimensions.height * 0.01
      }}>
        <Text style={{
          color: '#000000',
          fontFamily: fontTTTravelsRegular,
          fontWeight: 300,
          alignItems: 'center',
          textAlign: 'center',
          alignSelf: 'center',
          fontSize: dimensions.width * 0.04,
        }}
        >
          Timer
        </Text>

        <TouchableOpacity onPress={() => {
          setTimerSettingsModalVisible(true)
        }} style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            alignItems: 'center',
            textAlign: 'center',
            alignSelf: 'center',
            fontSize: dimensions.width * 0.04,
            fontWeight: 300,
            fontFamily: fontTTTravelsRegular,
            color: '#B08711',
          }}
          >
            Timer setting
          </Text>

          <Image
            source={require('../assets/images/basilArrowUpImage.png')}
            style={{
              width: dimensions.height * 0.05,
              height: dimensions.height * 0.05,
              marginLeft: dimensions.width * 0.01
            }}
            resizeMode='contain'
          />
        </TouchableOpacity>
      </View>

      <View style={{
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
      }}>
        {['Break timer', 'Operation timer'].map((mode, index) => (
          <TouchableOpacity
            onPress={() => {
              if (mode === 'Break timer' && isFocusTimerStarted) {
                handleToggleTimer();
              }
              setSelectedFocusTimerMode(mode)
            }}
            key={index} style={{
              borderRadius: dimensions.width * 0.6,
              width: dimensions.width * 0.4,
              backgroundColor: selectedFocusTimerMode === mode ? '#B08711' : '#D8D8D8',
              height: dimensions.height * 0.05,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: dimensions.width * 0.007,
            }}>
            <Text style={{
              alignItems: 'center',
              textAlign: 'center',
              color: selectedFocusTimerMode === mode ? 'white' : 'rgba(0, 0, 0, 0.5)',
              fontSize: dimensions.width * 0.04,
              fontWeight: 600,
              fontFamily: fontTTTravelsRegular,
              alignSelf: 'center',
            }}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{

      }} contentContainerStyle={{
        paddingBottom: dimensions.height * 0.16,
      }} showsVerticalScrollIndicator={false}>
        <View style={{
          flexDirection: 'row',
          marginTop: dimensions.height * 0.02,
          justifyContent: 'center',
          alignItems: 'center',
          alignSelf: 'center',
        }}>
          <View style={styles.timerViewsStyles}>
            <Text style={[styles.timerTextsStyles, {
              textAlign: 'right',
              alignSelf: 'flex-end',
            }]}
            >
              {hours}
            </Text>
          </View>
          <Text style={styles.timerColonStyles}>
            :
          </Text>

          <View style={styles.timerViewsStyles}>
            <Text style={[styles.timerTextsStyles, {
              textAlign: 'center',
              alignSelf: 'center',
            }]}
            >
              {minutes}
            </Text>
          </View>

          <Text style={styles.timerColonStyles}>
            :
          </Text>

          <View style={styles.timerViewsStyles}>
            <Text style={[styles.timerTextsStyles, {
              textAlign: 'left',
              alignSelf: 'flex-start',
            }]}
            >
              {seconds}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          // onPress={handleToggleTimer}
          onPress={() => {startProductivityTimer()}}
          style={{
            width: dimensions.height * 0.08,
            height: dimensions.height * 0.08,
            borderRadius: dimensions.width * 0.6,
            backgroundColor: !isFocusTimerStarted ? '#007AFF' : '#FF1515',
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: dimensions.height * 0.02,
          }}>
          {!isFocusTimerStarted ? (
            <PlayIcon size={dimensions.height * 0.06} color='white' />
          ) : (
            <PauseIcon size={dimensions.height * 0.06} color='white' />
          )}
        </TouchableOpacity>

        {selectedFocusTimerMode === 'Operation timer' ? (
          <>
            <Text style={{
              textAlign: 'left',
              fontWeight: 400,
              marginTop: dimensions.height * 0.05,
              fontSize: dimensions.width * 0.04,
              alignSelf: 'flex-start',
              color: '#000',
              fontFamily: fontTTTravelsRegular,
              paddingHorizontal: dimensions.width * 0.05,
            }}
            >
              Evaluating the productivity of the day
            </Text>

            {!prodOfTheDay || prodOfTheDay === null ? (
              <View style={{ width: dimensions.width, alignSelf: 'center', alignItems: 'center' }}>
                <Text style={{
                  textAlign: 'center',
                  fontFamily: fontTTTravelsRegular,
                  fontWeight: 700,
                  fontSize: dimensions.width * 0.045,
                  maxWidth: dimensions.width * 0.5,
                  alignSelf: 'center',
                  color: '#000',
                  marginTop: dimensions.height * 0.02,
                }}
                >
                  There's nothing here yet...
                </Text>

                <TouchableOpacity
                  onPress={() => setAddStatModalVisible(true)}
                  style={{
                    alignItems: 'center',
                    height: dimensions.height * 0.065,
                    justifyContent: 'center',
                    borderRadius: dimensions.width * 0.6,
                    backgroundColor: '#B08711',
                    alignSelf: 'center',
                    width: dimensions.height * 0.065,
                    marginTop: dimensions.height * 0.02,
                  }}>
                  <PlusIcon size={dimensions.height * 0.045} color='white' />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ width: dimensions.width, alignSelf: 'center', alignItems: 'center' }}>
                <Text style={[styles.aboveTextInputTextStyles, { marginTop: dimensions.height * 0.03 }]}>
                  Mood assessment
                </Text>

                <Slider
                  style={{ width: dimensions.width * 0.9, height: dimensions.height * 0.05, marginHorizontal: dimensions.width * 0.05 }}
                  value={prodOfTheDay.moodAssessment}
                  step={1}
                  maximumValue={100}
                  minimumTrackTintColor="#B08711"
                  maximumTrackTintColor="rgba(171, 135, 47, 0.3)"
                  minimumValue={0}
                  thumbTintColor="#B08711"
                  disabled={true}
                />

                <Text style={styles.aboveTextInputTextStyles}>
                  List of completed tasks
                </Text>

                {prodOfTheDay?.completedTasks?.length > 0 ? (
                  prodOfTheDay.completedTasks.map((task, index) => (
                    <View key={index} style={styles.itemOfListViewStyles}>
                      <Text style={styles.itemListTextStyles}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                      >
                        {task.title}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.itemOfListViewStyles}>
                    <Text style={styles.itemListTextStyles}
                      numberOfLines={2}
                      ellipsizeMode='tail'
                    >
                      No completed tasks yet
                    </Text>
                  </View>
                )}

                <Text style={styles.aboveTextInputTextStyles}>
                  Accomplishments
                </Text>

                {prodOfTheDay?.accomplishments?.length > 0 ? (
                  prodOfTheDay.accomplishments.map((accompl, index) => (
                    <View key={index} style={styles.itemOfListViewStyles}>
                      <Text style={styles.itemListTextStyles}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                      >
                        {accompl.title}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.itemOfListViewStyles}>
                    <Text style={styles.itemListTextStyles}
                      numberOfLines={2}
                      ellipsizeMode='tail'
                    >
                      No accomplishments yet
                    </Text>
                  </View>
                )}

                <Text style={styles.aboveTextInputTextStyles}>
                  Difficulties
                </Text>

                {prodOfTheDay?.difficulties?.length > 0 ? (
                  prodOfTheDay.difficulties.map((diff, index) => (
                    <View key={index} style={styles.itemOfListViewStyles}>
                      <Text style={styles.itemListTextStyles}
                        numberOfLines={2}
                        ellipsizeMode='tail'
                      >
                        {diff.title}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.itemOfListViewStyles}>
                    <Text style={styles.itemListTextStyles}
                      numberOfLines={2}
                      ellipsizeMode='tail'
                    >
                      No difficulties yet
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={{
              textAlign: 'center',
              fontFamily: fontTTTravelsRegular,
              fontSize: dimensions.width * 0.065,
              fontWeight: 700,
              alignSelf: 'flex-start',
              paddingHorizontal: dimensions.width * 0.05,
              color: '#000000',
              marginTop: dimensions.height * 0.06,
            }}>
              It's time to take a break!
            </Text>
            
            <Text style={{
              paddingHorizontal: dimensions.width * 0.05,
              fontFamily: fontTTTravelsRegular,
              fontSize: dimensions.width * 0.045,
              alignSelf: 'center',
              marginTop: dimensions.height * 0.01,
              fontWeight: 400,
              color: '#000000',
              textAlign: 'justify',
            }}>
              Rest is not a luxury, but a necessity. Allow yourself a break to gain strength, regain inspiration and move forward with new ideas. You deserve this time for yourself!
            </Text>
          </>
        )}
      </ScrollView>

      <Modal visible={addStatModalVisible} transparent={true} animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <SafeAreaView
            style={{
              width: dimensions.width,
              alignSelf: 'center',
              alignItems: 'center',
              backgroundColor: '#f6f6f6',
              paddingHorizontal: dimensions.width * 0.052,
              width: '100%',
              zIndex: 999,
              height: dimensions.height,
            }}
          >
            <View style={{
              width: dimensions.width * 0.9,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}>
              <TouchableOpacity
                style={{
                  borderRadius: dimensions.width * 0.6,
                  height: dimensions.height * 0.063,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#B08711',
                  width: dimensions.height * 0.063,
                }}
                onPress={() => {
                  setAddStatModalVisible(false);

                }}
              >
                <ArrowLeftIcon size={dimensions.width * 0.07} color='white' />
              </TouchableOpacity>

              <Text style={{
                alignSelf: 'flex-start',
                fontFamily: fontTTTravelsBlack,
                marginLeft: dimensions.width * 0.025,
                fontSize: dimensions.width * 0.05,
                maxWidth: dimensions.width * 0.7,
                color: '#000',
                textAlign: 'left',
              }}
              >
                Evaluating the productivity of the day
              </Text>
            </View>

            <ScrollView style={{
              alignSelf: 'center',
              width: dimensions.width,
            }} contentContainerStyle={{
              paddingBottom: dimensions.height * 0.15,
              alignItems: 'center',
            }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.aboveTextInputTextStyles, { marginTop: dimensions.height * 0.03 }]}>
                Mood assessment
              </Text>

              <Slider
                style={{ width: dimensions.width * 0.9, height: dimensions.height * 0.05, marginHorizontal: dimensions.width * 0.05 }}
                onValueChange={setMoodLevel}
                maximumValue={100}
                step={1}
                maximumTrackTintColor="rgba(171, 135, 47, 0.3)"
                value={moodLevel}
                minimumTrackTintColor="#B08711"
                minimumValue={0}
                thumbTintColor="#B08711"
              />

              <Text style={styles.aboveTextInputTextStyles}>
                List of completed tasks
              </Text>

              {listOfCompletedTasks.length > 0 && (
                listOfCompletedTasks.map((task, index) => (
                  <View key={index} style={styles.itemOfListViewStyles}>
                    <Text style={styles.itemListTextStyles}
                      numberOfLines={2}
                      ellipsizeMode='tail'
                    >
                      {task.title}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        const newList = listOfCompletedTasks.filter((_, i) => i !== index);
                        setListOfCompletedTasks(newList);
                      }}
                      style={styles.itemDeleteIconStyles}>
                      <XMarkIcon size={dimensions.height * 0.025} color='white' />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <TextInput
                placeholder="Title"
                value={completedTitle}
                onChangeText={setCompletedTitle}
                placeholderTextColor="#8A8A8E"
                style={[styles.textInputStyles, { fontWeight: completedTitle.length === 0 ? 600 : 700, }]}
              />

              <TouchableOpacity
                disabled={completedTitle.length === 0}
                onPress={() => {
                  const newCompletedTaskId = listOfCompletedTasks.length > 0 ? Math.max(...listOfCompletedTasks.map(comTask => comTask.id)) + 1 : 1;
                  const newCompletedTask = {
                    id: newCompletedTaskId + 1,
                    title: completedTitle,
                  };
                  setListOfCompletedTasks([...listOfCompletedTasks, newCompletedTask]);
                  setCompletedTitle('');
                }}
                style={[styles.modalPlusButton, { backgroundColor: completedTitle.length === 0 ? '#8A8A8E' : '#B08711', }]}>
                <PlusIcon size={dimensions.height * 0.045} color='white' />
              </TouchableOpacity>

              <Text style={styles.aboveTextInputTextStyles}>
                Accomplishments
              </Text>

              {accomplishmentsList.length > 0 && (
                accomplishmentsList.map((accompl, index) => (
                  <View key={index} style={styles.itemOfListViewStyles}>
                    <Text style={styles.itemListTextStyles}
                      numberOfLines={2}
                      ellipsizeMode='tail'
                    >
                      {accompl.title}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        const newList = accomplishmentsList.filter((_, i) => i !== index);
                        setAccomplishmentsList(newList);
                      }}
                      style={styles.itemDeleteIconStyles}>
                      <XMarkIcon size={dimensions.height * 0.025} color='white' />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <TextInput
                placeholder="Title"
                value={accomplishmentsTitle}
                onChangeText={setAccomplishmentsTitle}
                placeholderTextColor="#8A8A8E"
                style={[styles.textInputStyles, { fontWeight: accomplishmentsTitle.length === 0 ? 600 : 700, }]}
              />

              <TouchableOpacity
                disabled={accomplishmentsTitle.length === 0}
                onPress={() => {
                  const newAccomplishmentsId = accomplishmentsList.length > 0 ? Math.max(...accomplishmentsList.map(comTask => comTask.id)) + 1 : 1;

                  const newAccomplishmentTask = {
                    id: newAccomplishmentsId + 1,
                    title: accomplishmentsTitle,
                  };
                  setAccomplishmentsList([...accomplishmentsList, newAccomplishmentTask]);
                  setAccomplishmentsTitle('');
                }}
                style={[styles.modalPlusButton, { backgroundColor: accomplishmentsTitle.length === 0 ? '#8A8A8E' : '#B08711', }]}>
                <PlusIcon size={dimensions.height * 0.045} color='white' />
              </TouchableOpacity>

              <Text style={styles.aboveTextInputTextStyles}>
                Difficulties
              </Text>

              {difficultyList.length > 0 && (
                difficultyList.map((diff, index) => (
                  <View key={index} style={styles.itemOfListViewStyles}>
                    <Text style={styles.itemListTextStyles}
                      numberOfLines={2}
                      ellipsizeMode='tail'
                    >
                      {diff.title}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        const newDiffList = difficultyList.filter((_, i) => i !== index);
                        setDifficultyList(newDiffList);
                      }}
                      style={styles.itemDeleteIconStyles}>
                      <XMarkIcon size={dimensions.height * 0.025} color='white' />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <TextInput
                placeholder="Title"
                value={difficultyTitle}
                onChangeText={setDifficultyTitle}
                placeholderTextColor="#8A8A8E"
                style={[styles.textInputStyles, { fontWeight: accomplishmentsTitle.length === 0 ? 600 : 700, }]}
              />

              <TouchableOpacity
                disabled={difficultyTitle.length === 0}
                onPress={() => {
                  const newDiffId = difficultyList.length > 0 ? Math.max(...difficultyList.map(diff => diff.id)) + 1 : 1;

                  const newDiff = {
                    id: newDiffId + 1,
                    title: difficultyTitle,
                  };
                  setDifficultyList([...difficultyList, newDiff]);
                  setDifficultyTitle('');
                }}
                style={[styles.modalPlusButton, { backgroundColor: difficultyTitle.length === 0 ? '#8A8A8E' : '#B08711', }]}>
                <PlusIcon size={dimensions.height * 0.045} color='white' />
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              onPress={saveProductivityOfTheDay}
              disabled={listOfCompletedTasks.length === 0 && accomplishmentsList.length === 0 && difficultyList.length === 0}
              style={{
                justifyContent: 'center',
                backgroundColor: '#B08711',
                position: 'absolute',
                borderRadius: dimensions.width * 0.6,
                height: dimensions.height * 0.07,
                width: dimensions.width * 0.9,
                bottom: dimensions.height * 0.05,
                alignItems: 'center',
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
                Save
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={timerSettingsModalVisible} transparent={true} animationType="fade">
        <View style={{
          height: dimensions.height,
          position: 'absolute',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          width: dimensions.width,
          top: 0,
        }}>
        </View>

        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} accessible={false}>
          <View
            style={{
              paddingHorizontal: dimensions.width * 0.052,
              alignItems: 'center',
              height: dimensions.height,
              justifyContent: 'center',
              zIndex: 999,
              width: '100%',
              alignSelf: 'center',
              width: dimensions.width,
            }}
          >
            <View style={{
              width: dimensions.width * 0.9,
              paddingVertical: dimensions.height * 0.03,
              borderRadius: dimensions.width * 0.07,
              backgroundColor: '#f6f6f6',
            }}>
              <Image
                source={require('../assets/images/noHabitsImage.png')}
                style={{
                  width: dimensions.height * 0.15,
                  height: dimensions.height * 0.15,
                  alignSelf: 'center',
                }}
                resizeMode='contain'
              />

              <Text style={{
                paddingHorizontal: dimensions.width * 0.05,
                textAlign: 'center',
                fontSize: dimensions.width * 0.07,
                marginTop: dimensions.height * 0.01,
                alignSelf: 'center',
                color: '#000000',
                fontFamily: fontTTTravelsBlack,
              }}
              >
                Add your timer
              </Text>

              <TextInput
                placeholder="Time (hh:mm:ss)"
                keyboardType="numeric"
                maxLength={8}
                value={inputFocusTimerValue}
                onChangeText={handleFocusTimeInputChange}
                placeholderTextColor="#8A8A8E"
                style={[styles.textInputStyles, {
                  fontWeight: inputFocusTimerValue.length === 0 ? 600 : 700,
                  width: dimensions.width * 0.75,
                  alignSelf: 'center',
                }]}
              />

              <View style={{
                alignItems: 'center',
                alignSelf: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: dimensions.height * 0.02,
                width: dimensions.width * 0.75,
              }}>
                <TouchableOpacity
                  onPress={() => {
                    setTimerSettingsModalVisible(false);
                    setInputFocusTimerValue('');
                  }}
                  style={{
                    marginTop: dimensions.height * 0.007,
                    alignSelf: 'center',
                    borderRadius: dimensions.width * 0.6,
                    height: dimensions.height * 0.065,
                    justifyContent: 'center',
                    width: dimensions.width * 0.35,
                    backgroundColor: '#007AFF',
                    alignItems: 'center',
                  }}>
                  <Text style={{
                    alignSelf: 'center',
                    fontSize: dimensions.width * 0.045,
                    color: 'white',
                    alignItems: 'center',
                    fontFamily: fontTTTravelsBlack,
                    textAlign: 'center',
                  }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={inputFocusTimerValue.length < 8}
                  onPress={() => {
                    setFocusTimeLeft(inputFocusTimerValue);
                    setInputFocusTimerValue('');
                    setTimerSettingsModalVisible(false);
                  }}
                  style={{
                    alignSelf: 'center',
                    backgroundColor: '#01C743',
                    borderRadius: dimensions.width * 0.6,
                    justifyContent: 'center',
                    width: dimensions.width * 0.35,
                    marginTop: dimensions.height * 0.005,
                    height: dimensions.height * 0.065,
                    alignItems: 'center',
                  }}>
                  <Text style={{
                    textAlign: 'center',
                    color: 'white',
                    fontSize: dimensions.width * 0.045,
                    alignSelf: 'center',
                    fontFamily: fontTTTravelsBlack,
                    alignItems: 'center',
                  }}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (dimensions) => StyleSheet.create({
  textInputStyles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#000000',
    paddingVertical: dimensions.width * 0.035,
    height: dimensions.height * 0.06,
    width: dimensions.width * 0.9,
    paddingHorizontal: dimensions.width * 0.04,
    backgroundColor: 'transparent',
    borderRadius: dimensions.width * 0.7,
    fontFamily: fontTTTravelsRegular,
    alignItems: 'center',
    fontSize: dimensions.width * 0.041,
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
  },
  aboveTextInputTextStyles: {
    textAlign: 'left',
    fontSize: dimensions.width * 0.04,
    alignSelf: 'flex-start',
    color: '#000000',
    fontWeight: 300,
    paddingHorizontal: dimensions.width * 0.05,
    fontFamily: fontTTTravelsRegular,
    marginTop: dimensions.height * 0.02,
  },
  modalPlusButton: {
    marginTop: dimensions.height * 0.02,
    alignItems: 'center',
    height: dimensions.height * 0.065,
    borderRadius: dimensions.width * 0.6,
    alignSelf: 'center',
    width: dimensions.height * 0.065,
    justifyContent: 'center',
  },
  itemOfListViewStyles: {
    marginTop: dimensions.height * 0.01,
    width: dimensions.width * 0.9,
    height: dimensions.height * 0.06,
    shadowColor: '#000000',
    backgroundColor: '#fff',
    borderRadius: dimensions.width * 0.6,
    shadowOffset: {
      height: 2,
    },
    shadowOpacity: 0.2,
    width: dimensions.width * 0.9,
    shadowRadius: dimensions.width * 0.05,
    elevation: 5,
    paddingHorizontal: dimensions.width * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemListTextStyles: {
    fontSize: dimensions.width * 0.045,
    textAlign: 'left',
    maxWidth: dimensions.width * 0.7,
    fontFamily: fontTTTravelsRegular,
    maxWidth: dimensions.width * 0.7,
    alignSelf: 'flex-start',
    color: '#000',
    fontWeight: 600,
    marginLeft: dimensions.width * 0.025,
  },
  itemDeleteIconStyles: {
    width: dimensions.height * 0.03,
    alignItems: 'center',
    height: dimensions.height * 0.03,
    top: dimensions.height * 0.0135,
    backgroundColor: 'rgba(196, 196, 196, 1)',
    borderRadius: dimensions.width * 0.6,
    position: 'absolute',
    right: dimensions.width * 0.03,
    justifyContent: 'center',
  },

  timerTextsStyles: {
    fontFamily: fontTTTravelsRegular,
    fontWeight: 600,
    fontSize: dimensions.width * 0.15,
    alignItems: 'center',
    color: 'rgba(176, 135, 17, 1)',
  },

  timerViewsStyles: {
    borderRadius: dimensions.width * 0.04,
    height: dimensions.height * 0.111,
    width: dimensions.width * 0.27,
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    backgroundColor: 'white',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    paddingHorizontal: dimensions.width * 0.01,
  },

  timerColonStyles: {
    alignItems: 'center',
    textAlign: 'right',
    fontFamily: fontTTTravelsMedium,
    fontSize: dimensions.width * 0.15,
    color: 'rgba(176, 135, 17, 1)',
  },
});

export default FocusProductivityScreen;
