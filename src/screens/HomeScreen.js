import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';



import FocusingScreen from './FocusingScreen';
import ProjectDetailsScreen from './ProjectDetailsScreen';
import SettingsScreen from './SettingsScreen';

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, XMarkIcon } from 'react-native-heroicons/solid';

import { set } from 'date-fns';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import AnalysisScreen from './AnalysisScreen';


const homePagesButtons = [
  { screen: 'Home', iconImage: require('../assets/icons/buttons/projectsIcon.png'), selectedIconImage: require('../assets/icons/selButtonIcons/projectsIcon.png') },
  { screen: 'Focusing', iconImage: require('../assets/icons/buttons/focusingIcon.png'), selectedIconImage: require('../assets/icons/selButtonIcons/focusingIcon.png') },
  { screen: 'Analysis', iconImage: require('../assets/icons/buttons/analysisIcon.png'), selectedIconImage: require('../assets/icons/selButtonIcons/analysisIcon.png') },
  { screen: 'Settings', iconImage: require('../assets/icons/buttons/settingsIcon.png'), selectedIconImage: require('../assets/icons/selButtonIcons/settingsIcon.png') },
];



const fontInterRegular = 'Inter18pt-Regular';

const HomeScreen = () => {

  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [selectedScreen, setSelectedScreen] = useState('Home');

  const [favorites, setFavorites] = useState([]);
  const [selectedProjectCategory, setSelectedProjectCategory] = useState('In Progress');
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Choose');
  const [complexity, setComplexity] = useState('');
  const [executors, setExecutors] = useState([]);
  const [executorName, setExecutorName] = useState('');
  const [executorSurname, setExecutorSurname] = useState('');
  const [isStatusVisible, setIsStatusVisible] = useState(false);
  const [activeSwipeableId, setActiveSwipeableId] = useState(null);
  const swipeableRefs = useRef(new Map());
  const [projects, setProjects] = useState([]);
  const [executorsVisibility, setExecutorsVisibility] = useState({});
  const [visibleExecutorsProjectId, setVisibleExecutorsProjectId] = useState(null);


  const validateDateDeadlineChange = (text) => {
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
      } else if (inputDate < currentDate) {
        Alert.alert('Error', 'The date cannot be earlier than today.');
        formatted = '';
      } else if (year < 1950 || year > 2050) {
        formatted = `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.`;
      }
    }

    setDeadline(formatted);
  };



  const handleComplexityPress = (complex) => {
    setComplexity(complex);
  };


  const addExecutor = () => {
    if (executorName !== '' && executorSurname !== '') {
      const newId = executors.length > 0 ? Math.max(...executors.map(executor => executor.id)) + 1 : 1;
      const newExecutor = { id: newId, name: executorName, surname: executorSurname };
      setExecutors([...executors, newExecutor]);
      setExecutorName('');
      setExecutorSurname('');
    }
  };


  const renderRightExecutorsActions = (item) => (
    <TouchableOpacity
      onPress={() => removeExecutor(item)}
      style={{
        width: 68,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        height: '100%',
      }}
    >
      <XMarkIcon size={dimensions.height * 0.05} color='#FFDE59' />
    </TouchableOpacity>
  );
  const removeExecutor = async (executorToRemove) => {
    try {
      const updatedExecutors = executors.filter(execut =>
        !(execut.id === executorToRemove.id)
      );
      setExecutors(updatedExecutors);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove executor.');
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
      const updatedProjects = projects.filter(proj =>
        !(proj.id === projectToRemove.id)
      );
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove project from projects.');
    }
  };



  const handleYellowDotsPress = (id) => {
    swipeableRefs.current.forEach((ref, key) => {
      if (key !== id && ref) {
        ref.close();
      }
    });

    const currentDotsRef = swipeableRefs.current.get(id);
    if (currentDotsRef) {
      if (activeSwipeableId === id) {
        currentDotsRef.close();
        setActiveSwipeableId(null);
      } else {
        currentDotsRef.openRight();
        setActiveSwipeableId(id);
      }
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



  const saveProject = async () => {
    try {
      const existingProjects = await AsyncStorage.getItem('projects');
      const projects = existingProjects ? JSON.parse(existingProjects) : [];
      const newId = projects.length > 0 ? Math.max(...projects.map(project => project.id)) + 1 : 1;

      const project = {
        id: newId,
        title,
        description,
        deadline,
        status,
        complexity,
        executors,
      };

      projects.push(project);
      await AsyncStorage.setItem('projects', JSON.stringify(projects));
      setProjects(projects);
      setTitle('');
      setDescription('');
      setDeadline('');
      setStatus('Choose');
      setComplexity('');
      setExecutors([]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const existingProjects = await AsyncStorage.getItem('projects');
        if (existingProjects) {
          setProjects(JSON.parse(existingProjects));
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    loadProjects();
  }, [selectedScreen]);

  const filteredProjects = projects.filter(project => project.status === selectedProjectCategory);

  const toggleExecutorsVisibility = (projectId) => {
    setExecutorsVisibility(prevState => ({
      ...prevState,
      [projectId]: !prevState[projectId]
    }));
  };

  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#090909',
      width: dimensions.width
    }}>

      {selectedScreen === 'Home' ? (
        <SafeAreaView style={{
          width: dimensions.width,
          height: dimensions.height * 0.9,
        }}>

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
            Projects
          </Text>

          <View style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            width: dimensions.width * 0.93,
            alignSelf: 'center',
            marginTop: dimensions.height * 0.021,
          }}>
            {['Pending', 'In Progress', 'Completed',].map((category) => (
              <TouchableOpacity
                key={category}
                style={{
                  paddingVertical: dimensions.height * 0.016,
                  width: dimensions.width * 0.28,
                  alignItems: 'center',
                  borderRadius: dimensions.width * 0.025,
                  backgroundColor: selectedProjectCategory === category ? '#FFDE59' : 'transparent',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  borderWidth: selectedProjectCategory !== category ? dimensions.width * 0.003 : 0,
                }}
                onPress={() => {
                  setSelectedProjectCategory(`${category}`);
                }}
              >
                <Text
                  style={{
                    fontFamily: fontInterRegular,
                    fontSize: dimensions.width * 0.037,
                    color: selectedProjectCategory === category ? 'black' : 'white',
                    fontWeight: 500
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={{
            height: dimensions.height ,
            marginTop: dimensions.height * 0.021,
          }}>
            <View style={{
              width: dimensions.width * 0.93,
              height: dimensions.height ,
              alignSelf: 'center',
            }}>

              {filteredProjects.length === 0 ? (
                <View style={{
                  width: dimensions.width * 0.93,
                  paddingVertical: dimensions.height * 0.019,
                  paddingHorizontal: dimensions.width * 0.05,
                  backgroundColor: '#1D1D1D',
                  alignSelf: 'center',
                  borderRadius: dimensions.width * 0.025,
                  alignItems: 'center',
                  
                }}>
                  <Image source={require('../assets/images/noProjects.png')} style={{
                    width: dimensions.width * 0.55,
                    height: dimensions.width * 0.55,
                  }}
                    resizeMode='contain'
                  />


                  <Text style={{
                    textAlign: 'center',
                    fontFamily: fontInterRegular,
                    fontWeight: 700,
                    fontSize: dimensions.width * 0.055,
                    alignItems: 'center',
                    alignSelf: 'center',
                    color: 'white',
                    paddingHorizontal: dimensions.width * 0.05,
                    paddingBottom: dimensions.height * 0.01,
                  }}
                  >
                    You don't have any {selectedProjectCategory} projects yet
                  </Text>
                </View>
              ) : (
                filteredProjects.map((project, index) => (
                  <Swipeable
                    key={project.id}

                    renderRightActions={() => renderRightProjectActions(project)}
                    onSwipeableOpen={() => handleSwipeableProjectOpen(project.id)}
                    onSwipeableClose={() => handleSwipeableProjectClose(project.id)}
                  >

                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedProject(project);
                        setSelectedScreen('ProjectDetails');
                      }}
                    key={index} style={{
                      width: dimensions.width * 0.93,
                      paddingVertical: dimensions.height * 0.019,
                      paddingHorizontal: dimensions.width * 0.05,
                      backgroundColor: '#1D1D1D',
                      alignSelf: 'center',
                      borderRadius: dimensions.width * 0.025,
                      marginBottom: dimensions.height * 0.01,

                    }}>
                      <Text
                        style={{
                          fontFamily: fontInterRegular,
                          fontSize: dimensions.width * 0.043,
                          color: 'white',
                          fontWeight: 700,
                          alignSelf: 'flex-start'
                        }}
                      >
                        {project.title}
                      </Text>


                      <Text
                        style={{
                          fontFamily: fontInterRegular,
                          fontSize: dimensions.width * 0.034,
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 500,
                          alignSelf: 'flex-start',
                          marginTop: dimensions.height * 0.01
                        }}
                      >
                        {project.deadline}
                      </Text>


                      <Text
                        style={{
                          fontFamily: fontInterRegular,
                          fontSize: dimensions.width * 0.034,
                          color: 'rgba(255, 255, 255, 0.55)',
                          fontWeight: 400,
                          alignSelf: 'flex-start',
                          marginTop: dimensions.height * 0.01
                        }}
                      >
                        {project.description}
                      </Text>


                      <TouchableOpacity
                        onPress={() => {toggleExecutorsVisibility(project.id); setVisibleExecutorsProjectId(project.id);}}
                        style={{
                          width: '100%',

                          marginTop: dimensions.height * 0.023,
                        }}>


                        <View style={{
                          alignSelf: 'center',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}>
                          <Text
                            style={{
                              fontFamily: fontInterRegular,
                              fontSize: dimensions.width * 0.04,
                              color: 'white',
                              fontWeight: 700,
                              alignSelf: 'flex-start'
                            }}
                          >
                            Executors
                          </Text>

                          {!executorsVisibility[project.id] ? (
                            <ChevronRightIcon size={dimensions.width * 0.05} color='white' />
                          ) : (
                            <ChevronDownIcon size={dimensions.width * 0.05} color='white' />
                          )}
                        </View>


                        {executorsVisibility[project.id] && project.id === visibleExecutorsProjectId && (
                          <View style={{
                            marginTop: dimensions.height * 0.01,
                            paddingHorizontal: dimensions.width * 0.03,
                          }}>
                            {project.executors.map((executor, index) => (
                              <View key={index} style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: dimensions.height * 0.0082,
                                maxWidth: dimensions.width * 0.7,
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
                          </View>
                        )}
                      </TouchableOpacity>

                    </TouchableOpacity>
                  </Swipeable>
                ))
              )}
            </View>

          </ScrollView>


          









          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
            }}
            style={{
              width: dimensions.width * 0.93,
              height: dimensions.height * 0.07,
              backgroundColor: '#FFDE59',
              borderRadius: dimensions.width * 0.037,
              position: 'absolute',
              bottom: '7%',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
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
              Add Project
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : selectedScreen === 'Settings' ? (
        <SettingsScreen setSelectedScreen={setSelectedScreen} 
          favorites={favorites} setFavorites={setFavorites}
        />
      ) : selectedScreen === 'ProjectDetails' ? (
        <ProjectDetailsScreen setSelectedScreen={setSelectedScreen} selectedScreen={selectedScreen} 
          selectedProject={selectedProject} setSelectedProject={setSelectedProject}
        />
      ) : selectedScreen === 'Focusing' ? (
        <FocusingScreen setSelectedScreen={setSelectedScreen} selectedScreen={selectedScreen} />
      ) : selectedScreen === 'Analysis' ? (
        <AnalysisScreen setSelectedScreen={setSelectedScreen} selectedScreen={selectedScreen} />
      ) : null}

      {selectedScreen !== 'ProjectDetails' && (

        <View
          style={{
            position: 'absolute',
            bottom: 0,
            paddingBottom: dimensions.height * 0.03,
            paddingTop: dimensions.height * 0.019,
            paddingHorizontal: dimensions.width * 0.03,
            backgroundColor: '#1D1D1D',
            width: dimensions.width,


            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'center',
            paddingVertical: dimensions.height * 0.004,
            zIndex: 5000

          }}
        >
          {homePagesButtons.map((buttn, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedScreen(buttn.screen)}
              style={{
                borderRadius: dimensions.width * 0.5,
                padding: dimensions.height * 0.019,
                alignItems: 'center',
                marginHorizontal: dimensions.width * 0.001,

              }}
            >
              <Image
                source={selectedScreen === buttn.screen ? buttn.selectedIconImage : buttn.iconImage}
                style={{
                  width: dimensions.height * 0.03,
                  height: dimensions.height * 0.03,
                  textAlign: 'center',
                  opacity: selectedScreen === buttn.screen ? 1 : 0.5,
                }}
                resizeMode="contain"
              />
              <Text
                style={{
                  fontFamily: fontInterRegular,
                  fontSize: dimensions.width * 0.028,
                  color: selectedScreen === buttn.screen ? '#FFDE59' : '#919191',
                  marginTop: dimensions.height * 0.008,
                  fontWeight: 600,
                }}
              >
                {buttn.screen}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}


      <Modal visible={modalVisible} transparent={true} animationType="slide">

        <SafeAreaView

          style={{
            alignSelf: 'center',
            alignItems: 'center',
            width: '100%',
            paddingHorizontal: dimensions.width * 0.052,
            width: dimensions.width,
            zIndex: 999,
            backgroundColor: '#090909',
            height: dimensions.height,
          }}
        >
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
                setModalVisible(false);
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


            <Text style={{
              fontFamily: fontInterRegular,
              color: 'white',
              fontWeight: 600,
              fontSize: dimensions.width * 0.053,
              right: dimensions.width * 0.052,
              alignItems: 'center',
              alignSelf: 'center',
              textAlign: 'center',

            }}
            >
              Add Project
            </Text>
            <View></View>
          </View>
          <ScrollView style={{
            width: dimensions.width * 0.93,
            marginBottom: dimensions.height * 0.1
          }}>


            <View style={{
              width: dimensions.width * 0.93,
              alignItems: 'center',
              alignSelf: 'center',
              paddingBottom: dimensions.height * 0.16,
            }}>
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
                Title
              </Text>


              <TextInput
                placeholder="Enter the text..."
                value={title}
                onChangeText={setTitle}
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
                Description
              </Text>


              <TextInput
                placeholder="Enter the text..."
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="rgba(255, 255, 255, 0.61)"
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
                  color: 'white',
                  fontFamily: fontInterRegular,
                  fontSize: dimensions.width * 0.041,
                  fontWeight: 500,
                  textAlign: 'left',
                  marginTop: dimensions.height * 0.01,
                  height: dimensions.height * 0.14,
                  alignSelf: 'flex-start',
                  textAlignVertical: 'top'
                }}
                multiline={true}
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
                Deadline
              </Text>


              <TextInput
                placeholder="dd.mm.yyyy"
                value={deadline}
                onChangeText={validateDateDeadlineChange}
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
                Status
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setIsStatusVisible(!isStatusVisible);
                  if (status !== 'Choose') {
                    setStatus('Choose');
                  }
                }}
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

                  marginTop: dimensions.height * 0.01,
                }}>
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
                  {['Pending', 'In Progress', 'Completed'].map((stat, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setStatus(stat);
                        setIsStatusVisible(!isStatusVisible);
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
                      }}>
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
                Complexity
              </Text>


              <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: dimensions.width * 0.93, marginTop: dimensions.height * 0.01, }}>
                {[1, 2, 3, 4, 5].map((crovvn) => (
                  <TouchableOpacity key={crovvn} onPress={() => handleComplexityPress(crovvn)}>
                    <Image
                      source={complexity >= crovvn
                        ? require('../assets/icons/crovvnIcon.png')
                        : require('../assets/icons/whiteCrovvnIcon.png')
                      }
                      style={{
                        textAlign: 'center', width: dimensions.width * 0.139, height: dimensions.width * 0.139,
                        opacity: complexity >= crovvn ? 1 : 0.4,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </View>


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
                Executors
              </Text>

              {executors.length > 0 && (
                <View style={{
                  width: dimensions.width * 0.93,
                  marginTop: dimensions.height * 0.016,
                }}>
                  {executors.map((executor, index) => (
                    <Swipeable
                      key={index}
                      ref={(ref) => {
                        if (ref) {
                          swipeableRefs.current.set(executor.id, ref);
                        } else {
                          swipeableRefs.current.delete(executor.id);
                        }
                      }}
                      renderRightActions={() => renderRightExecutorsActions(executor)}
                      onSwipeableOpen={() => handleSwipeableToOpen(executor.id)}
                      onSwipeableClose={() => handleSwipeableClose(executor.id)}
                    >

                      <View style={{
                        width: dimensions.width * 0.93,
                        borderRadius: dimensions.width * 0.023,
                        backgroundColor: '#1D1D1D',
                        padding: dimensions.width * 0.04,
                        marginBottom: dimensions.height * 0.01,
                        alignSelf: 'center',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',

                      }}>
                        <Text style={{
                          fontFamily: fontInterRegular,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: dimensions.width * 0.04,
                          textAlign: 'center',
                          maxWidth: dimensions.width * 0.7,
                        }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {executor.name} {executor.surname}
                        </Text>


                        <TouchableOpacity
                          onPress={() => handleYellowDotsPress(executor.id)}
                          style={{
                            zIndex: 100,
                            right: dimensions.width * 0.014,
                            alignItems: 'center',
                            maxWidth: '10%',

                          }}>
                          <Image
                            source={require('../assets/icons/tabler-dots.png')}
                            style={{
                              width: dimensions.height * 0.05,
                              height: dimensions.height * 0.05,
                              textAlign: 'center'
                            }}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>

                      </View>
                    </Swipeable>
                  ))}
                </View>
              )}

              <View style={{
                width: dimensions.width * 0.93,
                borderRadius: dimensions.width * 0.023,
                backgroundColor: '#1D1D1D',
                padding: dimensions.width * 0.04,
                marginTop: dimensions.height * 0.016,
              }}>
                <Text style={{
                  fontFamily: fontInterRegular,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: dimensions.width * 0.037,
                  alignSelf: 'flex-start',
                  textAlign: 'center',

                }}
                >
                  Name
                </Text>


                <TextInput
                  placeholder="Executor Name"
                  value={executorName}
                  onChangeText={setExecutorName}
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
                  Surname
                </Text>


                <TextInput
                  placeholder="Executor Surame"
                  value={executorSurname}
                  onChangeText={setExecutorSurname}
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

              </View>

              <TouchableOpacity
                disabled={executorName === '' || executorSurname === ''}
                onPress={addExecutor}
                style={{
                  width: dimensions.width * 0.93,
                  height: dimensions.height * 0.068,
                  backgroundColor: 'transparent',
                  borderRadius: dimensions.width * 0.031,
                  borderWidth: dimensions.width * 0.004,
                  borderColor: 'white',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  marginTop: dimensions.height * 0.02,
                }}
              >
                <Text
                  style={{
                    fontFamily: fontInterRegular,
                    fontSize: dimensions.width * 0.04,
                    color: 'white',
                    fontWeight: 700,

                  }}
                >
                  Add Executor
                </Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
          <TouchableOpacity
            disabled={title === '' || description === '' || deadline === '' || status === '' || complexity === '' || executors.length === 0}
            onPress={saveProject}
            style={{
              width: dimensions.width * 0.93,
              height: dimensions.height * 0.07,
              backgroundColor: title === '' || description === '' || deadline === '' || status === '' || complexity === '' || executors.length === 0 ? 'white' : '#FFDE59',
              borderRadius: dimensions.width * 0.037,
              position: 'absolute',
              bottom: '7%',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              opacity: title === '' || description === '' || deadline === '' || status === '' || complexity === '' || executors.length === 0 ? 0.5 : 1,
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
              Done
            </Text>
          </TouchableOpacity>

        </SafeAreaView>

      </Modal>
    </View>
  );
};

export default HomeScreen;
