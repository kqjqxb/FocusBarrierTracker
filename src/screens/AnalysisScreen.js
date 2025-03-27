import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  SafeAreaView,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const fontInterRegular = 'Inter18pt-Regular';

const AnalysisScreen = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [inProgressCount, setInProgressCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

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

  return (
    <SafeAreaView style={{
      alignItems: 'center',
      width: dimensions.width,
      position: 'relative',
      flex: 1,
      justifyContent: 'flex-start',
      backgroundColor: '#090909',
    }} >
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
        Productivity Analysis
      </Text>


      {((completedCount === 0 && inProgressCount === 0 && pendingCount === 0) || (!completedCount && !inProgressCount && !pendingCount)) ? (
        <View style={{
          width: dimensions.width * 0.93,
          paddingVertical: dimensions.height * 0.019,
          paddingHorizontal: dimensions.width * 0.05,
          backgroundColor: '#1D1D1D',
          alignSelf: 'center',
          borderRadius: dimensions.width * 0.025,
          alignItems: 'center',
          marginTop: dimensions.height * 0.03,

        }}>
          <Image source={require('../assets/images/noAnalitics.png')} style={{
            width: dimensions.width * 0.55,
            height: dimensions.width * 0.55,
            left: dimensions.width * 0.03,
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
            paddingHorizontal: dimensions.width * 0.0,
            paddingBottom: dimensions.height * 0.01,
          }}
          >
            You don't have analytics yet
          </Text>


          <Text style={{
            textAlign: 'center',
            fontFamily: fontInterRegular,
            fontWeight: 400,
            fontSize: dimensions.width * 0.037,
            alignItems: 'center',
            alignSelf: 'center',
            color: 'white',
            paddingHorizontal: dimensions.width * 0.05,
            paddingBottom: dimensions.height * 0.01,
            marginTop: dimensions.height * 0.01,
            opacity: 0.7,
          }}
          >
            Add some projects to see analytics here!
          </Text>
        </View> 
      ) : (
        <>
          <Image source={require('../assets/images/noAnalitics.png')} style={{
            width: dimensions.width * 0.46,
            height: dimensions.width * 0.46,
            marginTop: dimensions.height * 0.03,
            left: dimensions.width * 0.014,
          }}
            resizeMode='contain'
          />

          <View style={{
            width: dimensions.width * 0.93,
            paddingVertical: dimensions.height * 0.028,
            paddingHorizontal: dimensions.width * 0.03,
            backgroundColor: '#1D1D1D',
            alignSelf: 'center',
            borderRadius: dimensions.width * 0.025,
            alignItems: 'center',
            marginTop: dimensions.height * 0.03,
            overflow: 'hidden', 
          }}>

            <View style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 0,
              height: 0,
              borderLeftWidth: dimensions.width * 0.43,
              borderTopWidth: dimensions.width * 0.37,
              borderLeftColor: 'transparent',
              borderTopColor: '#FFDE59',
            }} />

            <View style={{
              width: dimensions.width * 0.45,
              alignSelf: 'flex-start',
            }}>

              <Text style={{
                textAlign: 'center',
                fontFamily: fontInterRegular,
                fontWeight: '700',
                fontSize: dimensions.width * 0.04,
                alignItems: 'center',
                alignSelf: 'flex-start',
                color: 'white',
                paddingHorizontal: dimensions.width * 0.01,
              }}>
                Projects Completed
              </Text>

              <Text style={{
                textAlign: 'center',
                fontFamily: fontInterRegular,
                fontWeight: '300',
                fontSize: dimensions.width * 0.03,
                alignItems: 'center',
                alignSelf: 'flex-start',
                color: 'white',
                opacity: 0.5,
                paddingHorizontal: dimensions.width * 0.01,
                marginTop: dimensions.height * 0.016,
              }}>
                Total projects completed
              </Text>

              <Text style={{
                textAlign: 'center',
                fontFamily: fontInterRegular,
                fontWeight: '700',
                fontSize: dimensions.width * 0.08,
                alignItems: 'center',
                alignSelf: 'flex-start',
                color: 'white',
                paddingHorizontal: dimensions.width * 0.01,
                marginTop: dimensions.height * 0.019,
              }}>
                {completedCount ? completedCount : 0}
              </Text>
            </View>
          </View>


          <View style={{
            width: dimensions.width * 0.93,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: dimensions.height * 0.01,
          }}>
            <View style={{
              width: dimensions.width * 0.455,
              paddingVertical: dimensions.height * 0.028,
              paddingHorizontal: dimensions.width * 0.03,
              backgroundColor: '#1D1D1D',
              alignSelf: 'center',
              borderRadius: dimensions.width * 0.025,
              alignItems: 'center',
            }}>
              <Text style={{
                textAlign: 'center',
                fontFamily: fontInterRegular,
                fontWeight: '700',
                fontSize: dimensions.width * 0.04,
                alignItems: 'center',
                alignSelf: 'flex-start',
                color: 'white',
                paddingHorizontal: dimensions.width * 0.01,
              }}>
                Pending Projects
              </Text>

              <Text style={{
                textAlign: 'left',
                fontFamily: fontInterRegular,
                fontWeight: '300',
                fontSize: dimensions.width * 0.03,
                alignSelf: 'flex-start',
                color: 'white',
                opacity: 0.5,
                paddingHorizontal: dimensions.width * 0.01,
                marginTop: dimensions.height * 0.016,
              }}
              >
                Total pending projects
              </Text>

              <Text style={{
                textAlign: 'center',
                fontFamily: fontInterRegular,
                fontWeight: '700',
                fontSize: dimensions.width * 0.08,
                alignItems: 'center',
                alignSelf: 'flex-start',
                color: 'white',
                paddingHorizontal: dimensions.width * 0.01,
                marginTop: dimensions.height * 0.019,
              }}>
                {pendingCount ? pendingCount : 0}
              </Text>
            </View>


            <View style={{
              width: dimensions.width * 0.455,
              paddingVertical: dimensions.height * 0.028,
              paddingHorizontal: dimensions.width * 0.03,
              backgroundColor: '#1D1D1D',
              alignSelf: 'center',
              borderRadius: dimensions.width * 0.025,
              alignItems: 'center',
            }}>
              <Text style={{
                textAlign: 'center',
                fontFamily: fontInterRegular,
                fontWeight: '700',
                fontSize: dimensions.width * 0.04,
                alignItems: 'center',
                alignSelf: 'flex-start',
                color: 'white',
                paddingHorizontal: dimensions.width * 0.01,
              }}>
                Project In Progress
              </Text>

              <Text style={{
                textAlign: 'left',
                fontFamily: fontInterRegular,
                fontWeight: '300',
                fontSize: dimensions.width * 0.03,
                alignSelf: 'flex-start',
                color: 'white',
                opacity: 0.5,
                paddingHorizontal: dimensions.width * 0.01,
                marginTop: dimensions.height * 0.016,
              }}
              >
                Total projects in progress
              </Text>

              <Text style={{
                textAlign: 'center',
                fontFamily: fontInterRegular,
                fontWeight: '700',
                fontSize: dimensions.width * 0.08,
                alignItems: 'center',
                alignSelf: 'flex-start',
                color: 'white',
                paddingHorizontal: dimensions.width * 0.01,
                marginTop: dimensions.height * 0.019,
              }}>
                {inProgressCount ? inProgressCount : 0}
              </Text>
            </View>

          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default AnalysisScreen;
