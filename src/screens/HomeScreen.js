import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoText from '../assets/Icons/Logos/LogoText.png';
import CardStack from '../components/CardStack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const cardStackRef = React.useRef();
  const [burntPhotos, setBurntPhotos] = React.useState(0);

  React.useEffect(() => {
    loadBurntPhotos();
  }, []);

  const loadBurntPhotos = async () => {
    try {
      const value = await AsyncStorage.getItem('burntPhotos');
      if (value !== null) {
        setBurntPhotos(parseInt(value, 10));
      }
    } catch (e) {
      console.error('Error loading burnt photos count:', e);
    }
  };

  const incrementBurntPhotos = async () => {
    try {
      const newValue = burntPhotos + 1;
      setBurntPhotos(newValue);
      await AsyncStorage.setItem('burntPhotos', newValue.toString());
    } catch (e) {
      console.error('Error saving burnt photos count:', e);
    }
  };

  const handleSwipe = (direction) => {
    if (direction === 'left') {
      incrementBurntPhotos();
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.top}>
        <View style={styles.topRow}>
          <Image style={{ width: 120, height: 40 }} source={LogoText} />
          <TouchableOpacity onPress={() => navigation.navigate('Trash')}>
            <Ionicons name="trash-outline" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.topText}>Fotos quemadas: {burntPhotos}</Text>
      </View>

      <CardStack ref={cardStackRef} onSwipe={handleSwipe} />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => cardStackRef.current?.swipeLeft()}
        >
          <Text style={styles.buttonText}>🔥</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => cardStackRef.current?.swipeRight()}
        >
          <Text style={styles.buttonText}>💚</Text>
        </TouchableOpacity>
      </View>

    </View>

  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonsContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    zIndex: 10,
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 24,
    textAlign: 'center',
  },
  top: {
    position: 'absolute',
    top: 50,
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 5,
  },
  topText: {
    textAlign: 'center',
    width: '100%',
  },

});

export default HomeScreen;
