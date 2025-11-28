import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { profile } from '../services/api';

export default function ProfileScreen({ route, navigation }) {
    const { userId } = route.params;
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [bio, setBio] = useState('');
    const [photoUrl, setPhotoUrl] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await profile.get(userId);
            setName(data.name);
            setGender(data.gender || '');
            setAge(data.age ? data.age.toString() : '');
            setBio(data.bio || '');
            setPhotoUrl(data.photo_url);
        } catch (error) {
            // If user not found (e.g. new profile), just ignore
            console.log('Profile load error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.3,
            base64: true,
        });

        if (!result.canceled) {
            // In a real app, you would upload this to a storage bucket (AWS S3, Supabase Storage)
            // For this demo, we'll just use the base64 string as a data URI
            // Note: This is not recommended for production as it bloats the database
            setPhotoUrl(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await profile.update(userId, {
                gender,
                age: parseInt(age) || null,
                bio,
                photo_url: photoUrl
            });
            Alert.alert('Success', 'Profile updated!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF416C" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FF4B2B', '#FF416C']}
                style={styles.header}
            >
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <View style={{ width: 50 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <ScrollView style={styles.content}>
                <View style={styles.photoContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={photoUrl ? { uri: photoUrl } : { uri: 'https://ui-avatars.com/api/?name=' + name }}
                            style={styles.photo}
                        />
                        <View style={styles.editBadge}>
                            <Text style={styles.editBadgeText}>📷</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.name}>{name}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderContainer}>
                            {['male', 'female', 'other'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.genderOption,
                                        gender === option && styles.genderOptionSelected
                                    ]}
                                    onPress={() => setGender(option)}
                                >
                                    <Text style={[
                                        styles.genderText,
                                        gender === option && styles.genderTextSelected
                                    ]}>
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                            placeholder="Enter your age"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            numberOfLines={4}
                            placeholder="Tell us about yourself..."
                        />
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                        <LinearGradient
                            colors={['#FF4B2B', '#FF416C']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.saveButtonGradient}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>SAVE PROFILE</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    photoContainer: {
        alignItems: 'center',
        marginTop: -50,
        marginBottom: 20,
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#eee',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    genderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    genderOption: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    genderOptionSelected: {
        backgroundColor: '#FF416C',
        borderColor: '#FF416C',
    },
    genderText: {
        color: '#666',
        fontWeight: '600',
    },
    genderTextSelected: {
        color: '#fff',
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
