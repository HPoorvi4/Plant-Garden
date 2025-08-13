import React, { useState, useEffect, useCallback } from "react";
import Slot from "./Components/Slot";
import { useGame } from "../App";
import "./Styles/Garden.css";

const SEED_TYPES = [
  {
    id: "daisy",
    name: "🌼 Daisy",
    cost: 6,
    growthTime: 8000,
    sellPrice: 12,
    rarity: "common",
    experience: 5,
    description: "A cheerful flower that's easy to grow",
  },
  {
    id: "tulip",
    name: "🌷 Tulip",
    cost: 8,
    growthTime: 10000,
    sellPrice: 16,
    rarity: "common",
    experience: 8,
    description: "Classic spring flower with vibrant colors",
  },
  {
    id: "rose",
    name: "🌹 Rose",
    cost: 10,
    growthTime: 12000,
    sellPrice: 22,
    rarity: "uncommon",
    experience: 12,
    description: "The queen of flowers, thorny but beautiful",
  },
  {
    id: "sunflower",
    name: "🌻 Sunflower",
    cost: 12,
    growthTime: 15000,
    sellPrice: 26,
    rarity: "uncommon",
    experience: 15,
    description: "Tall and bright, follows the sun",
  },
  {
    id: "lily",
    name: "🌺 Lily",
    cost: 15,
    growthTime: 18000,
    sellPrice: 35,
    rarity: "rare",
    experience: 20,
    description: "Elegant and fragrant, prized by collectors",
  },
];

