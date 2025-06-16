'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoleLoginForm() {
    const router = useRouter();
    const [role, setRole] = useState('user');
    const [username, setUsername] = useState('');

    const handleLogin = () => {
        if (!username) return alert('Ad daxil edin');

        localStorage.setItem('login', JSON.stringify({ role, username }));
        if (!localStorage.getItem(`balance_${role}_${username}`)) {
            localStorage.setItem(`balance_${role}_${username}`, role === 'admin' ? 0 : 1000);
        }
        router.push('/dashboard');
    };

    return (
        <div>
            <h2>Giriş</h2>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">İstifadəçi</option>
                <option value="admin">Admin (Terminal)</option>
            </select>
            <input
                type="text"
                placeholder="Adınız"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={handleLogin}>Daxil ol</button>
        </div>
    );
}
