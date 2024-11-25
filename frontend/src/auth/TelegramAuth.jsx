import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TelegramAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Telegram widget script
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-login', import.meta.env.VITE_BOT_NAME); // Changed from REACT_APP_BOT_NAME
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', `${import.meta.env.VITE_API_URL}/auth/telegram/callback`); // Changed from REACT_APP_API_URL
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    // Callback when user authenticates
    window.onTelegramAuth = (user) => {
      handleTelegramResponse(user);
    };

    document.getElementById('telegram-login-container').appendChild(script);

    return () => {
      document.getElementById('telegram-login-container').removeChild(script);
    };
  }, []);

  const handleTelegramResponse = async (user) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return <div id="telegram-login-container"></div>;
};

export default TelegramAuth; 