export default function Garden() {
  const {
    coins,
    gardenSlots,
    level,
    spendCoins,
    addCoins,
    updateSlot,
    addHarvestedFlower,
    addExperience,
    unlockAchievement,
  } = useGame();

  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [showSeedDropdown, setShowSeedDropdown] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [autoActions, setAutoActions] = useState({
    autoWater: false,
    autoFertilize: false,
    autoHarvest: false,
  });

  // Tutorial check
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (
      !hasSeenTutorial &&
      gardenSlots.every((slot) => slot.stage === "empty")
    ) {
      setShowTutorial(true);
    }
  }, [gardenSlots]);

  // Auto-actions system
  useEffect(() => {
    if (
      !autoActions.autoWater &&
      !autoActions.autoFertilize &&
      !autoActions.autoHarvest
    )
      return;

    const interval = setInterval(() => {
      gardenSlots.forEach((slot, index) => {
        if (autoActions.autoWater && canWater(slot)) {
          waterPlant(index, true);
        }
        if (autoActions.autoFertilize && canFertilize(slot)) {
          fertilizePlant(index, true);
        }
        if (autoActions.autoHarvest && canHarvest(slot)) {
          harvestPlant(index, true);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoActions, gardenSlots]);

  const handleActionSelect = (action) => {
    setSelectedAction(selectedAction === action ? null : action);
    setSelectedSlot(null);

    if (action === "plant") {
      setShowSeedDropdown(selectedAction !== "plant");
    } else {
      setShowSeedDropdown(false);
      setSelectedSeed(null);
    }
  };

  const handleSeedSelect = (seed) => {
    setSelectedSeed(seed);
    setShowSeedDropdown(false);
  };

  const showNotification = useCallback((message, type = "info") => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications((prev) => [...prev, notification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const canWater = (slot) => {
    return (
      ["planted", "sprouting", "growing"].includes(slot.stage) &&
      Date.now() >= slot.nextStageReadyAt
    );
  };

  const canFertilize = (slot) => {
    return slot.stage === "readyToFertilize" && !slot.fertilized;
  };

  const canHarvest = (slot) => {
    return slot.stage === "mature";
  };

  const handleSlotClick = (slotIndex) => {
    const slot = gardenSlots[slotIndex];

    if (selectedAction === "plant" && selectedSeed) {
      plantSeed(slotIndex, selectedSeed);
    } else if (selectedAction === "water") {
      waterPlant(slotIndex);
    } else if (selectedAction === "fertilize") {
      fertilizePlant(slotIndex);
    } else if (selectedAction === "harvest") {
      harvestPlant(slotIndex);
    }

    setSelectedSlot(slotIndex);
  };

  const plantSeed = (slotIndex, seed) => {
    const slot = gardenSlots[slotIndex];

    if (slot.stage !== "empty") {
      showNotification("This slot is already planted!", "error");
      return;
    }

    if (coins < seed.cost) {
      showNotification("Not enough coins!", "error");
      return;
    }

    spendCoins(seed.cost);

    updateSlot(slotIndex, {
      stage: "planted",
      seedType: seed,
      plantedTime: Date.now(),
      nextStageReadyAt: Date.now() + seed.growthTime,
      health: 100,
      fertilized: false,
    });

    addExperience(2);
    showNotification(`Planted ${seed.name.split(" ")[1]}! 🌱`, "success");

    setSelectedAction(null);
    setSelectedSeed(null);

    // Check achievements
    const totalPlanted =
      gardenSlots.filter((s) => s.stage !== "empty").length + 1;
    if (totalPlanted === 1) {
      unlockAchievement("First Plant");
    } else if (totalPlanted === 5) {
      unlockAchievement("Green Thumb");
    } else if (totalPlanted === 16) {
      unlockAchievement("Master Gardener");
    }
  };

  const waterPlant = (slotIndex, isAuto = false) => {
    const slot = gardenSlots[slotIndex];

    if (!canWater(slot)) {
      if (!isAuto) {
        if (slot.stage === "empty") {
          showNotification("Nothing planted here to water!", "error");
        } else if (Date.now() < slot.nextStageReadyAt) {
          showNotification("Too early! Wait for the timer to finish.", "error");
        } else {
          showNotification("This plant cannot be watered further!", "error");
        }
      }
      return;
    }

    let newStage = slot.stage;
    if (slot.stage === "planted") newStage = "sprouting";
    else if (slot.stage === "sprouting") newStage = "growing";
    else if (slot.stage === "growing") newStage = "readyToFertilize";

    // Add some randomness to growth time (±10%)
    const baseTime = slot.seedType.growthTime;
    const randomMultiplier = 0.9 + Math.random() * 0.2;
    const nextStageTime = baseTime * randomMultiplier;

    updateSlot(slotIndex, {
      stage: newStage,
      lastWatered: Date.now(),
      nextStageReadyAt: Date.now() + nextStageTime,
      health: Math.min(100, slot.health + 5),
    });

    addExperience(3);
    if (!isAuto) {
      showNotification(`Plant watered! 💧`, "success");
      setSelectedAction(null);
    }
  };

  const fertilizePlant = (slotIndex, isAuto = false) => {
    const slot = gardenSlots[slotIndex];

    if (!canFertilize(slot)) {
      if (!isAuto) {
        if (slot.stage === "empty") {
          showNotification("Nothing planted here to fertilize!", "error");
        } else {
          showNotification(
            "This plant can't be fertilized yet or already is!",
            "error"
          );
        }
      }
      return;
    }

    updateSlot(slotIndex, {
      fertilized: true,
      stage: "mature",
      nextStageReadyAt: Date.now() + slot.seedType.growthTime * 0.3,
      health: 100,
    });

    addExperience(5);
    if (!isAuto) {
      showNotification("Plant fertilized! ✨", "success");
      setSelectedAction(null);
    }
  };

  const harvestPlant = (slotIndex, isAuto = false) => {
    const slot = gardenSlots[slotIndex];

    if (!canHarvest(slot)) {
      if (!isAuto) {
        if (slot.stage === "empty") {
          showNotification("Nothing planted here to harvest!", "error");
        } else {
          showNotification("Plant is not ready for harvest yet!", "error");
        }
      }
      return;
    }

    // Calculate rewards with bonuses
    let sellPrice = slot.seedType.sellPrice;
    let experienceGain = slot.seedType.experience;

    // Health bonus
    if (slot.health === 100) {
      sellPrice *= 1.2;
      experienceGain += 2;
    }

    // Level bonus
    const levelBonus = 1 + (level - 1) * 0.05;
    sellPrice = Math.floor(sellPrice * levelBonus);

    addCoins(sellPrice);
    addExperience(experienceGain);

    // Add to harvested flowers for bouquets
    addHarvestedFlower({
      id: Date.now(),
      type: slot.seedType.id,
      name: slot.seedType.name,
      count: 1,
      price: Math.floor(slot.seedType.sellPrice * 0.8), // Slightly less for bouquet pricing
    });

    // Reset slot
    updateSlot(slotIndex, {
      stage: "empty",
      seedType: null,
      plantedTime: null,
      nextStageReadyAt: null,
      lastWatered: null,
      fertilized: false,
      health: 100,
    });

    if (!isAuto) {
      showNotification(
        `Harvested ${
          slot.seedType.name.split(" ")[1]
        } for ${sellPrice} coins! 🌸`,
        "success"
      );
      setSelectedAction(null);
    }

    // Achievement checks
    const harvestedCount =
      parseInt(localStorage.getItem("totalHarvested") || "0") + 1;
    localStorage.setItem("totalHarvested", harvestedCount.toString());

    if (harvestedCount === 10) unlockAchievement("Harvest Master");
    if (harvestedCount === 50) unlockAchievement("Flower Power");
  };

  const bulkAction = (action) => {
    let count = 0;
    gardenSlots.forEach((slot, index) => {
      if (action === "water" && canWater(slot)) {
        waterPlant(index, true);
        count++;
      } else if (action === "fertilize" && canFertilize(slot)) {
        fertilizePlant(index, true);
        count++;
      } else if (action === "harvest" && canHarvest(slot)) {
        harvestPlant(index, true);
        count++;
      }
    });

    if (count > 0) {
      showNotification(
        `${
          action === "water"
            ? "Watered"
            : action === "fertilize"
            ? "Fertilized"
            : "Harvested"
        } ${count} plants!`,
        "success"
      );
    } else {
      showNotification(`No plants ready for ${action}ing.`, "info");
    }
  };

  const getActionCounts = () => {
    return {
      canWater: gardenSlots.filter((slot) => canWater(slot)).length,
      canFertilize: gardenSlots.filter((slot) => canFertilize(slot)).length,
      canHarvest: gardenSlots.filter((slot) => canHarvest(slot)).length,
      empty: gardenSlots.filter((slot) => slot.stage === "empty").length,
    };
  };

  const actionCounts = getActionCounts();

  return (
    <div className="garden-container">
      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${notification.type}`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="tutorial-modal">
          <div className="tutorial-content">
            <h2>🌿 Welcome to Virtual Garden!</h2>
            <div className="tutorial-steps">
              <div className="tutorial-step">
                <span className="step-icon">🌱</span>
                <p>
                  <strong>Plant:</strong> Choose a seed and click an empty slot
                </p>
              </div>
              <div className="tutorial-step">
                <span className="step-icon">💧</span>
                <p>
                  <strong>Water:</strong> Help your plants grow through each
                  stage
                </p>
              </div>
              <div className="tutorial-step">
                <span className="step-icon">✨</span>
                <p>
                  <strong>Fertilize:</strong> Make plants ready for harvest
                </p>
              </div>
              <div className="tutorial-step">
                <span className="step-icon">🌸</span>
                <p>
                  <strong>Harvest:</strong> Collect mature plants for coins and
                  flowers
                </p>
              </div>
            </div>
            <button
              className="tutorial-close"
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem("hasSeenTutorial", "true");
              }}
            >
              Start Gardening!
            </button>
          </div>
        </div>
      )}

      <div className="garden-header">
        <div className="header-main">
          <h1>🌱 My Garden</h1>
          <div className="garden-stats">
            <div className="stat-item">
              <span className="stat-icon">🪙</span>
              <span className="stat-value">{coins.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🌱</span>
              <span className="stat-value">{16 - actionCounts.empty}/16</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">Level {level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-section">
        <div className="action-buttons">
          <button
            className={`action-btn plant ${
              selectedAction === "plant" ? "active" : ""
            }`}
            onClick={() => handleActionSelect("plant")}
          >
            🌱 Plant ({actionCounts.empty})
          </button>
          <button
            className={`action-btn water ${
              selectedAction === "water" ? "active" : ""
            }`}
            onClick={() => handleActionSelect("water")}
            disabled={actionCounts.canWater === 0}
          >
            💧 Water ({actionCounts.canWater})
          </button>
          <button
            className={`action-btn fertilize ${
              selectedAction === "fertilize" ? "active" : ""
            }`}
            onClick={() => handleActionSelect("fertilize")}
            disabled={actionCounts.canFertilize === 0}
          >
            ✨ Fertilize ({actionCounts.canFertilize})
          </button>
          <button
            className={`action-btn harvest ${
              selectedAction === "harvest" ? "active" : ""
            }`}
            onClick={() => handleActionSelect("harvest")}
            disabled={actionCounts.canHarvest === 0}
          >
            🌸 Harvest ({actionCounts.canHarvest})
          </button>
        </div>

        {/* Bulk Action Buttons */}
        <div className="bulk-actions">
          <button
            className="bulk-btn"
            onClick={() => bulkAction("water")}
            disabled={actionCounts.canWater === 0}
          >
            💧 Water All
          </button>
          <button
            className="bulk-btn"
            onClick={() => bulkAction("fertilize")}
            disabled={actionCounts.canFertilize === 0}
          >
            ✨ Fertilize All
          </button>
          <button
            className="bulk-btn"
            onClick={() => bulkAction("harvest")}
            disabled={actionCounts.canHarvest === 0}
          >
            🌸 Harvest All
          </button>
        </div>
      </div>

      {/* Seed Selection Dropdown */}
      {showSeedDropdown && (
        <div className="seed-dropdown">
          <h3>🌱 Choose a Seed:</h3>
          <div className="seed-grid">
            {SEED_TYPES.filter((seed) => seed.cost <= coins * 2) // Show affordable seeds first
              .sort((a, b) => a.cost - b.cost)
              .map((seed) => (
                <button
                  key={seed.id}
                  className={`seed-card ${
                    coins < seed.cost ? "disabled" : ""
                  } ${seed.rarity}`}
                  onClick={() => handleSeedSelect(seed)}
                  disabled={coins < seed.cost}
                >
                  <div className="seed-icon">{seed.name.split(" ")[0]}</div>
                  <div className="seed-info">
                    <h4>{seed.name.split(" ")[1]}</h4>
                    <p className="seed-cost">🪙 {seed.cost}</p>
                    <p className="seed-profit">Sells for 🪙{seed.sellPrice}</p>
                    <p className="seed-time">
                      ⏱️ {Math.floor(seed.growthTime / 1000)}s
                    </p>
                    <small className="seed-description">
                      {seed.description}
                    </small>
                  </div>
                  <div className={`rarity-badge ${seed.rarity}`}>
                    {seed.rarity}
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Current Action Display */}
      {selectedAction && (
        <div className="current-action">
          {selectedAction === "plant" && selectedSeed && (
            <p>
              🌱 Ready to plant {selectedSeed.name.split(" ")[1]} - Click an
              empty slot
            </p>
          )}
          {selectedAction === "water" && (
            <p>💧 Click a planted slot to water it</p>
          )}
          {selectedAction === "fertilize" && (
            <p>✨ Click a plant to fertilize it</p>
          )}
          {selectedAction === "harvest" && (
            <p>🌸 Click a mature plant to harvest it</p>
          )}
        </div>
      )}

      {/* Garden Grid */}
      <div className="garden-grid">
        {gardenSlots.map((slot, index) => (
          <Slot
            key={slot.id}
            slot={slot}
            index={index}
            isSelected={selectedSlot === index}
            onClick={handleSlotClick}
            selectedAction={selectedAction}
          />
        ))}
      </div>

      {/* Auto-Actions Panel (Unlocked at level 5+) */}
      {level >= 5 && (
        <div className="auto-actions-panel">
          <h3>🤖 Automation (Level {level}+)</h3>
          <div className="auto-toggles">
            <label className="auto-toggle">
              <input
                type="checkbox"
                checked={autoActions.autoWater}
                onChange={(e) =>
                  setAutoActions((prev) => ({
                    ...prev,
                    autoWater: e.target.checked,
                  }))
                }
              />
              💧 Auto Water
            </label>
            <label className="auto-toggle">
              <input
                type="checkbox"
                checked={autoActions.autoFertilize}
                onChange={(e) =>
                  setAutoActions((prev) => ({
                    ...prev,
                    autoFertilize: e.target.checked,
                  }))
                }
              />
              ✨ Auto Fertilize
            </label>
            <label className="auto-toggle">
              <input
                type="checkbox"
                checked={autoActions.autoHarvest}
                onChange={(e) =>
                  setAutoActions((prev) => ({
                    ...prev,
                    autoHarvest: e.target.checked,
                  }))
                }
              />
              🌸 Auto Harvest
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
