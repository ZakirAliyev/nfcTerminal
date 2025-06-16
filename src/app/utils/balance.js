export function getLoginInfo() {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('login');
    return data ? JSON.parse(data) : null;
}

export function getBalance(role, username) {
    return parseFloat(localStorage.getItem(`balance_${role}_${username}`)) || 0;
}

export function setBalance(role, username, newBalance) {
    localStorage.setItem(`balance_${role}_${username}`, newBalance.toString());
}
