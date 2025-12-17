import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import ImageCard from './ImageCard';

const CardStack = () => {
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    const [photos, setPhotos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    async function loadPhotos(cursor = null) {
        if (isLoading || !hasNextPage) return;
        setIsLoading(true);

        try {
            if (permissionResponse?.status !== 'granted') {
                const { status } = await requestPermission();
                if (status !== 'granted') {
                    setIsLoading(false);
                    return;
                }
            }

            const assets = await MediaLibrary.getAssetsAsync({
                mediaType: ['photo', 'video'],
                first: 100,
                after: cursor,
                sortBy: ['creationTime'],
            });

            const newBatch = assets.assets.sort(() => 0.5 - Math.random());

            setPhotos(prevPhotos => [...prevPhotos, ...newBatch]);
            setEndCursor(assets.endCursor);
            setHasNextPage(assets.hasNextPage);
        } catch (error) {
            console.error("Error cargando fotos:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (permissionResponse) {
            loadPhotos();
        }
    }, [permissionResponse]);

    useEffect(() => {
        if (photos.length > 0 && (photos.length - currentIndex) < 10) {
            loadPhotos(endCursor);
        }
    }, [currentIndex, photos.length, endCursor]);

    if (!photos || photos.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text>Cargando fotos...</Text>
            </View>
        );
    }

    const currentPhoto = photos[currentIndex];
    const nextPhoto = photos[currentIndex + 1] || null;

    return (
        <View style={styles.container}>
            {nextPhoto && (
                <View style={[styles.cardContainer, styles.cardBehind]}>
                    <ImageCard
                        image={{ uri: nextPhoto.uri }}
                        title={nextPhoto.filename}
                        subtitle={new Date(nextPhoto.creationTime).toLocaleDateString()}
                        mediaType={nextPhoto.mediaType}
                        isActive={false}
                    />
                </View>
            )}

            <View style={styles.cardContainer}>
                <ImageCard
                    image={{ uri: currentPhoto.uri }}
                    title={currentPhoto.filename}
                    subtitle={new Date(currentPhoto.creationTime).toLocaleDateString()}
                    mediaType={currentPhoto.mediaType}
                    isActive={true}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBehind: {
        zIndex: 0,
        transform: [{ scale: 0.95 }, { translateY: 10 }],
    }
});

export default CardStack;
