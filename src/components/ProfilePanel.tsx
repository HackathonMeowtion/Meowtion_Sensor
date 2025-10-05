import React, { useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { CatPersona } from '../types';
import {
  extractPersonaFromUser,
  getPersonaClaimKey,
  getPersonaGeneratedAtLabel,
} from '../utils/auth0Claims';

const ProfilePanel: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    loginWithRedirect,
    logout,
    user,
  } = useAuth0();

  const persona = useMemo<CatPersona | null>(() => extractPersonaFromUser(user), [user]);
  const personaClaimKey = useMemo(() => getPersonaClaimKey(), []);
  const personaGeneratedLabel = useMemo(
    () => (persona ? getPersonaGeneratedAtLabel(persona) : undefined),
    [persona],
  );

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
    <div className="flex flex-col items-center text-center space-y-8 py-12">
      <div className="flex flex-col items-center space-y-4">
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
      </div>

      <section className="w-full max-w-xl rounded-2xl border border-[#E9DDCD]/30 bg-[#1B1111]/70 p-6 shadow-xl shadow-black/40 backdrop-blur">
        <div className="flex flex-col space-y-4 text-left">
          <header className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold uppercase tracking-[0.35em] text-[#E9DDCD]">
              Cat Persona
            </h3>
            <p className="text-sm text-[#E9DDCD]/70">
              {`Claim namespace: ${personaClaimKey}`}
            </p>
          </header>

          {persona ? (
            <article className="flex flex-col space-y-4">
              <div
                className="rounded-xl border border-[#E9DDCD]/20 bg-[#2D1C1C]/70 p-4"
                style={
                  persona.accentColor
                    ? {
                        borderColor: `${persona.accentColor}40`,
                        boxShadow: `0 0 24px ${persona.accentColor}30`,
                      }
                    : undefined
                }
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-bold tracking-wide text-[#E9DDCD]">
                      {persona.displayName}
                    </h4>
                    {personaGeneratedLabel && (
                      <span className="rounded-full bg-[#E9DDCD]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#E9DDCD]/70">
                        {`Generated ${personaGeneratedLabel}`}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-[#E9DDCD]/90">
                    {persona.summary}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-2">
                  <h5 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E9DDCD]/80">
                    Signature Traits
                  </h5>
                  <ul className="flex flex-wrap gap-2">
                    {persona.traits.map((trait) => (
                      <li
                        key={trait}
                        className="rounded-full bg-[#BE956C]/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#E9DDCD]"
                      >
                        {trait}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col space-y-2">
                  <h5 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E9DDCD]/80">
                    Favourite Shenanigans
                  </h5>
                  <ul className="flex flex-wrap gap-2">
                    {persona.favoriteActivities.map((activity) => (
                      <li
                        key={activity}
                        className="rounded-full bg-[#55342A]/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#E9DDCD]"
                      >
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {persona.motto && (
                <blockquote className="rounded-lg border border-[#E9DDCD]/20 bg-[#120A0A]/80 p-4 text-sm italic text-[#E9DDCD]/80">
                  “{persona.motto}”
                </blockquote>
              )}

              <div className="rounded-lg border border-[#E9DDCD]/10 bg-[#231414]/80 p-4 text-sm text-[#E9DDCD]/80">
                <h5 className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#E9DDCD]/70">
                  Origin Story
                </h5>
                <p className="leading-relaxed text-[#E9DDCD]/90">{persona.originStory}</p>
              </div>
            </article>
          ) : (
            <div className="flex flex-col space-y-3 rounded-xl border border-dashed border-[#E9DDCD]/30 bg-[#1F1414]/60 p-6 text-[#E9DDCD]/80">
              <p className="text-base font-medium">
                Your feline alter-ego is still brewing in Auth0. Complete a fresh login so our Post-Login Action can craft your cat persona card.
              </p>
              <ul className="list-disc space-y-2 pl-6 text-sm">
                <li>Confirm the Auth0 Action is added to the default login flow.</li>
                <li>Verify the <code className="rounded bg-black/40 px-1 py-0.5">{personaClaimKey}</code> claim is whitelisted in your tenant.</li>
                <li>Log out and sign back in to trigger persona generation.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

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
