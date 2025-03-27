import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    Alert,
    TextInput,
    SafeAreaView,
    Linking,
    Switch,
    Modal,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeftIcon, CheckIcon, PlusIcon, ChevronRightIcon } from 'react-native-heroicons/solid';
import * as ImagePicker from 'react-native-image-picker';
import { set } from 'date-fns';


const fontInterRegular = 'Inter18pt-Regular';


const privAndTerBttns = [
    {
        id: 2,
        title: 'Privacy Policy',
        link: 'https://www.termsfeed.com/live/c0dabc43-7705-4704-98bb-d14b6ec4be2a',
    },
    {
        id: 1,
        title: 'Terms of Use',
        link: 'https://www.termsfeed.com/live/8c6b9844-037b-45c7-8508-1cabd5f8aa9e',
    },


]

const SettingsScreen = ({ selectedScreen, }) => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [image, setImage] = useState(null);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [profileEditingModalVisible, setProfileEditingModalVisible] = useState(false);


    const [storagedUserName, setStoragedUserName] = useState('');
    const [storagedUserSurname, setStoragedUserSurame] = useState('');
    const [storagedUserImage, setStoragedUserImage] = useState(null);
    const [storagedUserDateOfBirth, setStoragedUserDateOfBirth] = useState('');


    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const userProfile = await AsyncStorage.getItem('UserProfile');
                if (userProfile !== null) {
                    const { name, surname, dateOfBirth, image } = JSON.parse(userProfile);
                    setStoragedUserName(name);
                    setStoragedUserSurame(surname);
                    setStoragedUserDateOfBirth(dateOfBirth);
                    setStoragedUserImage(image);
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
            }
        };

        loadUserProfile();
    }, [profileEditingModalVisible, selectedScreen]);


    const handleImagePicker = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (imageResponse) => {
            if (imageResponse.didCancel) {
                console.log('cancell pick image');
            } else if (imageResponse.error) {
                console.log('Error pick image: ', imageResponse.error);
            } else {
                setImage(imageResponse.assets[0].uri);
            }
        });
    };
    const handleSave = async () => {
        try {
            const existingProfile = await AsyncStorage.getItem('UserProfile');
            const userProfile = existingProfile ? JSON.parse(existingProfile) : {};

            if (name) userProfile.name = name;
            if (surname) userProfile.surname = surname;
            if (dateOfBirth) userProfile.dateOfBirth = dateOfBirth;
            if (image) userProfile.image = image;

            await AsyncStorage.setItem('UserProfile', JSON.stringify(userProfile));
            setProfileEditingModalVisible(false);
            setName('');
            setSurname('');
            setDateOfBirth('');
        } catch (error) {
            console.error('Error saving user profile:', error);
        }
    };




    const handleDeleteImage = () => {
        Alert.alert(
            "Deleting Image",
            "Really delete this image?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: () => {
                        setImage(null); 
                    },
                    style: "destructive"
                }
            ]
        );
    };


    const validateDateOfBirthChange = (text) => {
        const cleaned = text.replace(/[^0-9]/g, '');

        let formatted = cleaned;
        if (cleaned.length > 2) {
            formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
        }
        if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.${cleaned.slice(4, 8)}`;
        }

        if (cleaned.length >= 8) {
            const day = parseInt(cleaned.slice(0, 2), 10);
            const month = parseInt(cleaned.slice(2, 4), 10);
            const year = parseInt(cleaned.slice(4, 8), 10);

            const inputDate = new Date(year, month - 1, day);
            const currentDate = new Date();

            const isLeapYear = (year) => {
                return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            };

            const daysInMonth = (month, year) => {
                return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
            };

            if (month < 1 || month > 12) {
                Alert.alert('Error', 'Invalid month. Please enter a valid month (01-12).');
                formatted = '';
            } else if (day < 1 || day > daysInMonth(month, year)) {
                Alert.alert('Error', `Invalid day for the selected month. Please enter a valid day (01-${daysInMonth(month, year)}).`);
                formatted = '';
            } else if (inputDate >= currentDate) {
                Alert.alert('Error', 'The date of birth cannot be in the future.');
                formatted = '';
            } else if (year < 1950 || year > 2050) {
                formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.`;
            }
        }

        setDateOfBirth(formatted);
    };

    return (
        <View style={{
            width: dimensions.width,
            flex: 1,
            zIndex: 1,
            alignItems: 'center',
            position: 'relative',
            width: '100%',
            justifyContent: 'flex-start',
        }} >
            <View style={{
                width: dimensions.width,
                backgroundColor: '#FFDE59',
                alignItems: 'center',
                paddingHorizontal: dimensions.width * 0.05,
                paddingVertical: dimensions.height * 0.16,
                flexDirection: 'row',
                alignSelf: 'center',
                padding: dimensions.width * 0.01,
                paddingTop: dimensions.height * 0.057,
                justifyContent: 'space-between',
            }}>

                <Text style={{
                    fontFamily: fontInterRegular,
                    color: 'white',

                    fontWeight: 700,
                    alignSelf: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    fontSize: dimensions.width * 0.064,
                }}
                >
                    Profile
                </Text>
                <TouchableOpacity

                    style={{
                        backgroundColor: 'white',
                        padding: dimensions.height * 0.016,
                        borderRadius: dimensions.width * 0.021,
                    }}
                    onPress={() => {
                        setProfileEditingModalVisible(true);
                    }}>
                    <Image
                        source={require('../assets/icons/editProfileIcon.png')}
                        style={{
                            width: dimensions.height * 0.028,
                            textAlign: 'center',
                            height: dimensions.height * 0.028,
                            alignSelf: 'center',

                        }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

            </View>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', top: -dimensions.height * 0.064, }}>
                {storagedUserImage ? (
                    <View style={{ position: 'relative', top: -dimensions.height * 0.1, }}>
                        <Image
                            source={{uri: storagedUserImage}}
                            style={{
                                width: dimensions.height * 0.16,
                                height: dimensions.height * 0.16,
                                borderRadius: dimensions.width * 0.5,
                                top: -dimensions.height * 0.064,
                                borderColor: '#090909',
                                position: 'relative',
                                zIndex: 1000,
                            }}
                            resizeMode='stretch'
                        />
                        <Image
                            source={require('../assets/images/crovvnProfileImage.png')}
                            style={{
                                width: dimensions.height * 0.1,
                                height: dimensions.height * 0.1,
                                borderRadius: dimensions.width * 0.5,
                                top: -dimensions.height * 0.111,
                                right: -dimensions.height * 0.019,
                                position: 'absolute',

                                zIndex: 1001,
                            }}
                            resizeMode='contain'
                        />
                    </View>
                ) : (

                    <View style={{ position: 'relative', top: -dimensions.height * 0.16, backgroundColor: '#1D1D1D', padding: dimensions.height * 0.025, borderRadius: dimensions.width * 0.5, }}>
                        <Image
                            source={require('../assets/images/noProjects.png')}
                            style={{
                                width: dimensions.height * 0.12,
                                height: dimensions.height * 0.12,
                                borderRadius: dimensions.width * 0.5,
                                left: dimensions.height * 0.005,
                                borderColor: '#090909',
                                position: 'relative',
                                zIndex: 100,
                            }}
                            resizeMode='contain'
                        />
                    </View>
                )}
                <Text style={{
                    fontFamily: fontInterRegular,
                    color: 'white',
                    fontSize: dimensions.width * 0.07,
                    textAlign: 'center',
                    fontWeight: 700,
                    top: -dimensions.height * 0.14,
                }}>
                    {storagedUserName ? storagedUserName : 'Name'} {storagedUserSurname ? storagedUserSurname : 'Surname'}
                </Text>
                <Text style={{
                    fontFamily: fontInterRegular,
                    color: 'white',
                    fontSize: dimensions.width * 0.037,
                    textAlign: 'center',
                    fontWeight: 700,
                    top: -dimensions.height * 0.129,
                }}>
                    {storagedUserDateOfBirth ? storagedUserDateOfBirth : 'dd.mm.yyyy'}
                </Text>
                <View style={{
                    top: -dimensions.height * 0.1,
                    width: dimensions.width * 0.93,
                }}>
                    {privAndTerBttns.map((button) => (

                        <TouchableOpacity
                            key={button.id}
                            onPress={() => {
                                Linking.openURL(button.link);
                            }}
                            style={{
                                backgroundColor: 'transparent',
                                alignItems: 'center',
                                borderColor: 'rgba(255, 255, 255, 0.7)',
                                borderWidth: dimensions.width * 0.001,
                                borderRadius: dimensions.width * 0.021,
                                marginTop: dimensions.height * 0.008,
                                alignSelf: 'center',
                                width: '95%',
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                paddingVertical: dimensions.height * 0.028,
                                paddingHorizontal: dimensions.width * 0.05,
                            }}
                        >
                            <Text
                                style={{ fontFamily: fontInterRegular, color: 'white', fontSize: dimensions.width * 0.04, textAlign: 'center', fontWeight: 700 }}>
                                {button.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>


            <Modal visible={profileEditingModalVisible} transparent={true} animationType="slide">
                <SafeAreaView
                    style={{
                        alignSelf: 'center',
                        alignItems: 'center',
                        height: dimensions.height,
                        width: '100%',
                        paddingHorizontal: dimensions.width * 0.05,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        width: dimensions.width,
                        backgroundColor: '#000000',
                        zIndex: 1000,
                        shadowOpacity: 0.25,
                    }}
                >
                    <View style={{
                        zIndex: 50,
                        alignSelf: 'center',
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: dimensions.width * 0.93,
                    }}>
                        <TouchableOpacity
                            onPress={() => {
                                setProfileEditingModalVisible(false);
                            }}
                            style={{
                                borderRadius: dimensions.width * 0.5,
                                zIndex: 100,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <ChevronLeftIcon size={dimensions.height * 0.04} color='white' />

                        </TouchableOpacity>
                        <Text style={{
                            fontFamily: fontInterRegular,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: dimensions.width * 0.05,
                            alignItems: 'center',
                            alignSelf: 'center',
                            textAlign: 'center',
                            marginRight: dimensions.width * 0.1,
                        }}
                        >
                            Edit Profile
                        </Text>
                        <View></View>
                    </View>

                    <View style={{
                        width: dimensions.width * 0.93,
                        marginTop: dimensions.height * 0.02,
                        alignItems: 'center',
                        alignSelf: 'center',
                    }}>
                        {!image ? (

                            <TouchableOpacity
                                onPress={handleImagePicker}
                                style={{
                                    alignItems: 'center',
                                    marginBottom: dimensions.height * 0.01,
                                    alignSelf: 'center',
                                    backgroundColor: '#DDB43F',
                                    borderRadius: dimensions.width * 0.5,
                                    padding: dimensions.height * 0.05,
                                    marginTop: dimensions.height * 0.01,

                                }}>
                                <Image
                                    source={require('../assets/images/noProjects.png')}
                                    style={{
                                        width: dimensions.height * 0.064,
                                        height: dimensions.height * 0.064,
                                        textAlign: 'center',
                                        alignSelf: 'center',

                                    }}
                                    resizeMode="stretch"
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={handleDeleteImage}
                                style={{
                                    marginTop: dimensions.height * 0.001,
                                }}>

                                <Image
                                    source={{ uri: image }}
                                    style={{
                                        width: dimensions.height * 0.165,
                                        height: dimensions.height * 0.165,
                                        textAlign: 'center',
                                        alignSelf: 'center',
                                        borderRadius: dimensions.width * 0.5,
                                        marginTop: dimensions.height * 0.005,
                                    }}
                                    resizeMode="stretch"
                                />
                            </TouchableOpacity>

                        )}


                        <Text style={{
                            fontFamily: fontInterRegular,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: dimensions.width * 0.043,
                            alignSelf: 'flex-start',
                            textAlign: 'center',
                            marginTop: dimensions.height * 0.025,
                        }}
                        >
                            Name
                        </Text>


                        <TextInput
                            placeholder="Enter the text..."
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="rgba(255, 255, 255, 0.61)"
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


                        <Text style={{
                            fontFamily: fontInterRegular,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: dimensions.width * 0.043,
                            alignSelf: 'flex-start',
                            textAlign: 'center',
                            marginTop: dimensions.height * 0.025,
                        }}
                        >
                            Surame
                        </Text>


                        <TextInput
                            placeholder="Enter the text..."
                            value={surname}
                            onChangeText={setSurname}
                            placeholderTextColor="rgba(255, 255, 255, 0.61)"
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


                        <Text style={{
                            fontFamily: fontInterRegular,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: dimensions.width * 0.043,
                            alignSelf: 'flex-start',
                            textAlign: 'center',
                            marginTop: dimensions.height * 0.025,
                        }}
                        >
                            Date of Birth
                        </Text>



                        <TextInput
                            placeholder="dd.mm.yyyy"
                            value={dateOfBirth}
                            onChangeText={validateDateOfBirthChange}
                            placeholderTextColor="rgba(255, 255, 255, 0.61)"
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


                        <TouchableOpacity
                            onPress={() => {
                                handleSave();
                            }}
                            style={{
                                backgroundColor: '#DDB43F',
                                borderRadius: dimensions.width * 0.025,
                                paddingVertical: dimensions.height * 0.016,
                                marginTop: dimensions.height * 0.05,
                                alignSelf: 'center',
                                width: dimensions.width * 0.93,
                            }}
                        >
                            <Text
                                style={{ fontFamily: fontInterRegular, color: 'white', fontSize: dimensions.width * 0.04, textAlign: 'center', fontWeight: 600 }}>
                                Save
                            </Text>
                        </TouchableOpacity>



                    </View>
                </SafeAreaView>
            </Modal>

        </View>
    );
};

export default SettingsScreen;
