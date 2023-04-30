import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
export default function App() {
  const [photos, setPhotos] = useState([]);
  const [cameraPermission, setCameraPermission] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log("MediaLibrary Permission Status:", status);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'This app needs access to your camera roll to save photos.');
      } else {
        const media = await MediaLibrary.getAssetsAsync();
        setPhotos(media.assets);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log("Camera Permission Status:", status);
      setCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const { uri } = await cameraRef.current.takePictureAsync();
      const newPhotos = [{ uri }, ...photos];
      setPhotos(newPhotos);
      await MediaLibrary.saveToLibraryAsync(uri);
    }
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity style={styles.photoContainer}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
    </TouchableOpacity>
  );

  const { width } = Dimensions.get('window');
  const numColumns = 2;
  const itemWidth = (width - 20) / numColumns;

  return (
    <View style={styles.container}>
    {cameraPermission && (
      <View style={styles.cameraContainer}>
        <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={cameraRef}>
          <TouchableOpacity style={styles.takePictureButton} onPress={takePicture} />
        </Camera>
      </View>
    )}
    <FlatList
      data={photos}
      renderItem={renderPhoto}
      keyExtractor={(item, index) => index.toString()}
      numColumns={numColumns}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.contentContainer}
      getItemLayout={(data, index) => ({
        length: itemWidth,
        offset: itemWidth * index,
        index,
      })}
    />
  </View>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
  justifyContent: 'center',
  marginTop: 40,
},
cameraContainer: {
  width: '50%',
  height: 200,
  position: 'relative',
  
},
camera: {
  flex: 1,
  width: '100%',
},
takePictureButton: {
  width: 30,
  height: 30,
  backgroundColor: 'white',
  borderRadius: 30,
  position: 'absolute',
  bottom: 20,
  alignSelf: 'center',
},
photoContainer: {
  width: '50%',
  padding: 5,
},
  photo: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
})