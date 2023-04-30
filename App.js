import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Image, Button, Alert, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import Slider from '@react-native-community/slider';

export default function App() {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState([]);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    (async () => {
      // Ask for permission to access the media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log("MediaLibrary Permission Status:", status);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'This app needs access to your camera roll to save photos.');
      }
    })();
  }, []);

  const searchPhotos = async () => {
    const url = `https://pixabay.com/api/?key=35716142-413bb8c462e3771702ec58758&q=${query}&image_type=photo&per_page=${perPage}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.hits.length > 0) {
      const newPhotos = data.hits.map(hit => hit.webformatURL);
      setPhotos(newPhotos);
    } else {
      setPhotos([]);
      Alert.alert('Error', 'No photos found');
    }
  };

  const savePhoto = async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log("MediaLibrary Permission Status:", status);
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Success', 'Photo saved to camera roll');
      } else {
        Alert.alert('Permission needed', 'This app needs access to your camera roll to save photos.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not save photo to camera roll');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
  
      if (!result.canceled) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setPhotos([...photos, ...newPhotos]);
      }
    } else {
      Alert.alert('Permission needed', 'This app needs access to your camera roll to select photos.');
    }
  };

  const saveAllPhotos = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log("MediaLibrary Permission Status:", status);
      if (status === 'granted') {
        await Promise.all(
          photos.map(async (uri) => {
            await MediaLibrary.saveToLibraryAsync(uri);
          })
        );
        Alert.alert('Success', 'All photos saved to camera roll');
      } else {
        Alert.alert('Permission needed', 'This app needs access to your camera roll to save photos.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not save photos to camera roll');
    }
  };

  return (
    <View style={styles.container}>
          <TextInput
      style={styles.input}
      placeholder="Type your search here"
      value={query}
      onChangeText={text => setQuery(text)}
    />
    <Slider
      style={styles.slider}
      value={perPage}
      minimumValue={1}
      maximumValue={50}
      step={1}
      onValueChange={value => setPerPage(value)}
    />
    <Text style={styles.sliderText}>Photos per page: {perPage}</Text>
    <TouchableOpacity style={styles.button} onPress={searchPhotos}>
      <Text style={styles.title}>Search</Text>
    </TouchableOpacity>
    <ScrollView>
      {photos.map((uri, index) => (
        <View key={index}>
          <TouchableOpacity onPress={() => savePhoto(uri)}>
            <Image source={{ uri: uri }} style={styles.photo} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
    <View style={styles.buttons}>
      <TouchableOpacity style={[styles.button, styles.leftButton]} onPress={pickImage}>
        <Text style={styles.title}>Pick Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.rightButton]} onPress={saveAllPhotos}>
        <Text style={styles.title}>Save all</Text>
      </TouchableOpacity>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#fff',
alignItems: 'center',
justifyContent: 'center',
},
input: {
borderWidth: 1,
borderColor: 'gray',
padding: 10,
margin: 10,
marginTop: 50,
width: '80%',
borderRadius: 5,
},
photo: {
width: 300,
height: 300,
marginVertical: 20,
},
buttons: {
flexDirection: 'row',
justifyContent: 'space-between',
width: '80%',
},
leftButton: {
marginRight: 5,
},
rightButton: {
marginLeft: 5,
},
button: {
backgroundColor: 'red',
borderRadius: 10,
paddingVertical: 10,
paddingHorizontal: 12,
marginVertical: 10,
marginTop: 50,
},
title: {
color: '#fff',
fontSize: 16,
fontWeight: 'bold',
textAlign: 'center',
},
slider: {
width: '80%',
marginVertical: 20,
},
sliderText: {
fontSize: 16,
textAlign: 'center',
marginBottom: 20,
},
});
