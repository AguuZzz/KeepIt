import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import LogoText from '../assets/Icons/Logos/LogoText.png';
import CardStack from '../components/CardStack';

const HomeScreen = () => {
  const cardStackRef = React.useRef();

  return (
    <View style={styles.container}>
      <View style={styles.topIcon}>
        <Image style={{ width: 120, height: 40 }} source={LogoText} />
      </View>
      <CardStack ref={cardStackRef} />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => cardStackRef.current?.swipeLeft()}
        >
          <Text style={styles.buttonText}>❌</Text>
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
  topIcon: { position: 'absolute', top: 50, width: '100%', alignItems: 'center', zIndex: 10 },
  buttonsContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
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
});

export default HomeScreen;
