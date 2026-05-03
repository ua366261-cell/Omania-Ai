import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserProfile {
  uid: string;
  displayName: string;
  preferredLanguage?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateLanguage: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from local storage
    const storedProfile = localStorage.getItem('omnia_profile');
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setProfile(parsed);
        setUser({ uid: parsed.uid });
      } catch (e) {
        console.error('Failed to parse profile', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (name: string) => {
    // Simulate login
    const newUser = { uid: `user_${Date.now()}` };
    setUser(newUser);
    const newProfile = {
      uid: newUser.uid,
      displayName: name || 'Omnia User',
    };
    setProfile(newProfile);
    localStorage.setItem('omnia_profile', JSON.stringify(newProfile));
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('omnia_profile');
  };

  const updateLanguage = async (language: string) => {
    if (!profile) return;
    const newProfile = { ...profile, preferredLanguage: language };
    setProfile(newProfile);
    localStorage.setItem('omnia_profile', JSON.stringify(newProfile));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};
