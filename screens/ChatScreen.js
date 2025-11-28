import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import io from 'socket.io-client';
import { chat } from '../services/api';

// Replace with your IP
const SOCKET_URL = 'http://10.170.150.107:3000';

export default function ChatScreen({ route, navigation }) {
    const { userId, otherUser } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = useRef(null);
    const flatListRef = useRef(null);
    const insets = useSafeAreaInsets();

    // Create a unique room ID for this pair
    const roomId = [userId, otherUser.id].sort().join('-');

    useEffect(() => {
        // Connect to socket
        socket.current = io(SOCKET_URL);

        // Join room
        socket.current.emit('join_room', roomId);

        // Listen for messages
        socket.current.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
            scrollToBottom();
        });

        // Load history
        loadHistory();

        return () => {
            socket.current.disconnect();
        };
    }, []);

    const loadHistory = async () => {
        const history = await chat.getHistory(userId, otherUser.id);
        setMessages(history);
        scrollToBottom();
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const messageData = {
            senderId: userId,
            receiverId: otherUser.id,
            content: newMessage,
            room: roomId,
            created_at: new Date().toISOString(),
        };

        // Send to server
        socket.current.emit('send_message', messageData);

        // Optimistic update (optional, but good for UX)
        // setMessages((prev) => [...prev, messageData]); 
        // Note: We rely on 'receive_message' to avoid duplicates if we emit back to sender too

        setNewMessage('');
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const renderItem = ({ item }) => {
        const isMyMessage = item.sender_id === userId || item.senderId === userId;
        return (
            <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMyMessage ? styles.myMessageText : styles.theirMessageText]}>
                    {item.content}
                </Text>
            </View>
        );
    };

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
                        <Text style={styles.headerTitle}>{otherUser.name}</Text>
                        <View style={{ width: 50 }} />
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.list}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Increased offset for header
            >
                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 20,
        marginBottom: 10,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#FF416C',
        borderBottomRightRadius: 5,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 5,
        borderWidth: 1,
        borderColor: '#eee',
    },
    messageText: {
        fontSize: 16,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#FF416C',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
