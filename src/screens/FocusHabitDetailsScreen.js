import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    SafeAreaView,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ArrowLeftIcon, } from 'react-native-heroicons/solid';


const fontInterRegular = 'Inter18pt-Regular';

const fontTTTravelsRegular = 'TTTravels-Regular';
const fontTTTravelsBlack = 'TTTravels-Black';
const fontTTTravelsBold = 'TTTravels-Bold';

const FocusHabitDetailsScreen = ({ setSelectedScreen, selectedFocusHabit, setSelectedFocusHabit, focusHabits, setFocusHabits }) => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [today, setToday] = useState(getFormattedDate());
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayItemSize = (dimensions.width * 0.9) / 7;

    const firstDayIndex = (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 6) % 7;
    const gridDays = [...Array(firstDayIndex).fill(null), ...daysArray];

    function getFormattedDate() {
        const d = new Date();
        return `${d.toLocaleString('en-US', { month: 'long' })}, ${d.getFullYear()}`;
    }

    useEffect(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msTillMidnight = tomorrow.getTime() - now.getTime();
        const timer = setTimeout(() => {
            setToday(getFormattedDate());
        }, msTillMidnight);
        return () => clearTimeout(timer);
    }, [today]);

    const formatFocusBarTime = (time) => {
        const date = new Date(time);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const updateDayStatus = async (markType) => {
        try {
            const now = new Date();
            const currentMonth = now.getMonth();
            let storedHabits = await AsyncStorage.getItem('focusHabits');
            storedHabits = storedHabits ? JSON.parse(storedHabits) : [];

            storedHabits = storedHabits.map(habit => {
                if (!habit.lastResetMonth || habit.lastResetMonth !== currentMonth) {
                    return { ...habit, doneDays: [], notFullfilledDays: [], lastResetMonth: currentMonth };
                }
                return habit;
            });

            const habitIndex = storedHabits.findIndex(habit => habit.id === selectedFocusHabit.id);
            if (habitIndex !== -1) {
                const habit = storedHabits[habitIndex];
                if (markType === 'done') {
                    habit.notFullfilledDays = habit.notFullfilledDays.filter(day => day !== selectedDay);
                    if (!habit.doneDays.includes(selectedDay)) {
                        habit.doneDays.push(selectedDay);
                    }
                } else if (markType === 'notFulfilled') {
                    habit.doneDays = habit.doneDays.filter(day => day !== selectedDay);
                    if (!habit.notFullfilledDays.includes(selectedDay)) {
                        habit.notFullfilledDays.push(selectedDay);
                    }
                }
                storedHabits[habitIndex] = habit;
                await AsyncStorage.setItem('focusHabits', JSON.stringify(storedHabits));

                const updatedHabit = storedHabits.find(habit => habit.id === selectedFocusHabit.id);
                setSelectedFocusHabit(updatedHabit);
            }
        } catch (error) {
            console.error('Error updating day status:', error);
        }
        setModalVisible(false);
    };

    const handleDeleteFocusHabit = async (removeHabit) => {
        try {
            // Retrieve the latest habits directly from AsyncStorage
            let storedHabits = await AsyncStorage.getItem('focusHabits');
            storedHabits = storedHabits ? JSON.parse(storedHabits) : [];
            
            const updatedFocusHabits = storedHabits.filter(fHab => fHab.id !== removeHabit.id);
            await AsyncStorage.setItem('focusHabits', JSON.stringify(updatedFocusHabits));
            
            setSelectedScreen('Home');
            setFocusHabits(updatedFocusHabits);
            setSelectedFocusHabit(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to remove habit from focusHabits.');
        }
    };

    return (
        <SafeAreaView style={{
            alignItems: 'center',
            flex: 1,
            position: 'relative',
            width: '100%',
            zIndex: 1,
            width: dimensions.width,
            alignSelf: 'center',
        }} >
            <View style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                width: dimensions.width * 0.9,
                paddingBottom: dimensions.height * 0.01,
            }}>
                <TouchableOpacity
                    style={{
                        borderRadius: dimensions.width * 0.6,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: dimensions.height * 0.063,
                        backgroundColor: '#B08711',
                        height: dimensions.height * 0.063,
                    }}
                    onPress={() => {
                        setSelectedScreen('Home');

                    }}
                >
                    <ArrowLeftIcon size={dimensions.width * 0.07} color='white' />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        borderRadius: dimensions.width * 0.6,
                        height: dimensions.height * 0.063,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: dimensions.height * 0.063,
                    }}
                    onPress={() => {
                        handleDeleteFocusHabit(selectedFocusHabit);
                        // setSelectedScreen('Home');
                    }}
                >
                    <Image
                        source={require('../assets/icons/removeIcon.png')}
                        style={{
                            width: dimensions.height * 0.063,
                            height: dimensions.height * 0.63,
                        }}
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={{
                height: dimensions.height,
            }} showsVerticalScrollIndicator={false}>
                <Image
                    source={require('../assets/images/noHabitsImage.png')}
                    style={{
                        width: dimensions.width * 0.4,
                        height: dimensions.width * 0.4,
                        alignSelf: 'center',
                    }}
                    resizeMode='contain'
                />

                <View style={{
                    width: dimensions.width,
                    alignItems: 'center',
                    alignSelf: 'center',
                    marginTop: dimensions.height * 0.02,
                    marginBottom: dimensions.height * 0.25,
                }}>
                    <View style={{
                        paddingHorizontal: dimensions.width * 0.02,
                        marginTop: dimensions.height * 0.01,
                        alignItems: 'center',
                        width: dimensions.width * 0.9,
                    }}>
                        <Text style={{
                            textAlign: 'center',
                            fontFamily: fontTTTravelsBlack,
                            fontSize: dimensions.width * 0.06,
                            alignItems: 'center',
                            alignSelf: 'center',
                            color: '#000',
                        }}
                        >
                            {selectedFocusHabit.title}
                        </Text>

                        <Text style={{
                            textAlign: 'left',
                            fontFamily: fontTTTravelsRegular,
                            fontSize: dimensions.width * 0.035,
                            alignSelf: 'flex-start',
                            color: '#000',
                            fontWeight: 400,
                            marginTop: dimensions.height * 0.02,
                        }}
                        >
                            Description
                        </Text>

                        <Text style={{
                            textAlign: 'flex-start',
                            marginTop: dimensions.height * 0.006,
                            fontFamily: fontTTTravelsRegular,
                            fontSize: dimensions.width * 0.05,
                            alignSelf: 'left',
                            color: '#000',
                            fontWeight: 600,
                        }}
                        >
                            {selectedFocusHabit.description}
                        </Text>


                        <Text
                            style={{
                                fontFamily: fontInterRegular,
                                fontWeight: 500,
                                fontSize: dimensions.width * 0.037,
                                color: '#999999',
                                opacity: 0.7,
                                marginTop: dimensions.height * 0.025,
                                alignSelf: 'flex-start',
                            }}
                        >
                            Time
                        </Text>

                        <Text style={{
                            fontWeight: 600,
                            marginTop: dimensions.height * 0.006,
                            fontFamily: fontTTTravelsRegular,
                            fontSize: dimensions.width * 0.045,
                            alignSelf: 'left',
                            textAlign: 'flex-start',
                            color: '#000',
                        }}
                        >
                            {formatFocusBarTime(selectedFocusHabit.time)}
                        </Text>

                        <View style={{
                            marginTop: dimensions.height * 0.02,
                            alignItems: 'center',
                            flexDirection: 'row',
                            alignSelf: 'flex-start',
                            justifyContent: 'flex-start',
                        }}>
                            <View style={{
                                alignItems: 'center',
                                height: dimensions.height * 0.055,
                                paddingHorizontal: dimensions.width * 0.04,
                                borderRadius: dimensions.width * 0.6,
                                justifyContent: 'center',
                                backgroundColor: '#D8D8D8',
                            }}>
                                <Text style={{
                                    color: 'rgba(0, 0, 0, 0.5)',
                                    textAlign: 'left',
                                    fontWeight: 500,
                                    fontFamily: fontTTTravelsRegular,
                                    alignSelf: 'flex-start',
                                    fontSize: dimensions.width * 0.03,
                                }}
                                >
                                    {selectedFocusHabit.periodicity}
                                </Text>
                            </View>

                            <View style={{
                                alignItems: 'center',
                                height: dimensions.height * 0.055,
                                marginLeft: dimensions.width * 0.01,
                                borderRadius: dimensions.width * 0.6,
                                justifyContent: 'center',
                                backgroundColor: '#D8D8D8',
                                paddingHorizontal: dimensions.width * 0.025,
                            }}>
                                <Text style={{
                                    textAlign: 'left',
                                    fontWeight: 500,
                                    fontSize: dimensions.width * 0.03,
                                    color: 'rgba(0, 0, 0, 0.5)',
                                    alignSelf: 'flex-start',
                                    fontFamily: fontTTTravelsRegular,
                                }}
                                >
                                    {selectedFocusHabit.reminder}
                                </Text>
                            </View>
                        </View>

                        <Text
                            style={{
                                marginTop: dimensions.height * 0.025,
                                fontSize: dimensions.width * 0.037,
                                color: '#999999',
                                opacity: 0.7,
                                fontWeight: 500,
                                alignSelf: 'flex-start',
                                fontFamily: fontInterRegular,
                            }}
                        >
                            Progress
                        </Text>

                        <Text style={{
                            marginTop: dimensions.height * 0.005,
                            fontSize: dimensions.width * 0.06,
                            alignSelf: 'flex-start',
                            color: '#B08711',
                            textAlign: 'left',
                            fontFamily: fontTTTravelsBlack,
                        }}
                        >
                            {today}
                        </Text>

                        <View style={{
                            flexWrap: 'wrap',
                            width: dimensions.width * 0.9,
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'space-between',
                            marginTop: dimensions.height * 0.01,
                        }}>
                            {daysArray.map((day, index) => (
                                <View key={index} style={{
                                    backgroundColor: selectedFocusHabit.doneDays.includes(day) && !selectedFocusHabit.notFullfilledDays.includes(day) ? '#01C743'
                                        : !selectedFocusHabit.doneDays.includes(day) && selectedFocusHabit.notFullfilledDays.includes(day) ? '#FF1515' : '#D8D8D8',
                                    borderRadius: dimensions.width * 0.6,
                                    height: dayItemSize * 0.9,
                                    marginRight: index % 7 === 6 ? 0 : dimensions.width * 0.01,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: dimensions.height * 0.01,
                                    width: dayItemSize * 0.9,
                                }}>
                                    <Text style={{
                                        color: '#000000',
                                        textAlign: 'center',
                                        fontSize: dayItemSize * 0.45,
                                        fontFamily: fontTTTravelsBlack,
                                    }}>
                                        {day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(true);
                            }}
                            style={{
                                alignItems: 'center',
                                borderRadius: dimensions.width * 0.6,
                                height: dimensions.height * 0.065,
                                justifyContent: 'center',
                                marginTop: dimensions.height * 0.02,
                                width: dimensions.width * 0.9,
                                backgroundColor: '#B08711',
                            }}>
                            <Text style={{
                                alignSelf: 'center',
                                fontSize: dimensions.width * 0.045,
                                alignItems: 'center',
                                fontFamily: fontTTTravelsBlack,
                                textAlign: 'center',
                                color: 'white',
                            }}
                            >
                                Mark as
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal visible={modalVisible} transparent={true} animationType="fade">
                <View onPress={() => { setModalVisible(false) }} style={{
                    height: dimensions.height,
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 999,
                    width: dimensions.width,
                    top: 0,
                }}>
                </View>

                <TouchableWithoutFeedback onPress={() => { setModalVisible(false) }}>
                    <View
                        style={{
                            width: dimensions.width,
                            alignItems: 'center',
                            zIndex: 999,
                            width: '100%',
                            paddingHorizontal: dimensions.width * 0.052,
                            alignSelf: 'center',
                            height: dimensions.height,
                        }}
                    >
                        <View style={{
                            width: dimensions.width,
                            borderTopRightRadius: dimensions.width * 0.07,
                            borderTopLeftRadius: dimensions.width * 0.07,
                            backgroundColor: '#fff',
                            position: 'absolute',
                            height: dimensions.height * 0.3,
                            bottom: 0,
                        }}>
                            <Text style={{
                                marginTop: dimensions.height * 0.05,
                                textAlign: 'left',
                                fontSize: dimensions.width * 0.045,
                                fontFamily: fontTTTravelsBlack,
                                alignSelf: 'flex-start',
                                color: '#000000',
                                paddingHorizontal: dimensions.width * 0.05,
                            }}
                            >
                                Mark as
                            </Text>
                            <TouchableOpacity
                                onPress={() => updateDayStatus('done')}
                                style={{
                                    alignItems: 'center',
                                    borderRadius: dimensions.width * 0.6,
                                    height: dimensions.height * 0.065,
                                    justifyContent: 'center',
                                    width: dimensions.width * 0.9,
                                    backgroundColor: '#01C743',
                                    marginTop: dimensions.height * 0.007,
                                    alignSelf: 'center',
                                }}>
                                <Text style={{
                                    color: 'white',
                                    fontSize: dimensions.width * 0.045,
                                    alignItems: 'center',
                                    fontFamily: fontTTTravelsBlack,
                                    alignSelf: 'center',
                                    textAlign: 'center',
                                }}
                                >
                                    Done
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => updateDayStatus('notFulfilled')}
                                style={{
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    borderRadius: dimensions.width * 0.6,
                                    justifyContent: 'center',
                                    width: dimensions.width * 0.9,
                                    marginTop: dimensions.height * 0.005,
                                    backgroundColor: '#FF1515',
                                    height: dimensions.height * 0.065,
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
                                    Not fulfilled
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

export default FocusHabitDetailsScreen;
