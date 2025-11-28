import { Platform } from 'react-native';

// Use your computer's IP address for physical device testing
// Replace '10.170.150.107' with your own IP if it changes (run 'ipconfig' to find it)
const API_URL = 'http://10.170.150.107:3000/api';

export const auth = {
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');
            return data;
        } catch (error) {
            throw error;
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');
            return data;
        } catch (error) {
            throw error;
        }
    },
};

export const location = {
    update: async (latitude, longitude, userId) => {
        try {
            const response = await fetch(`${API_URL}/location/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude, longitude, userId }),
            });
            return await response.json();
        } catch (error) {
            console.error('Location update error:', error);
        }
    },

    getNearby: async (latitude, longitude, userId, gender = 'all') => {
        try {
            let url = `${API_URL}/location/nearby?latitude=${latitude}&longitude=${longitude}&userId=${userId}`;
            if (gender !== 'all') {
                url += `&gender=${gender}`;
            }
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Get nearby error:', error);
            return [];
        }
    },
};

export const matches = {
    like: async (userId, likedUserId) => {
        try {
            const response = await fetch(`${API_URL}/matches/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, likedUserId }),
            });
            return await response.json();
        } catch (error) {
            console.error('Like error:', error);
            return { success: false };
        }
    },

    get: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/matches/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get matches error:', error);
            return [];
        }
    },
};

export const profile = {
    get: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/profile/${userId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');
            return data;
        } catch (error) {
            throw error;
        }
    },

    update: async (userId, data) => {
        try {
            const response = await fetch(`${API_URL}/profile/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...data }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to update profile');
            return result;
        } catch (error) {
            throw error;
        }
    },
};
