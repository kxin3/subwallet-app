// frontend/src/components/GoogleCallback.js - CREATE NEW FILE
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { connectGmail, connectGmailAccount } from '../utils/api';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const state = searchParams.get('state');

        console.log('OAuth callback received:', { code: !!code, error, state });

        if (error) {
          console.error('OAuth error:', error);
          toast.error('Gmail connection was cancelled');
          navigate('/dashboard');
          return;
        }

        if (!code) {
          console.error('No authorization code received');
          toast.error('No authorization code received');
          navigate('/dashboard');
          return;
        }

        console.log('Processing authorization code...');
        
        // Use the new multi-account API
        console.log('Attempting to connect via new multi-account API...');
        const response = await connectGmailAccount({ code });
        console.log('Gmail account connection response:', response);
        toast.success(`Gmail account connected successfully: ${response.email}`);
        
        navigate('/dashboard');
        
        // Reload the page to update the Gmail connection status
        window.location.reload();
        
      } catch (error) {
        console.error('Gmail connection error:', error);
        const errorMessage = error.response?.data?.message || 'Failed to connect Gmail';
        toast.error(errorMessage);
        navigate('/dashboard');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-4">
          <Wallet className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Connecting Gmail...
        </h2>
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-gray-600">
          Please wait while we connect your Gmail account
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;