import { signup, login, logout, getCurrentUser } from '../lib/appwrite';

// Test the auth system
async function testAuth() {
    try {
        // 1. Sign up a new user
        const user = await signup('test@example.com', 'password123', 'Test User');
        console.log('Signed up:', user);

        // 2. Get current user info
        const me = await getCurrentUser();
        console.log('Logged in as:', me.name, me.email);

        // 3. Log out
        await logout();
        console.log('Logged out');

        // 4. Log back in
        await login('test@example.com', 'password123');
        const me2 = await getCurrentUser();
        console.log('Logged back in as:', me2.name, me2.email);

        await logout();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAuth();
