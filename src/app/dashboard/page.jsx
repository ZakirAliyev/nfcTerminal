'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {getBalance, getLoginInfo, setBalance} from "@/app/utils/balance";

export default function DashboardPage() {
    const router = useRouter();
    const [login, setLogin] = useState(null);
    const [balance, setLocalBalance] = useState(0);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const info = getLoginInfo();
        if (!info) {
            router.push('/login');
            return;
        }
        setLogin(info);
        setLocalBalance(getBalance(info.role, info.username));
    }, []);

    const handleSend = async () => {
        if (!amount || isNaN(amount) || amount <= 0) return alert("Məbləğ düzgün deyil");
        if (typeof NDEFReader === 'undefined') return alert("Web NFC dəstəklənmir");

        try {
            const ndef = new NDEFReader();
            await ndef.write({
                records: [{
                    recordType: "text",
                    data: new TextEncoder().encode(`PAY:${amount}:${login.username}`)
                }]
            });
            alert(`✅ ${amount}₼ üçün ödəniş tələb yazıldı`);
        } catch (err) {
            alert("❌ Yazı xətası: " + err.message);
        }
    };

    const handleReceive = async () => {
        if (typeof NDEFReader === 'undefined') return alert("Web NFC dəstəklənmir");

        try {
            const ndef = new NDEFReader();
            await ndef.scan();
            alert("📡 Oxuma başladı... telefonu yaxınlaşdır");

            ndef.onreading = (event) => {
                const text = new TextDecoder().decode(event.message.records[0].data);
                alert("📩 Alındı: " + text);

                if (!text.startsWith("PAY:")) return alert("❌ Format səhvdir");

                const [, amountStr, fromUsername] = text.split(":");
                const value = parseFloat(amountStr);

                if (balance < value) return alert("❌ Balans kifayət etmir!");

                const newUserBalance = balance - value;
                setBalance(login.role, login.username, newUserBalance);
                setLocalBalance(newUserBalance);

                const adminBalance = getBalance("admin", fromUsername);
                setBalance("admin", fromUsername, adminBalance + value);

                alert(`✅ ${value}₼ köçürüldü! Yeni balans: ${newUserBalance}`);
            };
        } catch (err) {
            alert("❌ Oxuma xətası: " + err.message);
        }
    };

    if (!login) return null;

    return (
        <div style={{ padding: 30 }}>
            <h2>{login.role === 'admin' ? 'Admin' : 'İstifadəçi'} - {login.username}</h2>
            <p>💰 Balans: {balance}₼</p>

            {login.role === 'admin' ? (
                <>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Məbləğ"
                    />
                    <button onClick={handleSend}>📤 NFC ilə ödəniş tələb et</button>
                </>
            ) : (
                <button onClick={handleReceive}>📡 NFC oxumağa başla</button>
            )}
        </div>
    );
}
