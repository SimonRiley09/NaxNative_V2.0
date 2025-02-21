import { StatusBar } from 'expo-status-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, ScrollView, Dimensions, FlatList, Platform } from 'react-native';
import react, { useState, useRef } from 'react';
import config from './config';
import { Video, ResizeMode } from 'expo-av';
import YoutubePlayer from "react-native-youtube-iframe";



//currently transitioning to react-native-youtube-iframe
//Change backend so that it send the video ID instead of the URL, as this new library only needs the id
//copy and paste the basic usage from the documentation page: https://lonelycpp.github.io/react-native-youtube-iframe/basic-usage
// **Very Important** Use OAuth insead of API key, and then learn how to put it in your cod, build it then give the SHA 1 fingerprint after you build for android
// Android Client ID:  740703559154-k4doht7ajcuebuajjha6t2f93kjhqfpk.apps.googleusercontent.com


const Stack = createNativeStackNavigator();

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
  const videoSource = 'https://www.youtube.com/watch?v=med2xOFcTG0'
  const video = useRef(null);
  const [status, setStatus] = useState({});
  if ( data && data.length > 0){
  try{
  return (
      <View style={styles.container}>
        <Video
          ref={video}
          style={styles.video}
          source={{
            uri: 'videoSource',
          }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          onPlaybackStatusUpdate={status => setStatus(() => status)}
        />
        <View style={styles.buttons}>
          <Button
            title={status.isPlaying ? 'Pause' : 'Play'}
            onPress={() =>
              status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
            }
          />
        </View>
      </View>
    );}catch (error){
      console.log("Error in the video", error);
    }
  }else{
    console.log("No data")
  }
}

export default function App() {
  const [maxResults, setMaxResults] = useState(5);
  const [token, setToken] = useState(null);4
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState([]);
  const [numTextInputs,setNumTextInputs] = useState(0);
  const [numVideos, setNumVideos] = useState(0);

  if (Platform.OS === 'ios'){
    console.log("IOS")
  } else if (Platform.OS === 'android'){
    console.log("Android")
  }

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
    width: '80%',
    height: '80%',
  },
  controlsContainer: {
    padding: 10,
  },
});
