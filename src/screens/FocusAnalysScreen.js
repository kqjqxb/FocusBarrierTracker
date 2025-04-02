import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

const fontInterRegular = 'Inter18pt-Regular';
const fontTTTravelsBlack = 'TTTravels-Black';

const FocusAnalysScreen = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const styles = createStyles(dimensions);

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

  const getFocusWeeklyData = () => {
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
    const loadFocusStatuses = async () => {
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

    loadFocusStatuses();
  }, []);

  return (
    <SafeAreaView style={{
      justifyContent: 'flex-start',
      width: dimensions.width,
      position: 'relative',
      flex: 1,
      alignItems: 'center',
    }} >
      <Text style={{
        alignSelf: 'center',
        fontFamily: fontTTTravelsBlack,
        alignItems: 'center',
        fontSize: dimensions.width * 0.06,
        color: '#000000',
        textAlign: 'center',
      }}>
        Progress analysis
      </Text>

      {Object.keys(statusesByDay).length === 0 ? (
        <View style={{
          alignSelf: 'center',
          backgroundColor: 'white',
          marginTop: dimensions.height * 0.02,
          paddingHorizontal: dimensions.width * 0.05,
          borderRadius: dimensions.width * 0.05,
          width: dimensions.width * 0.9,
          shadowColor: '#000',
          paddingVertical: dimensions.height * 0.05,
          shadowOffset: {
            width: 0,
            height: dimensions.height * 0.01,
          },
          elevation: 5,
          shadowRadius: dimensions.width * 0.03,
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
            marginTop: dimensions.height * 0.013,
            fontFamily: fontTTTravelsBlack,
            alignSelf: 'center',
            fontSize: dimensions.width * 0.042,
            color: '#000000',
            alignItems: 'center',
          }}>
            There's nothing here yet
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.mainView}>
            <View style={styles.secondStatView}>
              <Text style={styles.habitsText}>
                Completed habits
              </Text>

              <Text
                style={styles.habitsCountText}>
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

          <View style={styles.mainView}>
            <View style={styles.secondStatView}>
              <Text style={styles.habitsText}>
                Not fulfilled habits
              </Text>

              <Text
                style={styles.habitsCountText}>
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

          <View style={{
            width: dimensions.width * 0.9,
            height: dimensions.height * 0.45,
          }}>
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
                    data={getFocusWeeklyData()}
                    width={dimensions.width * 1}
                    height={dimensions.height * 0.3}
                    chartConfig={{
                      backgroundColor: '#fff',
                      backgroundGradientFrom: '#fff',
                      backgroundGradientTo: '#fff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(176, 135, 17, ${opacity})`,
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

const createStyles = (dimensions) => StyleSheet.create({
  mainView: {
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    marginTop: dimensions.height * 0.01,
    paddingHorizontal: dimensions.width * 0.05,
    paddingVertical: dimensions.height * 0.015,
    maxWidth: dimensions.width * 0.9,
    borderRadius: dimensions.width * 0.04,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    width: dimensions.width * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: dimensions.height * 0.01,
    },
    shadowRadius: dimensions.width * 0.03,
    elevation: 5,
    shadowOpacity: 0.16,
  },
  secondStatView: {
    width: dimensions.width * 0.4,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: dimensions.height * 0.01,
  },
  habitsText: {
    fontFamily: fontInterRegular,
    color: '#000',
    fontSize: dimensions.width * 0.04,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontWeight: 300,
  },
  habitsCountText: {
    fontFamily: fontTTTravelsBlack,
    color: '#000',
    fontSize: dimensions.width * 0.15,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginTop: dimensions.height * 0.03,
  }
});

export default FocusAnalysScreen;
