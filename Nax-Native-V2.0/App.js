import { StatusBar } from 'expo-status-bar';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { useState, useMemo, useRef, useEffect} from 'react';
import config from './config';
import React from 'react';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Feather from 'react-native-vector-icons/Feather';
import { WebView } from 'react-native-webview';
import AboutMe from './About_me';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

//fix media playback
//fix finish screen
//About me page
//fix loading page


const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get('window');
const deviceID = Device.osInternalBuildId // get the device ID


const HomeScreen = ({ navigation, query, setQuery, handleSubmit, maxResults, setMaxResults, channel, setChannel, numTextInputs, setNumTextInputs, data, error, setData, setError, queryString, setQueryString }) => (
  <View style={styles.container}>
    <View style={{ marginTop:0, marginBottom: 60, justifyContent: "center", alignItems: "center"}}>
      <FontAwesome6 name="brain" size={30} color="#A604F2" style={styles.brainIcon}/>
      <Feather name="shield" size={100} color="#A604F2" style={{position: "absolute"}} />
    </View>
    <View style={styles.settingsContainer}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Nax</Text>
        <Text style={styles.textDescription}>Don't let algorithms decide what you watch</Text>
      </View>
      <TextInput
        style={styles.input1}
        value={queryString}
        onChangeText={(value) => setQueryString(value)} // Update the state when the text changes
        placeholder='keywords/hashtags'
      />
      <TextInput
        style={styles.input}
        placeholder='max videos'
        value={maxResults}
        onChangeText={(value) => setMaxResults(value)}
        keyboardType='numeric'
      />

      <TouchableOpacity style={styles.button} onPress={() => handleSubmit(navigation)}>
        <Text style={{fontSize: 15, color: "white", fontWeight: 900}}>Submit</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errors}>{JSON.stringify(error)}</Text>}
      <StatusBar style="auto" />
    </View>
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => navigation.navigate('AboutMe')}>
            <Text style={styles.bottomText}>here</Text>
      </TouchableOpacity>
    </View>
  </View>
);


function VideoScreenWrapper({ data, maxResults }) {
  const { width, height } = Dimensions.get('window');
  const flatListRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(null);
  const topHeight = useHeaderHeight();
  const webViewRefs = useRef([]);

  console.log(`top height: ${topHeight}`);

  const handleEndReached = () => {
    console.log("You've reached the end!");
  };

  const handleViewableItemsChanged = ({ viewableItems }) => {
    const visibleIndex = viewableItems[0]?.index;
    console.log(`*********visible index: ${visibleIndex}**********8`);
    if (visibleIndex !== undefined && visibleIndex !== currentVideoIndex) {
      setCurrentVideoIndex(visibleIndex);
      webViewRefs.current.forEach((ref, index) => {
        if (ref && index !== visibleIndex) {
          ref.injectJavaScript('document.querySelector("video").pause();');
        }
      });
    }
  };

  console.log("videos: ", data);

  try {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "black", height: "100%", width: width }}>
        <View style={{ backgroundColor: "black", height: height, width: width, marginTop: 0, marginBottom: 0, padding: 0, justifyContent: "center", alignItems: "center" }}>
          <FlatList
            style={{ flex: 1, marginBottom: 0, padding: 0, backgroundColor: "black" }}
            data={data}
            renderItem={({ item, index }) => (
              <WebView
                ref={(ref) => (webViewRefs.current[index] = ref)}
                source={{ uri: item }}
                style={{ backgroundColor: "black", height: height, width: width, flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginTop: 0, marginBottom: 0 }}
                mediaPlaybackRequiresUserAction={true}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
            pagingEnabled
            initialNumToRender={1}
            showsVerticalScrollIndicator={false}
            ref={flatListRef}
            onViewableItemsChanged={handleViewableItemsChanged}
            onEndReached={handleEndReached}
          />
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    console.log(error);
  }
}

