import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TelegramAuth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const script = document.createElement('script');
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute('data-telegram-login', 'FluentHub_bot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '8');
      script.setAttribute('data-onauth', 'window.onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;

      // Define the callback function in the global scope
      window.onTelegramAuth = (user) => {
        console.log('Telegram auth response:', user);
        handleTelegramResponse(user);
      };

      const container = document.getElementById('telegram-login-container');
      if (container) {
        container.innerHTML = ''; // Clear any existing content
        container.appendChild(script);
      }

      return () => {
        if (container && script) {
          container.removeChild(script);
        }
      };
    } catch (err) {
      setError('Failed to load Telegram login widget');
      console.error('Telegram widget error:', err);
    }
  }, []);

  const handleTelegramResponse = async (user) => {
    try {
      console.log('Handling Telegram response:', user);
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
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Authentication failed');
      }
    } catch (error) {
      setError('Authentication failed');
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login with Telegram</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div id="telegram-login-container" className="flex justify-center">
          {/* Telegram widget will be inserted here */}
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          Bot Name: FluentHub_bot
        </div>
      </div>
    </div>
  );
};

export default TelegramAuth; 