import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';

const {width, height} = Dimensions.get("window")

const AboutMe = ({ navigation }) => {
  return (
    <View style={{ flex:1, justifyContent: "center", alignItems: "center", backgroundColor: "#0A0D17"}}>
        <View style={{alignItems: "center", justifyContent: "center", marginBottom:70}}>
          <FontAwesome6 name="brain" size={50} color="#A604F2" styles={{position: "absolute"}}/>
          <Feather name="shield" size={166.666666667} color="#A604F2" style={{position: "absolute"}} />
        </View>
        <Text style={{color: "white", fontSize: 55, fontWeight: 900}}>Nax</Text>
        <Text style={{color: "grey"}}>Overcome your scrolling addiction</Text>
        <Text style={{position: "absolute", bottom: 5, left:0, color: "grey", marginLeft: 10, marginRight: 10}}>© 2025 Shayan Shamsi Pour Siahmazgi. All rights reserved.</Text>
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