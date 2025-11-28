import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, Platform, TouchableOpacity, Modal, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { location, matches } from '../services/api';

export default function MapScreen({ route, navigation }) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const [filter, setFilter] = useState('all'); // all, male, female

    // Get userId passed from Login/Register
    const userId = route.params?.userId;

    useEffect(() => {
        if (!userId) {
            navigation.replace('Login');
            return;
        }
    }, [userId]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let locationResult = await Location.getCurrentPositionAsync({});
            setCurrentLocation(locationResult.coords);

            updateLocation(locationResult.coords);
        })();
    }, [filter]); // Re-fetch when filter changes

    const updateLocation = async (coords) => {
        if (!coords) return;
        await location.update(coords.latitude, coords.longitude, userId);
        const users = await location.getNearby(coords.latitude, coords.longitude, userId, filter);
        setNearbyUsers(users);
    };

    const handleLike = async (likedUser) => {
        const result = await matches.like(userId, likedUser.id);
        if (result.success) {
            if (result.match) {
                Alert.alert('IT\'S A MATCH! 🎉', `You and ${likedUser.name} liked each other!`);
            } else {
                Alert.alert('Liked!', `You liked ${likedUser.name}`);
            }
        } else {
            Alert.alert('Error', result.message || 'Could not like user');
        }
    };

    if (!currentLocation) {
        return (
            <View style={styles.container}>
                <Text>{errorMsg || 'Loading map...'}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                onUserLocationChange={(e) => updateLocation(e.nativeEvent.coordinate)}
            >
                {nearbyUsers.map((user) => (
                    <Marker
                        key={user.id}
                        coordinate={{
                            latitude: user.latitude,
                            longitude: user.longitude,
                        }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={[styles.markerBubble, user.gender === 'female' ? styles.female : styles.male]} />
                            <Image
                                source={{ uri: user.photo_url || 'https://ui-avatars.com/api/?name=' + user.name }}
                                style={styles.avatar}
                            />
                        </View>
                        <Callout tooltip onPress={() => handleLike(user)}>
                            <View style={styles.callout}>
                                <Text style={styles.calloutTitle}>{user.name}</Text>
                                <Text style={styles.calloutSubtitle}>Tap to LIKE ❤️</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                {['all', 'male', 'female'].map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Matches', { userId })}
                >
                    <Text style={styles.actionButtonText}>💬</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Profile', { userId })}
                >
                    <Text style={styles.actionButtonText}>👤</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    filterContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        flexDirection: 'row',
    },
    filterButton: {
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterButtonActive: {
        backgroundColor: '#FF416C',
        borderColor: '#FF416C',
    },
    filterText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#333',
    },
    filterTextActive: {
        color: '#fff',
    },
    buttonsContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: '#fff',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginBottom: 10,
    },
    actionButtonText: {
        fontSize: 24,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerBubble: {
        width: 44,
        height: 44,
        borderRadius: 22,
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'white',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    female: {
        backgroundColor: '#FF416C',
    },
    male: {
        backgroundColor: '#007AFF',
    },
    callout: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        width: 140,
        alignItems: 'center',
        elevation: 5,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    calloutSubtitle: {
        color: '#FF416C',
        fontWeight: 'bold',
    }
});
