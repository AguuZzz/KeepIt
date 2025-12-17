import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const ImageCard = ({ image, title, subtitle, mediaType, isActive }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const dynamicCardStyle = {
        width: isLandscape ? '60%' : '85%',
        height: isLandscape ? '75%' : '70%',
    };

    const isVideo = mediaType === 'video';

    return (
        <View style={[styles.card, dynamicCardStyle]}>
            {isVideo ? (
                <Video
                    source={image}
                    style={styles.image}
                    resizeMode={ResizeMode.COVER}
                    isLooping
                    shouldPlay={isActive}
                    isMuted={true}
                />
            ) : (
                <Image source={image} style={styles.image} />
            )}

            <View style={styles.overlay}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
        </View>
    );
};

export default ImageCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    overlay: {
        position: 'absolute',
        bottom: 0,
        height: '15%',
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.57)',
        padding: 12,
        justifyContent: 'center',
    },

    title: {
        marginTop: -30,
        marginBottom: 10,
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },

    subtitle: {
        color: '#ddd',
        fontSize: 16,
    },
});
