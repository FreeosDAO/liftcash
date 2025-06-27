import React, { createContext, useContext, useEffect, useState } from "react";
import { clearActors, setActors } from "./redux/actorsSlice";
import { useDispatch, useSelector } from "react-redux";
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

// Static demo mode flag
const DEMO_MODE = true; // Set to false when backend is available

// Mock backend actors for demo mode
const createMockActor = () => ({
  // Add mock methods as needed for demo
  getUserInfo: () => Promise.resolve({ id: "demo-user", name: "Demo User" }),
  getBalance: () => Promise.resolve(1000),
  // Add more mock methods as needed
});

// Mock backend actors for production use
const createCommunityActor = DEMO_MODE ? createMockActor : null;
const createEconomyActor = DEMO_MODE ? createMockActor : null;

const AuthContext = createContext();

export const useAuthClient = () => {
  const dispatch = useDispatch();

  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);

  const clientInfo = async (client) => {
    if (DEMO_MODE) {
      // Demo mode - simulate authenticated user
      console.log("Demo mode: Simulating authenticated user");
      setAuthClient({ isAuthenticated: () => true });
      setIsAuthenticated(true);
      setIdentity({ getPrincipal: () => ({ toText: () => "demo-principal", isAnonymous: () => false }) });
      setPrincipal({ toText: () => "demo-principal", isAnonymous: () => false });

      // Set mock actors
      dispatch(
        setActors({
          communityActor: createMockActor(),
          economyActor: createMockActor(),
        })
      );
      
      localStorage.setItem("userPrincipal", "demo-principal");
      return true;
    }

    // Normal mode with real backend
    console.log("client auth status : ", await client.isAuthenticated());
    console.log("client : ", await client);
    const authStatus = await client.isAuthenticated();
    const identity = client.getIdentity();
    const principal = identity.getPrincipal();
    console.log("principal : ", principal.toText());

    setAuthClient(client);
    setIsAuthenticated(authStatus);
    setIdentity(identity);
    setPrincipal(principal);

    if (
      authStatus &&
      identity &&
      principal &&
      principal.isAnonymous() === false
    ) {
      const agent = new HttpAgent({ identity: client.getIdentity() });
      let communityActor = createCommunityActor(
        process.env.CANISTER_ID_COMMUNITY_BACKEND,
        {
          agent: agent,
        }
      );
      let economyActor = createEconomyActor(
        process.env.CANISTER_ID_ECONOMY_BACKEND,
        {
          agent: agent,
        }
      );

      dispatch(
        setActors({
          communityActor: communityActor,
          economyActor: economyActor,
        })
      );
    }
    localStorage.setItem("userPrincipal", principal);
    return true;
  };

  useEffect(() => {
    (async () => {
      if (DEMO_MODE) {
        // In demo mode, skip AuthClient creation
        clientInfo(null);
      } else {
        const authClient = await AuthClient.create();
        clientInfo(authClient);
      }
    })();
  }, []);

  const login = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        if (DEMO_MODE) {
          // In demo mode, simulate login
          console.log("Demo mode: Simulating login");
          resolve(clientInfo(null));
          return;
        }

        if (
          authClient !== null &&
          authClient.isAuthenticated() &&
          (await authClient.getIdentity().getPrincipal().isAnonymous()) ===
            false
        ) {
          resolve(clientInfo(authClient));
        } else {
          await authClient.login({
            identityProvider:
              process.env.DFX_NETWORK === "ic"
                ? "https://identity.ic0.app/"
                : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
            onError: (error) => reject(error),
            onSuccess: () => resolve(clientInfo(authClient)),
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const logout = async () => {
    if (DEMO_MODE) {
      console.log("Demo mode: Simulating logout");
      localStorage.clear();
      dispatch(clearActors());
      setIsAuthenticated(false);
      return;
    }

    await authClient?.logout();
    localStorage.clear();
    dispatch(clearActors());
    setIsAuthenticated(false);
  };

  return {
    login,
    logout,
    authClient,
    isAuthenticated,
    identity,
    principal,
  };
};

export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
 