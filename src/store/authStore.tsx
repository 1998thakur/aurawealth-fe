import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '../types/auth';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_TOKEN'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH'; payload: { user: User; accessToken: string } };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'SET_TOKEN':
      return { ...state, accessToken: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTH':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
}

interface AuthContextValue {
  state: AuthState;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('aw_access_token'),
  isAuthenticated: false,
  isLoading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback((accessToken: string, user: User) => {
    localStorage.setItem('aw_access_token', accessToken);
    dispatch({ type: 'SET_AUTH', payload: { user, accessToken } });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('aw_access_token');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const setUser = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  // On mount: validate stored token
  useEffect(() => {
    const storedToken = localStorage.getItem('aw_access_token');
    if (!storedToken) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    authApi
      .me()
      .then((user) => {
        dispatch({
          type: 'SET_AUTH',
          payload: { user, accessToken: storedToken },
        });
      })
      .catch(() => {
        localStorage.removeItem('aw_access_token');
        localStorage.removeItem('aw_refresh_token');
        dispatch({ type: 'LOGOUT' });
      });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
