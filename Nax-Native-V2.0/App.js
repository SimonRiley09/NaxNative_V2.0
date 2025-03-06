import { StatusBar } from 'expo-status-bar';
import {NavigationContainer, TabActions} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import { StyleSheet, Text, View, TextInput, Button, TouchableOpacity, FlatList, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import react, { useState, useMemo, useCallback, useRef, useEffect, Tabs } from 'react';
import config from './config';
import React from 'react';
import WebView from 'react-native-webview';





//currently transitioning to react-native-youtube-iframe
//Change backend so that it send the video ID instead of the URL, as this new library only needs the id
//copy and paste the basic usage from the documentation page: https://lonelycpp.github.io/react-native-youtube-iframe/basic-usage
//Use FlatList instead of scroll view
//UPDATE api backend to it switches APIs: Done
// Fix accepting arrays in backend



const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get('window');


const HomeScreen = ({ navigation, query, setQuery, handleSubmit, maxResults, setMaxResults, channel, setChannel, numTextInputs, setNumTextInputs, data, error, setData, setError, queryString, setQueryString }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      value={queryString}
      onChangeText={(value) => setQueryString(value)} // Update the state when the text changes
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
  const { width, height } = Dimensions.get('window');
  const flatListRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(null)
  const topHeight = useHeaderHeight();
  console.log(`top height: ${topHeight}`);

  const videos = useMemo(() => {
    return data.map((uri, index) => ({
      uri: uri,
      title: `Video ${index}`,
    }));
  }, [data]);

  const handleEndReached = () => {
    console.log("You've reached the end!");
  };

  const handleViewableItemsChanged = ({ viewableItems }) => {
    const visibleIndex = viewableItems[0].index;
    console.log(`*********visible index: ${visibleIndex}**********8`)
    if (visibleIndex !== undefined && visibleIndex !== currentVideoIndex) {
      setCurrentVideoIndex(visibleIndex);
    }
      };

  const URL = data[0];
  console.log("videos: ", videos);

  try {
    return (
      <View style={{backgroundColor: "black", height: height, width: width,  marginTop: 0,marginBottom: 0, padding: 0,}}>
        <FlatList
          style={{ flex: 1, marginBottom: 0, padding:0 }}
          data={videos}
          renderItem={({ item }) => (
            <WebView
              source={{ uri: item.uri }}
              style={{ backgroundColor: "black", height: height, width: width, flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', marginTop: 0, marginBottom: 0 }}
              mediaPlaybackRequiresUserAction={false}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
          pagingEnabled
          initialNumToRender={1}
          showsVerticalScrollIndicator={false}
          ref={flatListRef}
          onViewableItemsChanged={handleViewableItemsChanged}
        />
      </View>
    );
  } catch (error) {
    console.log(error);
  }
}

export default function App() {
  const [maxResults, setMaxResults] = useState(5);
  const [token, setToken] = useState(null);4
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState([]);
  const [channel, setChannel] = useState([]);
  const [numTextInputs,setNumTextInputs] = useState(0);
  const [numVideos, setNumVideos] = useState(0);
  const [queryString, setQueryString] = useState("");

  const handleQuery = async(query, queryString,) =>{
    try{
      query.length = 0;
      let currentWord = "";
      for(let i = 0; i<=queryString.length; i++){
        let character = queryString[i];
        if(character==" "){
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
      setError("Please enter a channel or a query");
      console.log("error in the second one");
      return;
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
    marginTop: 0,
    marginBottom: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    flex: 1,
    width: {width},
    height: {height},
  },
});


//Sigma rizzy balls
//+big jug tits
//goon sesh with the boys^2
//==gay fortnite