'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {getBalance, getLoginInfo, setBalance} from "@/app/utils/balance";

export default function DashboardPage() {
    const router = useRouter();
    const [login, setLogin] = useState(null);
    const [amount, setAmount] = useState('');
    const [balance, setLocalBalance] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const info = getLoginInfo();
        if (!info) {
            alert("Giriş tapılmadı, loginə gedirik");
            router.push('/login');
        } else {
            alert(`Daxil oldun: ${info.username} (${info.role})`);
            setLogin(info);
            const b = getBalance(info.role, info.username);
            setLocalBalance(b);
            alert(`Balans: ${b}₼`);
        }
    }, []);

    const handleSend = async () => {
        if (!amount || isNaN(amount) || amount <= 0) return alert("Məbləğ düzgün deyil!");
        if (typeof NDEFReader === 'undefined') return alert("Web NFC dəstəklənmir");

        try {
            alert(`Tələb hazırlanır: PAY:${amount}:${login.username}`);
            const ndef = new NDEFReader();
            await ndef.write({
                records: [
                    {
                        recordType: 'text',
                        data: new TextEncoder().encode(`PAY:${amount}:${login.username}`)
                    }
                ]
            });
            alert("Tələb yazıldı. Telefonu yaxınlaşdırın.");
        } catch (e) {
            alert("Yazma xətası: " + e.message);
        }
    };

    const handleReceive = async () => {
        if (typeof NDEFReader === 'undefined') return alert("Web NFC dəstəklənmir");

        try {
            alert("Oxuma başlayır. Telefonu yaxınlaşdır.");
            const ndef = new NDEFReader();
            await ndef.scan();

            ndef.onreading = (event) => {
                alert("📬 NFC mesajı gəldi!");
                const record = event.message.records[0];
                const text = new TextDecoder().decode(record.data);
                alert("Mesaj: " + text);

                if (!text.startsWith("PAY:")) return alert("Yanlış format!");

                const [, amountStr, fromAdmin] = text.split(':');
                const value = parseFloat(amountStr);
                if (balance < value) return alert("Balans kifayət etmir!");

                // userdən çıx
                const newUserBalance = balance - value;
                setBalance(login.role, login.username, newUserBalance);
                setLocalBalance(newUserBalance);
                alert("İstifadəçi balansı azaldıldı: " + newUserBalance);

                // adminə artır
                const adminBalance = getBalance("admin", fromAdmin);
                setBalance("admin", fromAdmin, adminBalance + value);
                alert("Admin balansı artırıldı: " + (adminBalance + value));

                alert(`✅ ${value}₼ uğurla köçürüldü!`);
            };
        } catch (e) {
            alert("Oxuma xətası: " + e.message);
        }
    };

    if (!login) return null;

    return (
        <div style={{ padding: 30 }}>
            <h2>{login.role === 'admin' ? 'Admin' : 'İstifadəçi'}: {login.username}</h2>
            <p>💰 Balans: {balance}₼</p>

            {login.role === 'admin' ? (
                <>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Məbləğ"
                    />
                    <button onClick={handleSend}>📤 Ödəniş tələb et</button>
                </>
            ) : (
                <button onClick={handleReceive}>📡 NFC oxumağa başla</button>
            )}
        </div>
    );
}
