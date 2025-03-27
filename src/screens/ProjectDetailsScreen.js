import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    TextInput,
    Alert,
    SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon } from 'react-native-heroicons/solid';


const fontInterRegular = 'Inter18pt-Regular';

const ProjectDetailsScreen = ({ setSelectedScreen, selectedProject }) => {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [status, setStatus] = useState(selectedProject.status);
    const [isStatusVisible, setIsStatusVisible] = useState(false);

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const existingProjects = await AsyncStorage.getItem('projects');
                if (existingProjects) {
                    const projects = JSON.parse(existingProjects);
                    const project = projects.find(proj => proj.id === selectedProject.id);
                    if (project) {
                        setStatus(project.status);
                    }
                }
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        };

        loadProjects();
    }, [selectedProject.id]);

    const updateStatus = async (newStatus) => {
        try {
            const existingProjects = await AsyncStorage.getItem('projects');
            if (existingProjects) {
                const projects = JSON.parse(existingProjects);
                const projectIndex = projects.findIndex(proj => proj.id === selectedProject.id);
                if (projectIndex !== -1) {
                    projects[projectIndex].status = newStatus;
                    await AsyncStorage.setItem('projects', JSON.stringify(projects));
                    setStatus(newStatus);
                }
            }
        } catch (error) {
            console.error('Error updating project status:', error);
        }
    };

    const availableStatuses = ['Pending', 'In Progress', 'Completed'].filter(stat => stat !== status);

    return (
        <SafeAreaView style={{
            width: dimensions.width,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative',
            width: '100%',
            zIndex: 1
        }} >
            <View style={{
                zIndex: 50,
                alignSelf: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '97%',
            }}>
                <TouchableOpacity
                    onPress={() => {
                        setSelectedScreen('Home');
                    }}
                    style={{
                        borderRadius: dimensions.width * 0.5,
                        zIndex: 100,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <ChevronLeftIcon size={dimensions.height * 0.037} color='white' />
                </TouchableOpacity>

            </View>

            <ScrollView style={{
                width: dimensions.width * 0.93,
                height: dimensions.height,

            }}>

                <View style={{
                    width: dimensions.width * 0.97,
                    alignSelf: 'center',
                    marginTop: dimensions.height * 0.02,
                    marginBottom: dimensions.height * 0.25,
                }}>
                    <Image
                        source={require('../assets/images/projectDetails.png')}
                        style={{
                            width: dimensions.width * 0.5,
                            height: dimensions.width * 0.5,
                            textAlign: 'center',
                            alignSelf: 'center',
                        }}
                        resizeMode="contain"
                    />

                    <View style={{
                        paddingHorizontal: dimensions.width * 0.02,
                        marginTop: dimensions.height * 0.01,
                        alignItems: 'center',
                        width: dimensions.width * 0.93,
                    }}>
                        <Text
                            style={{
                                fontFamily: fontInterRegular,
                                fontSize: dimensions.width * 0.064,
                                color: 'white',
                                fontWeight: 700,
                                alignSelf: 'center',
                            }}
                        >
                            {selectedProject.title}
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
                            Description
                        </Text>

                        <Text
                            style={{
                                fontFamily: fontInterRegular,
                                fontWeight: 500,
                                fontSize: dimensions.width * 0.04,
                                color: 'white',
                                alignSelf: 'flex-start',
                                marginTop: dimensions.height * 0.01,
                            }}
                        >
                            {selectedProject.description}
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
                            Deadline
                        </Text>

                        <Text
                            style={{
                                fontFamily: fontInterRegular,
                                fontWeight: 500,
                                fontSize: dimensions.width * 0.04,
                                color: 'white',
                                alignSelf: 'flex-start',
                                marginTop: dimensions.height * 0.01,
                            }}
                        >
                            {selectedProject.deadline}
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
                                marginBottom: dimensions.height * 0.01,
                            }}
                        >
                            Executors
                        </Text>



                        {selectedProject.executors.map((executor, index) => (
                            <View key={index} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: dimensions.height * 0.0082,
                                maxWidth: dimensions.width * 0.8,
                                alignSelf: 'flex-start',
                                paddingHorizontal: dimensions.width * 0.016,
                            }}>

                                <Text
                                    style={{
                                        fontFamily: fontInterRegular,
                                        fontSize: dimensions.width * 0.04,
                                        color: 'white',
                                        fontWeight: 500,
                                        alignSelf: 'flex-start',
                                        marginRight: dimensions.width * 0.01
                                    }}
                                >
                                    •
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: fontInterRegular,
                                        fontSize: dimensions.width * 0.04,
                                        color: 'white',
                                        fontWeight: 500,
                                        alignSelf: 'flex-start'
                                    }}
                                >
                                    {executor.name} {executor.surname}
                                </Text>
                            </View>
                        ))}


                        <Text
                            style={{
                                fontWeight: 600,
                                fontFamily: fontInterRegular,
                                fontSize: dimensions.width * 0.043,
                                color: 'white',
                                marginTop: dimensions.height * 0.016,
                                alignSelf: 'flex-start',
                            }}
                        >
                            Complexity
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: dimensions.width * 0.93, marginTop: dimensions.height * 0.01, }}>
                            {[1, 2, 3, 4, 5].map((crovvn) => (
                                <TouchableOpacity key={crovvn} >
                                    <Image
                                        source={selectedProject.complexity >= crovvn
                                            ? require('../assets/icons/crovvnIcon.png')
                                            : require('../assets/icons/whiteCrovvnIcon.png')
                                        }
                                        style={{
                                            textAlign: 'center', width: dimensions.width * 0.139, height: dimensions.width * 0.139,
                                            opacity: selectedProject.complexity >= crovvn ? 1 : 0.4,
                                        }}
                                        resizeMode="contain"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>


                        <TouchableOpacity
                            onPress={() => setIsStatusVisible(!isStatusVisible)}
                            style={{
                                borderColor: status !== 'Choose' ? '#FFDE59' : 'rgba(255, 255, 255, 0.25)',
                                borderWidth: dimensions.width * 0.004,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingVertical: dimensions.width * 0.035,
                                paddingHorizontal: dimensions.width * 0.04,
                                backgroundColor: 'transparent',
                                borderRadius: dimensions.width * 0.023,
                                width: '100%',
                                fontFamily: fontInterRegular,
                                alignItems: 'center',
                                marginTop: dimensions.height * 0.025,
                            }}
                        >
                            <Text style={{
                                fontFamily: fontInterRegular,
                                color: 'white',
                                fontWeight: 500,
                                fontSize: dimensions.width * 0.043,
                                textAlign: 'center',
                                fontSize: dimensions.width * 0.041,
                                textAlign: 'left',
                                color: "white",
                                alignItems: 'center',
                            }}
                            >
                                {status}
                            </Text>

                            {!isStatusVisible ? (
                                <ChevronDownIcon size={dimensions.width * 0.07} color='white' />
                            ) : (
                                <ChevronUpIcon size={dimensions.width * 0.07} color='white' />
                            )}
                        </TouchableOpacity>

                        {isStatusVisible && (
                            <>
                                {availableStatuses.map((stat, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            updateStatus(stat);
                                            setIsStatusVisible(false);
                                        }}
                                        style={{
                                            borderColor: 'rgba(255, 255, 255, 0.25)',
                                            borderWidth: dimensions.width * 0.004,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            paddingVertical: dimensions.width * 0.035,
                                            paddingHorizontal: dimensions.width * 0.04,
                                            backgroundColor: 'transparent',
                                            borderRadius: dimensions.width * 0.023,
                                            width: '100%',
                                            fontFamily: fontInterRegular,
                                            alignItems: 'center',
                                            marginTop: dimensions.height * 0.01,
                                        }}
                                    >
                                        <Text style={{
                                            fontFamily: fontInterRegular,
                                            color: 'white',
                                            fontWeight: 500,
                                            fontSize: dimensions.width * 0.043,
                                            textAlign: 'center',
                                            fontSize: dimensions.width * 0.041,
                                            textAlign: 'left',
                                            color: "white",
                                            alignItems: 'center',
                                        }}
                                        >
                                            {stat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProjectDetailsScreen;
