import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

const testAPI = async () => {
    try {
        console.log('Registering user...');
        const userRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'exampleUser', password: 'password123', role: 'user' }),
        });
        const userResult = await userRes.json();
        console.log('User Register Result:', userResult);

        console.log('Registering admin...');
        const adminRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'adminUser', password: 'admin123', role: 'admin' }),
        });
        const adminResult = await adminRes.json();
        console.log('Admin Register Result:', adminResult);

        console.log('Logging in as user...');
        const loginUserRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'exampleUser', password: 'password123' }),
        });
        const loginUserResult = await loginUserRes.json();
        console.log('User Login Result:', loginUserResult);

        console.log('Logging in as admin...');
        const loginAdminRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'adminUser', password: 'admin123' }),
        });
        const loginAdminResult = await loginAdminRes.json();
        console.log('Admin Login Result:', loginAdminResult);

        console.log('Accessing admin-only route as user...');
        const adminRouteAsUserRes = await fetch(`${BASE_URL}/posts`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${loginUserResult.token}`,
            },
            body: JSON.stringify({ content: 'User-created post' }),
        });
        console.log('Admin-only route as user:', await adminRouteAsUserRes.json());
    } catch (error) {
        console.error('Test failed:', error);
    }
};

testAPI();
