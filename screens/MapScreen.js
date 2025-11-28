import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Image, Platform, TouchableOpacity, Modal, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { location, matches } from '../services/api';

export default function MapScreen({ route, navigation }) {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [nearbyUsers, setNearbyUsers] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const [filter, setFilter] = useState('all'); // all, male, female
    const [selectedUser, setSelectedUser] = useState(null);

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
        // console.log('Updating location:', coords); 
        await location.update(coords.latitude, coords.longitude, userId);
        const users = await location.getNearby(coords.latitude, coords.longitude, userId, filter);
        // console.log('Nearby users:', users);
        setNearbyUsers(users);
    };

    const handleLike = async (likedUser) => {
        if (!likedUser) return;

        const result = await matches.like(userId, likedUser.id);
        if (result.success) {
            if (result.match) {
                Alert.alert('IT\'S A MATCH! 🎉', `You and ${likedUser.name} liked each other!`);
            } else {
                Alert.alert('Liked!', `You liked ${likedUser.name}`);
            }
            setSelectedUser(null); // Close card
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
                // onUserLocationChange={(e) => updateLocation(e.nativeEvent.coordinate)} // Disabled to prevent infinite loop
                onPress={() => setSelectedUser(null)}
            >
                {nearbyUsers.map((user) => (
                    <Marker
                        key={user.id}
                        coordinate={{
                            latitude: user.latitude,
                            longitude: user.longitude,
                        }}
                        onPress={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                        }}
                    >
                        <View style={styles.markerContainer}>
                            <View style={[styles.markerBubble, user.gender === 'female' ? styles.female : styles.male]} />
                            <Image
                                source={{ uri: user.photo_url || 'https://ui-avatars.com/api/?name=' + user.name }}
                                style={styles.avatar}
                            />
                        </View>
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

            {/* User Card (Bottom Sheet) */}
            {selectedUser && (
                <View style={styles.userCard}>
                    <View style={styles.cardHeader}>
                        <Image
                            source={{ uri: selectedUser.photo_url || 'https://ui-avatars.com/api/?name=' + selectedUser.name }}
                            style={styles.cardAvatar}
                        />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardName}>{selectedUser.name}</Text>
                            <Text style={styles.cardBio}>{selectedUser.gender}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => handleLike(selectedUser)}
                    >
                        <Text style={styles.likeButtonText}>LIKE ❤️</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        width: 44,
        height: 44,
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
        backgroundColor: '#ddd', // Fallback color
    },
    female: {
        backgroundColor: '#FF416C',
    },
    male: {
        backgroundColor: '#007AFF',
    },
    // User Card Styles
    userCard: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    cardInfo: {
        flex: 1,
    },
    cardName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    cardBio: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
        textTransform: 'capitalize',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#999',
    },
    likeButton: {
        backgroundColor: '#FF416C',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    likeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
