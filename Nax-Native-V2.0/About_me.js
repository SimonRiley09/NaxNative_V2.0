import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Linking } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width, height} = Dimensions.get("window")

const AboutMe = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={{flex: 1, width: width, height: height}} contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
      <Image source={require('./assets/20250307_103721.jpg')} style={{width: 200, height: 246.40883978, top: height/8, marginBottom: 170, borderRadius: 30}}/>
      <Text style={styles.text}>My name is Shayan Shamsi Pour Siahmazgi. I was born in Tehran, Iran, but I currently live in the US. {"\n"}{"\n"}I am also passionate about finance and technology.  {"\n"}{"\n"}One thing I notices in my generation was the fact that scrolling on tik tok, ig reels and other social media platforms has become a big majority of our day, so I created Nax. I try to keep this app free of charge and ads so I can help anyone that needs it.{"\n"}{"\n"}Please consider recommending this app to your friends.{"\n"}{"\n"}</Text>
      <View>
        <TouchableOpacity style={{flexDirection: "row"}} onPress={() => Linking.openURL('https://www.linkedin.com/in/shayan-shamsi-pour/')}>
          <AntDesign name="linkedin-square" size={20} color="white"/>
          <Text style={styles.bullet}>  LinkedIn</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{flexDirection: "row", marginTop: 10}} onPress={() => Linking.openURL('mailto:s.shamsipour09@gmail.com')}>
          <MaterialCommunityIcons name="gmail" size={20} color="white"/>
          <Text style={styles.bullet}>  Gmail</Text>
        </TouchableOpacity>
      </View>
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

export default AboutMe;