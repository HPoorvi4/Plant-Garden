import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Garden from "./Pages/Garden";
import MyPlants from "./Pages/MyPlants";
import Harvested from "./Pages/Harvest";
import Bouquets from "./Pages/Bouquet";
import Shop from "./Pages/Shop";
import Login from "./Pages/Login";
import Sidebar from "./Components/Sidebar";

// Game State Context
const GameContext = createContext();

// Initial state
const initialState = {
  coins: 100,
  gardenSlots: Array(16)
    .fill(null)
    .map((_, index) => ({
      id: index,
      stage: "empty",
      seedType: null,
      plantedTime: null,
      nextStageReadyAt: null,
      lastWatered: null,
      fertilized: false,
      health: 100,
    })),
  harvestedFlowers: [],
  createdBouquets: [],
  achievements: [],
  experience: 0,
  level: 1,
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  currentUser: JSON.parse(localStorage.getItem("currentUser") || "null"),
  settings: {
    soundEnabled: true,
    animations: true,
    autoSave: true,
  },
};

// Reducer for game state
function gameReducer(state, action) {
  switch (action.type) {
    case "SET_COINS":
      return { ...state, coins: Math.max(0, action.payload) };

    case "ADD_COINS":
      return { ...state, coins: state.coins + action.payload };

    case "SPEND_COINS":
      if (state.coins >= action.payload) {
        return { ...state, coins: state.coins - action.payload };
      }
      return state;

    case "UPDATE_SLOT":
      return {
        ...state,
        gardenSlots: state.gardenSlots.map((slot, index) =>
          index === action.slotIndex ? { ...slot, ...action.updates } : slot
        ),
      };

    case "ADD_HARVESTED_FLOWER":
      const existing = state.harvestedFlowers.find(
        (f) => f.type === action.flower.type
      );
      if (existing) {
        return {
          ...state,
          harvestedFlowers: state.harvestedFlowers.map((f) =>
            f.type === action.flower.type
              ? { ...f, count: f.count + action.flower.count }
              : f
          ),
        };
      }
      return {
        ...state,
        harvestedFlowers: [...state.harvestedFlowers, action.flower],
      };

    case "ADD_BOUQUET":
      return {
        ...state,
        createdBouquets: [...state.createdBouquets, action.bouquet],
      };

    case "ADD_EXPERIENCE":
      const newExp = state.experience + action.payload;
      const newLevel = Math.floor(newExp / 100) + 1;
      return {
        ...state,
        experience: newExp,
        level: newLevel,
        ...(newLevel > state.level && { coins: state.coins + newLevel * 10 }),
      };

    case "UNLOCK_ACHIEVEMENT":
      if (!state.achievements.includes(action.achievement)) {
        return {
          ...state,
          achievements: [...state.achievements, action.achievement],
          coins: state.coins + 50, // Achievement bonus
        };
      }
      return state;

    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.user,
      };

    case "LOGOUT":
      return {
        ...initialState,
        isLoggedIn: false,
        currentUser: null,
      };

    case "LOAD_SAVE_DATA":
      return { ...state, ...action.data };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };

    default:
      return state;
  }
}

// Custom hook for game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};

// Game Provider Component
function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Auto-save functionality
  useEffect(() => {
    if (state.settings.autoSave && state.isLoggedIn) {
      const saveData = {
        coins: state.coins,
        gardenSlots: state.gardenSlots,
        harvestedFlowers: state.harvestedFlowers,
        createdBouquets: state.createdBouquets,
        achievements: state.achievements,
        experience: state.experience,
        level: state.level,
        settings: state.settings,
      };
      localStorage.setItem(
        `gameData_${state.currentUser?.email}`,
        JSON.stringify(saveData)
      );
    }
  }, [state, state.isLoggedIn, state.settings.autoSave]);

  // Load save data on login
  useEffect(() => {
    if (state.isLoggedIn && state.currentUser) {
      const savedData = localStorage.getItem(
        `gameData_${state.currentUser.email}`
      );
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          dispatch({ type: "LOAD_SAVE_DATA", data });
        } catch (error) {
          console.error("Failed to load save data:", error);
        }
      }
    }
  }, [state.isLoggedIn, state.currentUser]);

  // Game actions
  const actions = {
    addCoins: (amount) => dispatch({ type: "ADD_COINS", payload: amount }),
    spendCoins: (amount) => dispatch({ type: "SPEND_COINS", payload: amount }),
    updateSlot: (slotIndex, updates) =>
      dispatch({ type: "UPDATE_SLOT", slotIndex, updates }),
    addHarvestedFlower: (flower) =>
      dispatch({ type: "ADD_HARVESTED_FLOWER", flower }),
    addBouquet: (bouquet) => dispatch({ type: "ADD_BOUQUET", bouquet }),
    addExperience: (exp) => dispatch({ type: "ADD_EXPERIENCE", payload: exp }),
    unlockAchievement: (achievement) =>
      dispatch({ type: "UNLOCK_ACHIEVEMENT", achievement }),
    login: (user) => dispatch({ type: "LOGIN", user }),
    logout: () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("currentUser");
      dispatch({ type: "LOGOUT" });
    },
    updateSettings: (settings) =>
      dispatch({ type: "UPDATE_SETTINGS", settings }),
  };

  const value = {
    ...state,
    ...actions,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export default function App() {
  return (
    <GameProvider>
      <Router>
        <AppContent />
      </Router>
    </GameProvider>
  );
}

function AppContent() {
  const { isLoggedIn } = useGame();

  return (
    <div className="app-container">
      {/* Show sidebar only when logged in */}
      {isLoggedIn && <Sidebar />}

      <div className={`main-content ${isLoggedIn ? "with-sidebar" : ""}`}>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {isLoggedIn ? (
            <>
              {/* Protected routes */}
              <Route path="/" element={<Garden />} />
              <Route path="/garden" element={<Garden />} />
              <Route path="/my-plants" element={<MyPlants />} />
              <Route path="/harvested" element={<Harvested />} />
              <Route path="/bouquets" element={<Bouquets />} />
              <Route path="/shop" element={<Shop />} />
              {/* Redirect any unknown path to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            /* If not logged in, send everything to /login */
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
    </div>
  );
}
