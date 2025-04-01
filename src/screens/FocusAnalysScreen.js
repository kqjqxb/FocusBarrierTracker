import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, LineChart } from 'react-native-chart-kit';

const fontInterRegular = 'Inter18pt-Regular';
const fontTTTravelsRegular = 'TTTravels-Regular';
const fontTTTravelsBlack = 'TTTravels-Black';

const FocusAnalysScreen = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [inProgressCount, setInProgressCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [statusesByDay, setStatusesByDay] = useState({});
  const homeScrollRef = useRef(null);

  const [totalDoneCount, setTotalDoneCount] = useState(0);
  const [totalNotFullfilledCount, setTotalNotFullfilledCount] = useState(0);

  useEffect(() => {
    const loadFocusHabitsCounts = async () => {
      try {
        const focusHabitsData = await AsyncStorage.getItem('focusHabits');
        const focusHabits = focusHabitsData ? JSON.parse(focusHabitsData) : [];
        const totalDone = focusHabits.reduce(
          (sum, habit) => sum + (habit.doneDays ? habit.doneDays.length : 0),
          0
        );
        const totalNotFullfilled = focusHabits.reduce(
          (sum, habit) => sum + (habit.notFullfilledDays ? habit.notFullfilledDays.length : 0),
          0
        );
        setTotalDoneCount(totalDone);
        setTotalNotFullfilledCount(totalNotFullfilled);
      } catch (error) {
        console.error("Error loading focus habits counts:", error);
      }
    };
    loadFocusHabitsCounts();
  }, []);

  const getWeeklyData = () => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dataArray = weekdays.map(day => statusesByDay[day] || 0);
    const barColors = ['#B08711', '#B08711', '#B08711', '#B08711', '#B08711', '#B08711', '#B08711'];
    return {
      labels: weekdays,
      datasets: [
        {
          data: dataArray,
          colors: barColors.map(color => () => color),
        },
      ],
    };
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const existingProjects = await AsyncStorage.getItem('projects');
        if (existingProjects) {
          const projects = JSON.parse(existingProjects);
          const pendingProjects = projects.filter(project => project.status === 'Pending');
          const completedProjects = projects.filter(project => project.status === 'Completed');
          const inProgressProjects = projects.filter(project => project.status === 'In Progress');
          setPendingCount(pendingProjects.length);
          setCompletedCount(completedProjects.length);
          setInProgressCount(inProgressProjects.length);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    loadProjects();
  }, []);

  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const storedStatuses = await AsyncStorage.getItem('updatedStatuses');
        const statuses = storedStatuses ? JSON.parse(storedStatuses) : [];
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const countsByWeekday = statuses.reduce((acc, dateStr) => {
          const date = new Date(dateStr);
          const weekdayIndex = (date.getDay() + 6) % 7;
          const dayLabel = weekdays[weekdayIndex];
          acc[dayLabel] = (acc[dayLabel] || 0) + 1;
          return acc;
        }, {});
        setStatusesByDay(countsByWeekday);
      } catch (error) {
        console.error('Error loading updated statuses:', error);
      }
    };

    loadStatuses();
  }, []);

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
        fontFamily: fontTTTravelsBlack,
        fontSize: dimensions.width * 0.06,
        alignItems: 'center',
        alignSelf: 'center',
        color: '#000000',
      }}>
        Progress analysis
      </Text>

      {Object.keys(statusesByDay).length === 0 ? (
        <View style={{
          paddingVertical: dimensions.height * 0.05,
          backgroundColor: 'white',
          marginTop: dimensions.height * 0.02,
          paddingHorizontal: dimensions.width * 0.05,
          alignSelf: 'center',
          width: dimensions.width * 0.9,
          shadowColor: '#000',
          borderRadius: dimensions.width * 0.05,
          shadowOffset: {
            width: 0,
            height: dimensions.height * 0.01,
          },
          shadowRadius: dimensions.width * 0.03,
          elevation: 5,
          shadowOpacity: 0.16,
        }}>
          <Image
            source={require('../assets/images/noHabitsImage.png')}
            style={{
              width: dimensions.height * 0.55,
              height: dimensions.height * 0.2,
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
          }}>
            There's nothing here yet
          </Text>
        </View>
      ) : (
        <>
          <View style={{
            width: dimensions.width * 0.9,
            backgroundColor: '#fff',
            marginTop: dimensions.height * 0.01,
            paddingHorizontal: dimensions.width * 0.05,
            paddingVertical: dimensions.height * 0.015,
            maxWidth: dimensions.width * 0.9,
            borderRadius: dimensions.width * 0.04,
            alignSelf: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: dimensions.height * 0.01,
            },
            shadowRadius: dimensions.width * 0.03,
            elevation: 5,
            shadowOpacity: 0.16,
          }}>
            <View style={{
              width: dimensions.width * 0.4,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: dimensions.height * 0.01,
            }}>
              <Text
                style={{
                  fontFamily: fontInterRegular,
                  color: '#000',
                  fontSize: dimensions.width * 0.04,
                  textAlign: 'left',
                  alignSelf: 'flex-start',
                  fontWeight: 300,
                }}>
                Completed habits
              </Text>

              <Text
                style={{
                  fontFamily: fontTTTravelsBlack,
                  color: '#000',
                  fontSize: dimensions.width * 0.15,
                  textAlign: 'left',
                  alignSelf: 'flex-start',
                  marginTop: dimensions.height * 0.03,
                }}>
                {totalDoneCount}
              </Text>
            </View>

            <View style={{
              width: dimensions.width * 0.4,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Image
                source={require('../assets/images/noHabitsImage.png')}
                style={{
                  width: dimensions.width * 0.3,
                  height: dimensions.width * 0.3,
                  alignSelf: 'flex-end',
                }}
                resizeMode='contain'
              />
            </View>
          </View>

          <View style={{
            width: dimensions.width * 0.9,
            backgroundColor: '#fff',
            marginTop: dimensions.height * 0.01,
            paddingHorizontal: dimensions.width * 0.05,
            paddingVertical: dimensions.height * 0.015,
            maxWidth: dimensions.width * 0.9,
            borderRadius: dimensions.width * 0.04,
            alignSelf: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: dimensions.height * 0.01,
            },
            shadowRadius: dimensions.width * 0.03,
            elevation: 5,
            shadowOpacity: 0.16,
          }}>
            <View style={{
              width: dimensions.width * 0.4,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: dimensions.height * 0.01,
            }}>
              <Text
                style={{
                  fontFamily: fontInterRegular,
                  color: '#000',
                  fontSize: dimensions.width * 0.04,
                  textAlign: 'left',
                  alignSelf: 'flex-start',
                  fontWeight: 300,
                }}>
                Not fulfilled habits
              </Text>

              <Text
                style={{
                  fontFamily: fontTTTravelsBlack,
                  color: '#000',
                  fontSize: dimensions.width * 0.15,
                  textAlign: 'left',
                  alignSelf: 'flex-start',
                  marginTop: dimensions.height * 0.03,
                }}>
                {totalNotFullfilledCount}
              </Text>
            </View>

            <View style={{
              width: dimensions.width * 0.4,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Image
                source={require('../assets/images/noHabitsImage.png')}
                style={{
                  width: dimensions.width * 0.3,
                  height: dimensions.width * 0.3,
                  alignSelf: 'flex-end',
                }}
                resizeMode='contain'
              />
            </View>
          </View>
          
          <View>

          <ScrollView
            horizontal={true}
            ref={homeScrollRef}
            scrollEnabled={false}
            contentContainerStyle={{ alignItems: 'center', marginTop: -dimensions.height * 0.02, }}
            onContentSizeChange={() => homeScrollRef.current && homeScrollRef.current.scrollToEnd({ animated: false })}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: dimensions.width * 0.05,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: dimensions.height * 0.005,
              },
              shadowRadius: dimensions.width * 0.03,
              elevation: 5,
              shadowOpacity: 0.05,
              width: dimensions.width * 0.9,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <View style={{
                transform: [{ scale: 0.9 }],
              }}>
                <Text
                  style={{
                    fontFamily: fontInterRegular,
                    color: '#000',
                    fontSize: dimensions.width * 0.04,
                    textAlign: 'left',
                    alignSelf: 'flex-start',
                    fontWeight: 300,
                    marginLeft: dimensions.width * 0.05,
                    marginBottom: dimensions.height * 0.01,
                  }}>
                  Habit status update activity
                </Text>
                <LineChart
                  data={getWeeklyData()}
                  width={dimensions.width * 1}
                  height={dimensions.height * 0.3}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    // Set the line color to #B08711
                    color: (opacity = 1) => `rgba(176, 135, 17, ${opacity})`,
                    // Set the label color to black
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: dimensions.width * 0.05,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                    },
                    propsForVerticalLabels: {
                      fontSize: dimensions.width * 0.03,
                      fontFamily: fontTTTravelsBlack,
                      color: '#000',
                    },
                    propsForHorizontalLabels: {
                      dx: -dimensions.width * 0.05,
                    },
                  }}
                  bezier
                  verticalLabelRotation={0}
                  fromZero
                />
              </View>
            </View>
          </ScrollView>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default FocusAnalysScreen;
