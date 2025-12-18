import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolation,
    withTiming
} from 'react-native-reanimated';
import ImageCard from './ImageCard';
import { addToTrash } from '../utils/TrashManager';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const CardStack = forwardRef(({ onSwipe, ...props }, ref) => {
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    const [photos, setPhotos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [endCursor, setEndCursor] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    useImperativeHandle(ref, () => ({
        swipeLeft: () => triggerSwipeLeft(),
        swipeRight: () => triggerSwipeRight(),
    }));

    const resetPosition = () => {
        translateX.value = 0;
        translateY.value = 0;
    };

    const handleAction = async (deletePhoto) => {
        if (!photos || photos.length === 0 || currentIndex >= photos.length) return;
        const currentPhoto = photos[currentIndex];

        setCurrentIndex(prev => prev + 1);
        resetPosition();

        if (deletePhoto) {
            await addToTrash(currentPhoto);
        }
        if (onSwipe) {
            onSwipe(deletePhoto ? 'left' : 'right');
        }
    };

    const triggerSwipeLeft = () => {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, {}, () => {
            runOnJS(handleAction)(true);
        });
    };

    const triggerSwipeRight = () => {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, {}, () => {
            runOnJS(handleAction)(false);
        });
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd(() => {
            if (translateX.value < -SWIPE_THRESHOLD) {
                translateX.value = withSpring(-SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(handleAction)(true);
                });
            } else if (translateX.value > SWIPE_THRESHOLD) {
                translateX.value = withSpring(SCREEN_WIDTH * 1.5, {}, () => {
                    runOnJS(handleAction)(false);
                });
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const animatedCardStyle = useAnimatedStyle(() => {
        const rotate = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-10, 0, 10],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotate}deg` },
            ],
            zIndex: 1,
        };
    });

    const backCardStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH * 0.5],
            [0.95, 1],
            Extrapolation.CLAMP
        );

        const translateYVal = interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH * 0.5],
            [10, 0],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { scale },
                { translateY: translateYVal },
            ],
            opacity: interpolate(
                Math.abs(translateX.value),
                [0, SCREEN_WIDTH * 0.5],
                [0.8, 1],
                Extrapolation.CLAMP
            ),
        };
    });

    async function loadPhotos(cursor = null) {
        if (isLoading) return;
        setIsLoading(true);

        try {
            if (permissionResponse?.status !== 'granted') {
                const { status } = await requestPermission();
                if (status !== 'granted') {
                    setIsLoading(false);
                    return;
                }
            }

            let options = {
                mediaType: ['photo', 'video'],
                first: 3,
            };

            if (Platform.OS === 'android') {
                const totalAssets = await MediaLibrary.getAssetsAsync({
                    mediaType: ['photo', 'video'],
                    first: 0
                });

                if (totalAssets.totalCount > 3) {
                    const randomOffset = Math.floor(Math.random() * (totalAssets.totalCount - 3));
                    options.after = String(randomOffset);
                }
            } else if (cursor) {
                options.after = cursor;
            }

            const assets = await MediaLibrary.getAssetsAsync(options);

            setPhotos(prevPhotos => {
                const existingIds = new Set(prevPhotos.map(p => p.id));
                const newItems = assets.assets.filter(item => !existingIds.has(item.id));

                const shuffledBatch = [...newItems].sort(() => 0.5 - Math.random());

                return [...prevPhotos, ...shuffledBatch];
            });

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

    if (!currentPhoto) {
        return (
            <View style={styles.centerContainer}>
                <Text>No hay más fotos</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {nextPhoto && (
                <Animated.View style={[styles.cardContainer, styles.cardBehind, backCardStyle]}>
                    <ImageCard
                        image={{ uri: nextPhoto.uri }}
                        title={nextPhoto.filename}
                        subtitle={new Date(nextPhoto.creationTime).toLocaleDateString()}
                        mediaType={nextPhoto.mediaType}
                        isActive={false}
                    />
                </Animated.View>
            )}

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
                    <ImageCard
                        image={{ uri: currentPhoto.uri }}
                        title={currentPhoto.filename}
                        subtitle={new Date(currentPhoto.creationTime).toLocaleDateString()}
                        mediaType={currentPhoto.mediaType}
                        isActive={true}
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
});

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
    }
});

export default CardStack;
