import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Text,
    Dimensions,
    SafeAreaView,
    Switch,
    Image,
    View,
    TouchableOpacity,
    StyleSheet,
    Linking,
} from 'react-native';

const fontTTTravelsRegular = 'TTTravels-Regular';
const fontTTTravelsBlack = 'TTTravels-Black';
const fontTTTravelsBold = 'TTTravels-Bold';

const focusTermsButtons = [
    {
        id: 2,
        focusButtonTitle: 'Privacy Policy',
        focusButtonLink: 'https://google.com',
    },
    {
        id: 1,
        focusButtonTitle: 'Terms of Use',
        focusButtonLink: 'https://google.com',
    },
]

const SettingsScreen = ({ selectedScreen, }) => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [isFocusNotificationEnabled, setFocusNotificationEnabled] = useState(false);
    const styles = createStyles(dimensions);

    const handleFocusNotificationChangeSwitch = () => {
        const newValue = !isFocusNotificationEnabled;
        setFocusNotificationEnabled(newValue);
        saveSettings('isFocusNotificationEnabled', newValue);
    };

    const saveSettings = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    };

    const loadFocusSettings = async () => {
        try {
            const focusValOfNotific = await AsyncStorage.getItem('isFocusNotificationEnabled');

            if (focusValOfNotific !== null) setFocusNotificationEnabled(JSON.parse(focusValOfNotific));
        } catch (error) {
            console.error("Error loading focus settings:", error);
        }
    };

    useEffect(() => {
        loadFocusSettings();
    }, [isFocusNotificationEnabled, selectedScreen]);

    return (
        <SafeAreaView style={{
            width: dimensions.width,
            flex: 1,
        }} >
            <Text style={{
                textAlign: 'center',
                fontFamily: fontTTTravelsBlack,
                fontSize: dimensions.width * 0.06,
                alignItems: 'center',
                alignSelf: 'center',
                color: '#000000',
            }}
            >
                Settings
            </Text>

            <Image
                source={require('../assets/images/settingsFocusImage.png')}
                style={{
                    width: dimensions.width * 0.5,
                    height: dimensions.height * 0.25,
                    alignSelf: 'center',
                    marginTop: dimensions.width * 0.05,
                }}
                resizeMode="contain"
            />

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: 0,
                height: dimensions.height * 0.07,
                alignSelf: 'center',
                backgroundColor: '#fff',
                paddingHorizontal: dimensions.width * 0.05,
                borderRadius: dimensions.width * 0.6,
                shadowColor: '#000000',
                shadowOffset: {
                    height: 2,
                },
                shadowOpacity: 0.2,
                width: dimensions.width * 0.9,
                shadowRadius: dimensions.width * 0.05,
                elevation: 5,
            }}>
                <Text style={{
                    color: '#000000',
                    fontSize: dimensions.width * 0.045,
                    fontWeight: 600,
                    fontFamily: fontTTTravelsRegular,
                }}>Notifications</Text>
                <Switch
                    trackColor={{ false: '#948ea0', true: '#B08711' }}
                    thumbColor={'white'}
                    ios_backgroundColor="#4c4c4c"
                    onValueChange={handleFocusNotificationChangeSwitch}
                    value={isFocusNotificationEnabled}
                />
            </View>

            {focusTermsButtons.map((item) => (
                <TouchableOpacity key={item.id} style={styles.settingsButton}
                    onPress={() => {
                        Linking.openURL(item.focusButtonLink)
                    }}
                >
                    <Text style={{
                        color: '#000000',
                        fontSize: dimensions.width * 0.045,
                        fontWeight: 600,
                        fontFamily: fontTTTravelsRegular,
                    }}>
                        {item.focusButtonTitle}
                    </Text>

                    <Image
                        source={require('../assets/icons/arrowUpRightIcon.png')}
                        style={{
                            width: dimensions.height * 0.08,
                            height: dimensions.height * 0.08,
                        }}
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            ))}
        </SafeAreaView>
    );
};

const createStyles = (dimensions) => StyleSheet.create({
    settingsButton: {
        borderRadius: dimensions.width * 0.6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: dimensions.width * 0.9,
        height: dimensions.height * 0.07,
        alignSelf: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000000',
        elevation: 5,
        paddingLeft: dimensions.width * 0.05,
        alignItems: 'center',
        marginTop: dimensions.width * 0.015,
        shadowOffset: {
            height: 2,
            width: 0,
        },
        shadowRadius: dimensions.width * 0.05,
        shadowOpacity: 0.2,
    },
});

export default SettingsScreen;
