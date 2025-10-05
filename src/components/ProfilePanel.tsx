import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ProfilePanel: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
        <div className="w-16 h-16 border-8 border-[#E9DDCD] border-t-[#BE956C] rounded-full animate-spin" />
        <p className="text-lg font-semibold tracking-wide text-[#E9DDCD]">
          Loading your profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
        <p className="font-semibold">We couldn't load Auth0 right now.</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
        <h2 className="text-2xl font-bold tracking-widest text-[#E9DDCD]">
          Welcome back, Cat Lover!
        </h2>
        <p className="text-base text-[#E9DDCD]">
          Sign in with Auth0 to access your Meowtion Sensor profile.
        </p>
        <button
          onClick={() =>
            loginWithRedirect({
              authorizationParams: {
                prompt: 'login',
              },
            })
          }
          className="bg-[#BE956C] text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md hover:bg-[#98522C] focus:outline-none focus:ring-2 focus:ring-[#E9DDCD] focus:ring-opacity-50 transition-transform active:scale-95"
        >
          Log in with Auth0
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center space-y-6 py-12">
      {user?.picture && (
        <img
          src={user.picture}
          alt={user.name ?? 'User profile'}
          className="w-24 h-24 rounded-full border-4 border-[#E9DDCD] shadow-lg"
        />
      )}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-widest text-[#E9DDCD]">
          {user?.name ?? 'Authenticated User'}
        </h2>
        {user?.email && <p className="text-[#E9DDCD]">{user.email}</p>}
      </div>
      <button
        onClick={() =>
          logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          })
        }
        className="bg-[#98522C] text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md hover:bg-[#BE956C] focus:outline-none focus:ring-2 focus:ring-[#E9DDCD] focus:ring-opacity-50 transition-transform active:scale-95"
      >
        Log out
      </button>
    </div>
  );
};

export default ProfilePanel;
