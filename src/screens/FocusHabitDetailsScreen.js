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
    StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ArrowLeftIcon, } from 'react-native-heroicons/solid';

const fontTTTravelsRegular = 'TTTravels-Regular';
const fontTTTravelsBlack = 'TTTravels-Black';

const FocusHabitDetailsScreen = ({ setSelectedScreen, selectedFocusHabit, setSelectedFocusHabit, focusHabits, setFocusHabits }) => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const styles = createStyles(dimensions);

    const [today, setToday] = useState(getFormattedDate());
    const [modalVisible, setModalVisible] = useState(false);
    const [deleteHabitModalVisible, setDeleteHabitModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayItemSize = (dimensions.width * 0.9) / 7;

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

                let updatedStatuses = await AsyncStorage.getItem('updatedStatuses');
                updatedStatuses = updatedStatuses ? JSON.parse(updatedStatuses) : [];
                updatedStatuses.push(new Date().toISOString());
                await AsyncStorage.setItem('updatedStatuses', JSON.stringify(updatedStatuses));

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
            alignSelf: 'center',
            flex: 1,
            position: 'relative',
            alignItems: 'center',
            width: '100%',
            width: dimensions.width,
            zIndex: 1,
        }} >
            <View style={{
                paddingBottom: dimensions.height * 0.01,
                justifyContent: 'space-between',
                alignItems: 'center',
                width: dimensions.width * 0.9,
                flexDirection: 'row',
            }}>
                <TouchableOpacity
                    style={{
                        height: dimensions.height * 0.063,
                        justifyContent: 'center',
                        borderRadius: dimensions.width * 0.6,
                        backgroundColor: '#B08711',
                        alignItems: 'center',
                        width: dimensions.height * 0.063,
                    }}
                    onPress={() => {
                        setSelectedScreen('Home');

                    }}
                >
                    <ArrowLeftIcon size={dimensions.width * 0.07} color='white' />
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        width: dimensions.height * 0.063,
                        height: dimensions.height * 0.063,
                        borderRadius: dimensions.width * 0.6,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => {
                        setDeleteHabitModalVisible(true);
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
                    marginTop: dimensions.height * 0.02,
                    alignItems: 'center',
                    alignSelf: 'center',
                    marginBottom: dimensions.height * 0.25,
                }}>
                    <View style={{
                        paddingHorizontal: dimensions.width * 0.02,
                        marginTop: dimensions.height * 0.01,
                        alignItems: 'center',
                        width: dimensions.width * 0.9,
                    }}>
                        <Text style={{
                            fontSize: dimensions.width * 0.06,
                            fontFamily: fontTTTravelsBlack,
                            alignItems: 'center',
                            color: '#000',
                            alignSelf: 'center',
                            textAlign: 'center',
                        }}
                        >
                            {selectedFocusHabit.title}
                        </Text>

                        <Text style={styles.labelTextStyles}>
                            Description
                        </Text>

                        <Text style={{
                            fontFamily: fontTTTravelsRegular,
                            marginTop: dimensions.height * 0.006,
                            color: '#000',
                            fontWeight: 600,
                            fontSize: dimensions.width * 0.05,
                            alignSelf: 'left',
                            textAlign: 'flex-start',
                        }}
                        >
                            {selectedFocusHabit.description}
                        </Text>

                        <Text style={styles.labelTextStyles}>
                            Time
                        </Text>

                        <Text style={{
                            alignSelf: 'left',
                            marginTop: dimensions.height * 0.006,
                            textAlign: 'flex-start',
                            fontSize: dimensions.width * 0.045,
                            fontWeight: 600,
                            fontFamily: fontTTTravelsRegular,
                            color: '#000',
                        }}
                        >
                            {formatFocusBarTime(selectedFocusHabit.time)}
                        </Text>

                        <View style={{
                            marginTop: dimensions.height * 0.02,
                            alignSelf: 'flex-start',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                        }}>
                            <View style={[styles.periodicityReminderViewStyles, { marginRight: dimensions.width * 0.01 }]}>
                                <Text style={styles.periodicityReminderTextStyles}>
                                    {selectedFocusHabit.periodicity}
                                </Text>
                            </View>

                            <View style={styles.periodicityReminderViewStyles}>
                                <Text style={styles.periodicityReminderTextStyles}>
                                    {selectedFocusHabit.reminder}
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.labelTextStyles}>
                            Progress
                        </Text>

                        <Text style={{
                            alignSelf: 'flex-start',
                            fontSize: dimensions.width * 0.06,
                            color: '#B08711',
                            textAlign: 'left',
                            marginTop: dimensions.height * 0.005,
                            fontFamily: fontTTTravelsBlack,
                        }}
                        >
                            {today}
                        </Text>

                        <View style={{
                            flexWrap: 'wrap',
                            marginTop: dimensions.height * 0.01,
                            width: dimensions.width * 0.9,
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'space-between',
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
                                width: dimensions.width * 0.9,
                                backgroundColor: '#B08711',
                                borderRadius: dimensions.width * 0.6,
                                height: dimensions.height * 0.065,
                                justifyContent: 'center',
                                marginTop: dimensions.height * 0.02,
                                alignItems: 'center',
                            }}>
                            <Text style={{
                                fontFamily: fontTTTravelsBlack,
                                alignSelf: 'center',
                                color: 'white',
                                fontSize: dimensions.width * 0.045,
                                textAlign: 'center',
                                alignItems: 'center',
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
                    width: dimensions.width,
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 999,
                    height: dimensions.height,
                    top: 0,
                }}>
                </View>

                <TouchableWithoutFeedback onPress={() => { setModalVisible(false) }}>
                    <View
                        style={{
                            height: dimensions.height,
                            width: dimensions.width,
                            alignItems: 'center',
                            zIndex: 999,
                            paddingHorizontal: dimensions.width * 0.052,
                            alignSelf: 'center',
                            width: '100%',
                        }}
                    >
                        <View style={{
                            width: dimensions.width,
                            height: dimensions.height * 0.3,
                            borderTopRightRadius: dimensions.width * 0.07,
                            borderTopLeftRadius: dimensions.width * 0.07,
                            position: 'absolute',
                            backgroundColor: '#fff',
                            bottom: 0,
                        }}>
                            <View style={{
                                width: dimensions.width * 0.17,
                                alignSelf: 'center',
                                borderRadius: dimensions.width * 0.6,
                                backgroundColor: '#000',
                                position: 'absolute',
                                top: dimensions.height * 0.01,
                                zIndex: 999,
                                borderColor: '#000',
                                height: dimensions.height * 0.004,
                            }}>
                            </View>

                            <Text style={{
                                color: '#000000',
                                marginTop: dimensions.height * 0.05,
                                textAlign: 'left',
                                fontSize: dimensions.width * 0.045,
                                fontFamily: fontTTTravelsBlack,
                                alignSelf: 'flex-start',
                                paddingHorizontal: dimensions.width * 0.05,
                            }}
                            >
                                Mark as
                            </Text>
                            <TouchableOpacity
                                onPress={() => updateDayStatus('done')}
                                style={[styles.modalMarkAsButtonsStyles, {
                                    backgroundColor: '#01C743',
                                }]}>
                                <Text style={styles.modalMarkAsTextStyles}>
                                    Done
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => updateDayStatus('notFulfilled')}
                                style={[styles.modalMarkAsButtonsStyles, {
                                    backgroundColor: '#FF1515',
                                }]}>
                                <Text style={styles.modalMarkAsTextStyles}>
                                    Not fulfilled
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <Modal visible={deleteHabitModalVisible} transparent={true} animationType="fade">
                <View style={{
                    top: 0,
                    position: 'absolute',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    width: dimensions.width,
                    zIndex: 999,
                    height: dimensions.height,
                }}>
                </View>

                <TouchableWithoutFeedback onPress={() => { setDeleteHabitModalVisible(false) }}>
                    <View
                        style={{
                            paddingHorizontal: dimensions.width * 0.052,
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 999,
                            width: '100%',
                            width: dimensions.width,
                            alignSelf: 'center',
                            height: dimensions.height,
                        }}
                    >
                        <View style={{
                            backgroundColor: '#fff',
                            paddingVertical: dimensions.height * 0.03,
                            borderRadius: dimensions.width * 0.07,
                            width: dimensions.width * 0.9,
                        }}>
                            <Image
                                source={require('../assets/images/focusTrashImage.png')}
                                style={{
                                    width: dimensions.height * 0.08,
                                    height: dimensions.height * 0.08,
                                    alignSelf: 'center',
                                }}
                                resizeMode='contain'
                            />

                            <Text style={{
                                alignSelf: 'center',
                                textAlign: 'center',
                                fontSize: dimensions.width * 0.07,
                                paddingHorizontal: dimensions.width * 0.05,
                                fontFamily: fontTTTravelsBlack,
                                color: '#000000',
                                marginTop: dimensions.height * 0.01,
                            }}
                            >
                                Delete
                            </Text>

                            <Text style={{
                                marginTop: dimensions.height * 0.01,
                                paddingHorizontal: dimensions.width * 0.03,
                                alignSelf: 'center',
                                fontSize: dimensions.width * 0.04,
                                fontFamily: fontTTTravelsRegular,
                                fontWeight: 400,
                                textAlign: 'center',
                                color: '#000000',
                            }}
                            >
                                Are you sure you want to delete this?
                            </Text>

                            <View style={{
                                width: dimensions.width * 0.75,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignSelf: 'center',
                                marginTop: dimensions.height * 0.02,
                            }}>
                                <TouchableOpacity
                                    onPress={() => handleDeleteFocusHabit(selectedFocusHabit)}
                                    style={[styles.modalDeleteButtonsStyles, {
                                        backgroundColor: '#FF1515',
                                    }]}>
                                    <Text style={{
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        color: 'white',
                                        fontSize: dimensions.width * 0.045,
                                        alignSelf: 'center',
                                        fontFamily: fontTTTravelsBlack,
                                    }}
                                    >
                                        Delete
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setDeleteHabitModalVisible(false)}

                                    style={[styles.modalDeleteButtonsStyles, {
                                        backgroundColor: '#007AFF',
                                    }]}>
                                    <Text style={{
                                        color: 'white',
                                        textAlign: 'center',
                                        fontSize: dimensions.width * 0.045,
                                        alignItems: 'center',
                                        fontFamily: fontTTTravelsBlack,
                                        alignSelf: 'center',
                                    }}
                                    >
                                        Cancel
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
    labelTextStyles: {
        marginTop: dimensions.height * 0.02,
        fontSize: dimensions.width * 0.035,
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontFamily: fontTTTravelsRegular,
        color: '#000',
        fontWeight: 400,
    },
    modalMarkAsButtonsStyles: {
        alignSelf: 'center',
        alignItems: 'center',
        borderRadius: dimensions.width * 0.6,
        height: dimensions.height * 0.065,
        width: dimensions.width * 0.9,
        marginTop: dimensions.height * 0.007,
        justifyContent: 'center',
    },
    modalMarkAsTextStyles: {
        textAlign: 'center',
        color: 'white',
        fontSize: dimensions.width * 0.045,
        alignItems: 'center',
        alignSelf: 'center',
        fontFamily: fontTTTravelsBlack,
    },

    modalDeleteButtonsStyles: {
        marginTop: dimensions.height * 0.005,
        alignItems: 'center',
        borderRadius: dimensions.width * 0.6,
        justifyContent: 'center',
        width: dimensions.width * 0.35,
        height: dimensions.height * 0.065,
        alignSelf: 'center',
    },

    periodicityReminderViewStyles: {
        backgroundColor: '#D8D8D8',
        paddingHorizontal: dimensions.width * 0.04,
        borderRadius: dimensions.width * 0.6,
        height: dimensions.height * 0.055,
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodicityReminderTextStyles: {
        alignSelf: 'flex-start',
        fontSize: dimensions.width * 0.03,
        color: 'rgba(0, 0, 0, 0.5)',
        fontWeight: 500,
        fontFamily: fontTTTravelsRegular,
        textAlign: 'left',
    }
});

export default FocusHabitDetailsScreen;
