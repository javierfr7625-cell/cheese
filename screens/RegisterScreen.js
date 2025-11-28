import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../services/api';

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const data = await auth.register(name, email, password);
            console.log('Register success:', data);
            // Pass userId to MapScreen
            navigation.replace('Map', { userId: data.user.id });
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=2069&auto=format&fit=crop' }}
            style={styles.background}
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.container}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join the community nearby.</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor="#rgba(255,255,255,0.6)"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#rgba(255,255,255,0.6)"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#rgba(255,255,255,0.6)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                                <LinearGradient
                                    colors={['#FF4B2B', '#FF416C']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>SIGN UP</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Log In</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    input: {
        padding: 16,
        color: '#fff',
        fontSize: 16,
    },
    button: {
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    linkText: {
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontSize: 14,
    },
    linkBold: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
