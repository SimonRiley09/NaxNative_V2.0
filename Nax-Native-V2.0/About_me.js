import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const {width, height} = Dimensions.get("window")

const AboutMe = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('./assets/20250307_103721.jpg')} style={{width: 200, height: 246.40883978, position: "absolute", top: height/8, marginBottom: 200}}/>
      <Text style={styles.text}>My name is Shayan Shamsi Pour Siahmazgi. I was born in Tehran, Iran, and I'm currently living in the state of Indiana, US and studying as a high school student at Bloomington High School South. I am passionate about finance and technology. My goal with this app is to help my generation overcome their screen addiction. I try to keep this app free of charge and ads so everybody can enjoy it. Please consider recommending this app to your friends.</Text>
    </View> 
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    width: width,
    backgroundColor: '#0A0D17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    position: "relative",
    color: "white",
    marginLeft: 50,
    marginRight: 50,
  },


});

export default AboutMe;