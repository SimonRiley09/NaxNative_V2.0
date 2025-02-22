import { StatusBar } from 'expo-status-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, FlatList, Dimensions, ScrollView, Platform } from 'react-native';
import react, { useState, useCallback, useRef, useEffect } from 'react';
import config from './config';
import React from 'react';
import WebView from 'react-native-webview';





//currently transitioning to react-native-youtube-iframe
//Change backend so that it send the video ID instead of the URL, as this new library only needs the id
//copy and paste the basic usage from the documentation page: https://lonelycpp.github.io/react-native-youtube-iframe/basic-usage



const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get('window');


const HomeScreen = ({ navigation, query, setQuery, handleSubmit, maxResults, setMaxResults, channel, setChannel, numTextInputs, setNumTextInputs, data, error, setData, setError }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      value={query} // Set the value of TextInput to the state variable
      onChangeText={(value) => setQuery(value)} // Update the state when the text changes
      placeholder='keywords/hashtags (e.g. "#funny cooking" no commas)'
    />
    <TextInput
      style={styles.input}
      placeholder='max videos'
      value={maxResults}
      onChangeText={(value) => setMaxResults(value)}
      keyboardType='numeric'
    />
    <TouchableOpacity onPress={()=>setNumTextInputs(val=>val+1)} style={styles.buttton}>
            <Text style={styles.text}> Add Channel </Text>
      </TouchableOpacity>
      <ScrollView style={{flex:1}}>
            {[...Array(numTextInputs).keys()].map(key=>{
              return <TextInput value={channel[key] || ""} 
                        onChangeText={(value) => {
                          const newChannelInputs = [...channel];
                          newChannelInputs[key] = value;
                          setChannel(newChannelInputs);
                        }}  
                        key={key}
                        placeholder="Channel name without @"
                        style={styles.input}/>
            })}
      </ScrollView>

    <Button title="Submit" onPress={() => handleSubmit(navigation)} />    

    {data && <Text>{JSON.stringify(data)}</Text>}
    {channel && <Text>{JSON.stringify(channel)}</Text>}
    {error && <Text>{JSON.stringify(error)}</Text>}
    <StatusBar style="auto" />
  </View>
);


function VideoScreenWrapper({data, maxResults}){
  console.log(data)
  const playerRef = useRef(null);
  const [videos, setVideos] = useState([]);
  const { width, height } = Dimensions.get('window');


  for (let i = 0; i < data.length; i++) {
    videos.push({uri: data[i], title: `Video ${i}`},);
  }
  //const URL = data[0]
  console.log("videos: ", videos);
  const VideoView = ({URL}) =>(
    <WebView
        source={{ uri: URL }}
        style={{ width: '100%', height: '100%' }}
    />
  )
  return (
    <FlatList
        data={videos}
        renderItem={({item}) => <VideoView URL={item.uri} />}
        keyExtractor={item => item.uri}
      />
);
}

export default function App() {
  const [userInfo, setUserInfo] = useState(null);
  const [maxResults, setMaxResults] = useState(5);
  const [token, setToken] = useState(null);4
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState([]);
  const [numTextInputs,setNumTextInputs] = useState(0);
  const [numVideos, setNumVideos] = useState(0);


  const handleSubmit = async (navigation) =>{
    setError(null);
    setData(null);


    console.log("Sending data to the server");
    if (channel && query && channel.length > 0){
      setError("Please only enter a channel or a query, not both");
      console.log("error in the first one")
      return;
    }
    if (!channel && !query){
      setError("Please enter a channel or a query");
      console.log("error in the second one");
      return;
    }

    console.log("actually sending it")
    try {
      const response = await fetch(`${config.API_URL}/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number_of_shorts: maxResults,
          query: query,
          channel: channel,
        }),
      });
      setData({number_of_shorts: maxResults, query: query, channel: channel});

      if(!response.ok){
        const errData = await response.json();
        setError(errData.error || "An error occurred");
        return;
      }
      console.log("Data sent");

      const json = await response.json();
      const {token} = json;
      setToken(token);
      console.log("Token received", token);
      setData({token: token, data:{number_of_shorts: maxResults, query: query}});
      console.log("Data set: ", data);


      const dataResponse = await fetch(`${config.API_URL}/api/data?token=${token}`);
      if(!dataResponse.ok){
        setError("Error fetching the data");
        return;}
      const dataJson = await dataResponse.json();
      setData(dataJson);
      navigation.navigate('VideoScreen', {
        data: dataJson,
        numVideos: maxResults
      });
      console.log("data recieved: ", data);
    }catch (error) { 
      setError(error); 
      console.log(error);
    }
  }



  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      ><Stack.Screen name="Home">
      {({navigation}) => (
        <HomeScreen 
          navigation={navigation}
          query={query}
          setQuery={setQuery}
          maxResults={maxResults}
          setMaxResults={setMaxResults}
          channel={channel}
          setChannel={setChannel}
          numTextInputs={numTextInputs}
          setNumTextInputs={setNumTextInputs}
          error={error}
          setError={setError}
          handleSubmit={handleSubmit}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="VideoScreen">
      {({navigation}) => (
        <VideoScreenWrapper
          navigation={navigation}
          data={data}
          numVideos={numVideos}
          maxResults={maxResults}
            />
          )}
        </Stack.Screen>
        {/*<Stack.Screen 
          name="Contact" 
          component={ContactScreen}
        />*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
 //{error && <Text>{error}</Text>}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 50,
  },
  button :{
    marginVertical : 10,
  },
  contentContainer: {
    flex: 1,
    //padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    //paddingHorizontal: 50,
  },
  video: {
    flex: 1,
    width: {width},
    height: {height},
  },
  controlsContainer: {
    padding: 10,
  },
  videoContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  }
});