export default function App() {
  const [maxResults, setMaxResults] = useState(5);
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState([]);
  const [channel, setChannel] = useState([]);
  const [numTextInputs,setNumTextInputs] = useState(0);
  const [numVideos, setNumVideos] = useState(0);
  const [queryString, setQueryString] = useState("");
  const [isFirstLaunched, setIsFirstLaunched] = useState(null)

  useEffect(() =>{
    const checkFirstLaunch = async () => {
      console.log("Checking first launch");
      console.log("device ID: ", deviceID);
    try{
      const hashLaunched = await AsyncStorage.getItem('hasLaunched');
      console.log("hashLaunched: ", hashLaunched);
      if (hashLaunched===null){
        try {
          console.log('sending device ID');
          const sendID = await fetch(`https://reimagined-spork-wr9rq49rqrp4h9q74-1028.app.github.dev/api/keys`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceID: deviceID,
            }),
          });
          
          if (!sendID.ok) {
            console.log('error sending device ID');
          }
          const sendIDJson = await sendID.json();
          console.log(`sendIDJson: ${sendIDJson.api_key}`);
          const api_key = sendIDJson.api_key;
          await AsyncStorage.setItem('api_key', api_key);
          AsyncStorage.setItem('deviceID', deviceID);
          console.log(`device ID: ${deviceID}`);
        } catch (error) {
          console.log(`error sending device ID: ${error}`);
        }
        await AsyncStorage.setItem('hasLaunched', 'true');
        console.log("hasLaunchedNew", hashLaunched);
        setIsFirstLaunched(true)
      } else {
        setIsFirstLaunched(false)
      }
    }
    catch (error){
      console.error('Error Checking first launch: ', error);
    }
  };
  checkFirstLaunch();
  }, []);


  const handleQuery = async(query, queryString,) =>{
    try{
      query.length = 0;
      let currentWord = "";
      for(let i = 0; i<=queryString.length; i++){
        let character = queryString[i];
        if(character==" " || character==","){
          if (currentWord){
            query.push(currentWord);
            currentWord = "";
          }
        }else if(character!=undefined){
          currentWord += character;
        }
      }
      if(currentWord){
          query.push(currentWord)
        }
      //query.pop()
      console.log(query)
    }catch(error){
      console.log(`error from handle query: ${error}`)
    }
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
      setError("Please enter one or more keywords or hashtags");
      console.log("error in the second one");
      return;
    }
    if (queryString==""){
      setQueryString(null)
      setError("Please enter one or more keywords or hashtags")
    } else if (!query){
      setError("Please enter one or more keywords or hashtags")
    }
      try{
        handleQuery(query, queryString);
      }catch(error){
        console.log(`error while converting: ${error}`);
      }
      console.log("actually sending it")
      
      try {
        const response = await fetch(`${config.API_URL}/api/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json",
            "X-Api-Key": await AsyncStorage.getItem('api_key')
           },
          body: JSON.stringify({
            number_of_shorts: maxResults,
            query: query,
            channel: channel,
          }),
        });
        setData({number_of_shorts: maxResults, query: query, channel: channel});
        

      if(!response.ok){
        const errData = await response.json();
        setError("Please enter one or more keywords or hashtags");
        return;
      }
      console.log("Data sent");

      const dataJson = await response.json();
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
          screenEnabled: false,
        }}
        styles={{backgroundColor: "black"}}
      >
      <Stack.Screen name="Home">
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
          queryString={queryString}
          setQueryString={setQueryString}
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

        <Stack.Screen name="AboutMe" component={AboutMe}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
 //{error && <Text>{error}</Text>}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: height,
    width: width,
    backgroundColor: '#0A0D17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: "absolute",
    bottom: 10,
  },
  bottomText: {
    color: "grey",
  },
  text: {
    fontSize: 30,
    fontWeight: 600,
    color: "white",
  },
  textDescription: {
    fontSize: 16,
    fontWeight: 400,
    color: "white",
    opacity: .6,
    marginLeft: width/20,
    marginRight: width/20,
    textAlign: "center",
    marginBottom: 30,
  },
  settingsContainer:{
    backgroundColor: "#3b3d45",
    width: width*.75,
    height: height*.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    overflow: 'hidden',
  },
  textContainer:{
    position: "absolute",
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    position: 'absolute',
    color: "black",
    backgroundColor: "#b6b6b9",
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    top:220,
    width: width/2,
  },
  input1: {
    position: "absolute",
    color: "black",
    backgroundColor: "#b6b6b9",
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    top: 140,
    width: width/2,
  },
  errors: {
    position: "absolute",
    color: "red",
    bottom: 10,
    left:10,
  },
  button:{
    position: "absolute",
    backgroundColor: "#A604F2",
    color: "#A604F2",
    borderRadius: 5,
    width: width/3.7,
    height:  34,
    bottom: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  brainIcon: {
    position: "absolute",
  }
});


//Sigma rizzy balls
//+big jug tits
//goon sesh with the boys^2
//==gay fortnite