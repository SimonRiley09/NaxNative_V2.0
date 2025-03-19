import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={{alignItems: "center", justifyContent: "center", marginBottom: 150}}>
          <FontAwesome6 name="brain" size={50} color="#A604F2" styles={{position: "absolute"}}/>
          <Feather name="shield" size={166.666666667} color="#A604F2" style={{position: "absolute"}} />
      </View>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Your videos are loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D17',
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default LoadingScreen;