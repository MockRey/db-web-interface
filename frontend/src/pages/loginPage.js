import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!login || !password) {
        alert('Пожалуйста, заполните оба поля');
        return;
    }

    const loginData = {
        login,
        password
    };

    try {
        const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {  'Content-Type': 'application/json'  },
        body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || 'Произошла ошибка');
            return;
        }

        const data = await response.json();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('login', login);
        localStorage.setItem('role', data.role)
        navigate('/start');
    }

    catch (error) {
        console.error("Ошибка при попытке входе:", error);
        alert("Произошла ошибка при попытке входа.");
    }
  };

  return (
    <div style={{
      backgroundColor: '#ccc',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Вход</h2>

        <input
          type="text"
          placeholder="Логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc'
          }}
          required
        />

        <button
            type="submit"
            style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
        >
            Войти
        </button>
      </form>
    </div>
  );
};

export default LoginPage;