import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Linking } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get("window")

const Help = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={{flex: 1, width: width, height: height}} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
      <Text style={styles.text}>This app is not proven to help with your scrolling addiction. However there are features in this app that make scrolling less engaging which might help you overcome  those addictions.</Text>
    </ScrollView>
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
  bullet: {
    position: "relative",
    color: "white",
    textAlign: "left",
    alignItems: "left",
  }
});

export default Help;