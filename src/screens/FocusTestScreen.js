import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Modal,
} from 'react-native';
import focusTestQuestionsData from '../components/focusTestQuestionsData';
import focusTestProductivityTexts from '../components/focusTestProductivityTexts';
import { XMarkIcon } from 'react-native-heroicons/solid';

const fontTTTravelsBlack = 'TTTravels-Black';
const fontTTTravelsRegular = 'TTTravels-Regular';

const FocusTestScreen = ({ setFocusTestStarted, focusTestStarted }) => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const styles = createStyles(dimensions);

  const [resultsFocusModalVisible, setResultsFocusModalVisible] = useState(false);

  const [selectedFocusAnswer, setSelectedFocusAnswer] = useState(null);
  const [currentFocusTestQuestIndex, setCurrentFocusTestQuestIndex] = useState(0);

  const [answersPoints, setAnswersPoints] = useState(0);


  useEffect(() => {
    if (!focusTestStarted) {
      setCurrentFocusTestQuestIndex(0);
      setSelectedFocusAnswer(null);
    }
  }, [focusTestStarted]);

  const handleFocusSelectAnswer = () => {

    setAnswersPoints(prev => prev + selectedFocusAnswer.points);

    setSelectedFocusAnswer(null);
    if (currentFocusTestQuestIndex === focusTestQuestionsData.length - 1) {
      setFocusTestStarted(false);
      setResultsFocusModalVisible(true);

    } else setCurrentFocusTestQuestIndex(prev => prev + 1);
  };

  return (
    <SafeAreaView style={{
      width: dimensions.width,
      paddingHorizontal: dimensions.width * 0.05,
      flex: 1,
    }}>
      {!focusTestStarted ? (
        <>
          <Text style={styles.mainTextBlack}
          >
            Productivity and habits test
          </Text>

          <Image
            source={require('../assets/images/noHabitsImage.png')}
            style={{
              alignSelf: 'center',
              height: dimensions.height * 0.3,
              width: dimensions.width * 0.7,
              marginTop: dimensions.height * 0.06,
            }}
            resizeMode='contain'
          />

          <TouchableOpacity
            onPress={() => {
              // setFocusTestStarted(true);
              startFocusTest();
            }}
            style={{
              width: dimensions.height * 0.12,
              alignItems: 'center',
              height: dimensions.height * 0.12,
              backgroundColor: '#B08711',
              borderRadius: dimensions.width * 0.6,
              alignSelf: 'center',
              justifyContent: 'center',
              marginTop: dimensions.height * 0.05,
            }}>
            <Image
              source={require('../assets/images/startImage.png')}
              style={{
                alignSelf: 'center',
                height: dimensions.height * 0.06,
                width: dimensions.height * 0.06,

              }}
              resizeMode='contain'
            />
          </TouchableOpacity>
        </>
      ) : focusTestStarted ? (
        <View style={{
          alignSelf: 'center',
          width: dimensions.width,
        }}>
          <View style={{
            width: dimensions.width * 0.9,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View style={{
              width: dimensions.width * 0.23
            }}></View>

            <Text style={styles.mainTextBlack}
            >
              {currentFocusTestQuestIndex + 1}/{focusTestQuestionsData.length}
            </Text>

            <TouchableOpacity onPress={() => {
              setFocusTestStarted(false);
              setCurrentFocusTestQuestIndex(0);
              setSelectedFocusAnswer(null);
              setAnswersPoints(0);
            }}>
              <Image
                source={require('../assets/images/exitImage.png')}
                style={{
                  width: dimensions.height * 0.07,
                  height: dimensions.height * 0.07,
                }}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.mainTextBlack, { fontSize: dimensions.width * 0.05, maxWidth: dimensions.width * 0.88, marginTop: dimensions.height * 0.01 },]}
          >
            {focusTestQuestionsData[currentFocusTestQuestIndex]?.question}
          </Text>

          <Image
            source={require('../assets/images/noHabitsImage.png')}
            style={{
              alignSelf: 'center',
              height: dimensions.height * 0.2,
              width: dimensions.width * 0.4,
              marginTop: dimensions.height * 0.01,
            }}
            resizeMode='contain'
          />

          {focusTestQuestionsData[currentFocusTestQuestIndex]?.answers.map((focusAnsw, index) => (
            <TouchableOpacity
              onPress={() => {
                if (selectedFocusAnswer === focusAnsw) {
                  setSelectedFocusAnswer(null);
                } else {
                  setSelectedFocusAnswer(focusAnsw);
                }
              }}
              key={index}
              style={{
                borderRadius: dimensions.width * 0.6,
                borderColor: selectedFocusAnswer === focusAnsw ? '#B08711' : 'transparent',
                flexDirection: 'row',
                justifyContent: 'center',
                backgroundColor: '#fff',
                alignItems: 'center',
                paddingHorizontal: dimensions.width * 0.05,
                marginTop: dimensions.height * 0.008,
                width: dimensions.width * 0.9,
                justifyContent: 'center',
                alignSelf: 'center',
                height: dimensions.height * 0.07,
                borderWidth: dimensions.width * 0.012,
                shadowColor: '#000000',
                shadowOffset: {
                  height: 2,
                },
                shadowOpacity: 0.1,
                shadowRadius: dimensions.width * 0.1,
              }}>
              <Text
                style={[styles.mainTextBlack, { fontSize: dimensions.width * 0.042, }]}
              >
                {focusAnsw.answer}
              </Text>
            </TouchableOpacity>
          ))}


        </View>
      ) : null}
      {focusTestStarted && (
        <TouchableOpacity
          disabled={selectedFocusAnswer === null || !focusTestStarted}
          onPress={() => {
            handleFocusSelectAnswer();
          }}
          style={{
            width: dimensions.width * 0.9,
            height: dimensions.height * 0.06,
            backgroundColor: selectedFocusAnswer ? '#B08711' : '#696969',
            borderRadius: dimensions.width * 0.6,
            alignSelf: 'center',
            position: 'absolute',
            bottom: dimensions.height * 0.05,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={[styles.mainTextBlack, {
            fontSize: dimensions.width * 0.05,
            color: selectedFocusAnswer ? '#ffff' : 'rgba(255, 255, 255, 0.25)',
            maxWidth: dimensions.width * 0.85,
          }]}
          >
            {currentFocusTestQuestIndex < focusTestQuestionsData.length - 1 ? 'Next' : 'Finish'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal visible={resultsFocusModalVisible} transparent={true} animationType="slide">
        <SafeAreaView style={{
          width: dimensions.width,
          height: dimensions.height,
          alignSelf: 'center',
          backgroundColor: '#f6f6f6',
          flex: 1,
        }}>
          <TouchableOpacity
            onPress={() => {
              setResultsFocusModalVisible(false);
              setFocusTestStarted(false);
              setCurrentFocusTestQuestIndex(0);
              setSelectedFocusAnswer(null);
              setAnswersPoints(0);
            }}
            style={{
              width: dimensions.height * 0.07,
              height: dimensions.height * 0.07,
              borderRadius: dimensions.width * 0.6,
              backgroundColor: '#FF1515',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-end',
              marginRight: dimensions.width * 0.05,
            }}>
            <XMarkIcon size={dimensions.height * 0.05} color='white' />
          </TouchableOpacity>

          <Image
            source={require('../assets/images/noHabitsImage.png')}
            style={{
              alignSelf: 'center',
              height: dimensions.height * 0.25,
              width: dimensions.width * 0.5,
              marginTop: dimensions.height * 0.007,
            }}
            resizeMode='contain'
          />

          <Text style={[styles.mainTextBlack, {
            fontSize: dimensions.width * 0.06,
            color: '#000',
            maxWidth: dimensions.width * 0.8,
          }]}
          >
            Your level of productivity
          </Text>

          <Text style={[styles.mainTextBlack, {
            fontSize: dimensions.width * 0.06,
            color: '#000',
            maxWidth: dimensions.width * 0.8,
            alignSelf: 'flex-end',
            fontWeight: 500,
            paddingHorizontal: dimensions.width * 0.07,
          }]}
          >
            {answersPoints}/100
          </Text>
          <View style={{
            width: dimensions.width * 0.9,
            alignSelf: 'center',
            height: dimensions.height * 0.04,
            borderRadius: dimensions.width * 0.6,
            borderWidth: dimensions.width * 0.003,
            marginTop: dimensions.height * 0.001,
            borderColor: '#B08711',
            overflow: 'hidden',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
            <View style={{
              width: dimensions.width * 0.9 * (answersPoints / 100),
              height: dimensions.height * 0.04,
              backgroundColor: '#B08711',
              borderRadius: dimensions.width * 0.6,
            }}></View>
          </View>

          <View style={{
            width: dimensions.width * 0.9,
            alignSelf: 'center',
          }}>
            <Text style={[styles.mainTextBlack, {
              fontSize: dimensions.width * 0.045,
              marginTop: dimensions.height * 0.02,
              alignSelf: 'flex-start',
              color: '#000',
              maxWidth: dimensions.width * 0.9,
            }]}
            >
              {answersPoints >= 80 ? focusTestProductivityTexts[0].title : answersPoints > 59 ? focusTestProductivityTexts[1].title : answersPoints > 39 ? focusTestProductivityTexts[2].title : focusTestProductivityTexts[3].title}
            </Text>

            <Text style={[styles.mainTextBlack, {
              fontSize: dimensions.width * 0.038,
              marginTop: dimensions.height * 0.015,
              alignSelf: 'flex-start',
              color: '#000',
              maxWidth: dimensions.width * 0.9,
              fontWeight: 400,
              fontFamily: fontTTTravelsRegular,
              textAlign: 'justify',
            }]}
            >
              {answersPoints >= 80 ? focusTestProductivityTexts[0].text : answersPoints > 59 ? focusTestProductivityTexts[1].text : answersPoints > 39 ? focusTestProductivityTexts[2].text : focusTestProductivityTexts[3].text}
            </Text>
          </View>

        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (dimensions) => StyleSheet.create({
  mainTextBlack: {
    textAlign: 'center',
    fontFamily: fontTTTravelsBlack,
    fontSize: dimensions.width * 0.06,
    alignItems: 'center',
    alignSelf: 'center',
    color: '#000000',
    maxWidth: dimensions.width * 0.7,
  }
});

export default FocusTestScreen;
