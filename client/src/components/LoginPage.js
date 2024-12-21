import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card, Input, Button, Alert } from './SharedComponents';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    const success = login(username, password);
    if (success) {
      navigate('/connect-wallet');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Login to Voting DApp
        </h2>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <Alert type="error" message={error} />}
            
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Demo Credentials:</p>
            <p>Admin: admin / admin123</p>
            <p>User: user / user123</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;