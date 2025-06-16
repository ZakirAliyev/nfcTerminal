'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [role, setRole] = useState('user');
    const [username, setUsername] = useState('');
    const router = useRouter();

    const handleLogin = () => {
        if (!username) return alert('Ad daxil edin');
        localStorage.setItem('login', JSON.stringify({ role, username }));

        const balanceKey = `balance_${role}_${username}`;
        if (!localStorage.getItem(balanceKey)) {
            localStorage.setItem(balanceKey, role === 'admin' ? '0' : '1000');
        }

        router.push('/dashboard');
    };

    return (
        <div style={{ padding: 40 }}>
            <h2>Giriş</h2>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">İstifadəçi</option>
                <option value="admin">Admin (POS)</option>
            </select>
            <input
                type="text"
                placeholder="Ad"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={handleLogin}>Daxil ol</button>
        </div>
    );
}
