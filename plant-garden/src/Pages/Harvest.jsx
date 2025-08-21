import React, { useState, useEffect } from "react";
import Slot from "../components/Slot";
import "./Styles/Garden.css";

const SEED_TYPES = [
  { id: "rose", name: "🌹 Rose", cost: 10, growthTime: 15000 },
  { id: "tulip", name: "🌷 Tulip", cost: 8, growthTime: 14000 },
  { id: "sunflower", name: "🌻 Sunflower", cost: 12, growthTime: 16000 },
  { id: "daisy", name: "🌼 Daisy", cost: 6, growthTime: 13000 },
  { id: "lily", name: "🌺 Lily", cost: 15, growthTime: 17000 },
];

export default function Garden() {
  const [coins, setCoins] = useState(50);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [showSeedDropdown, setShowSeedDropdown] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [gardenSlots, setGardenSlots] = useState(
    Array(16)
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
      }))
  );

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    setSelectedSlot(null);
    if (action === "plant") {
      setShowSeedDropdown(true);
    } else {
      setShowSeedDropdown(false);
      setSelectedSeed(null);
    }
  };

  const handleSeedSelect = (seed) => {
    setSelectedSeed(seed);
    setShowSeedDropdown(false);
  };

  const handleSlotClick = (slotIndex) => {
    const slot = gardenSlots[slotIndex];

    if (selectedAction === "plant" && selectedSeed) {
      if (slot.stage === "empty" && coins >= selectedSeed.cost) {
        plantSeed(slotIndex, selectedSeed);
      } else if (slot.stage !== "empty") {
        alert("This slot is already planted!");
      } else {
        alert("Not enough coins!");
      }
    } else if (selectedAction === "water") {
      if (
        slot.stage === "planted" ||
        slot.stage === "sprouting" ||
        slot.stage === "growing"
      ) {
        waterPlant(slotIndex);
      } else if (slot.stage === "empty") {
        alert("Nothing planted here to water!");
      } else {
        alert("This plant cannot be watered further!");
      }
    } else if (selectedAction === "fertilize") {
      if (slot.stage === "readyToFertilize" && !slot.fertilized) {
        fertilizePlant(slotIndex);
      } else if (slot.stage === "empty") {
        alert("Nothing planted here to fertilize!");
      } else {
        alert("This plant can't be fertilized yet or already is!");
      }
    } else if (selectedAction === "harvest") {
      if (slot.stage === "mature") {
        harvestPlant(slotIndex);
      } else if (slot.stage === "empty") {
        alert("Nothing planted here to harvest!");
      } else {
        alert("Plant is not ready for harvest yet!");
      }
    }

    setSelectedSlot(slotIndex);
  };

  const plantSeed = (slotIndex, seed) => {
    const newSlots = [...gardenSlots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      stage: "planted",
      seedType: seed,
      plantedTime: Date.now(),
      nextStageReadyAt: Date.now() + seed.growthTime,
      health: 100,
      fertilized: false,
    };
    setGardenSlots(newSlots);
    setCoins(coins - seed.cost);
    setSelectedAction(null);
    setSelectedSeed(null);
  };

  const waterPlant = (slotIndex) => {
    const newSlots = [...gardenSlots];
    const slot = newSlots[slotIndex];

    if (Date.now() < slot.nextStageReadyAt) {
      alert("Too early! Wait for the timer to finish before watering.");
      return;
    }

    if (slot.stage === "planted") {
      slot.stage = "sprouting";
    } else if (slot.stage === "sprouting") {
      slot.stage = "growing";
    } else if (slot.stage === "growing") {
      slot.stage = "readyToFertilize";
    }

    slot.lastWatered = Date.now();
    slot.nextStageReadyAt = Date.now() + slot.seedType.growthTime;

    setGardenSlots(newSlots);
    setSelectedAction(null);
  };

  const fertilizePlant = (slotIndex) => {
    const newSlots = [...gardenSlots];
    const slot = newSlots[slotIndex];

    slot.fertilized = true;
    slot.stage = "mature";
    slot.nextStageReadyAt = Date.now() + slot.seedType.growthTime;

    setGardenSlots(newSlots);
    setSelectedAction(null);
  };

  const harvestPlant = (slotIndex) => {
    const newSlots = [...gardenSlots];
    const harvestedPlant = newSlots[slotIndex];

    if (
      !harvestedPlant.fertilized ||
      Date.now() < harvestedPlant.nextStageReadyAt
    ) {
      alert("Plant is not ready to harvest or is not fertilized!");
      return;
    }

    // Add coins for harvested plant
    const sellPrice = harvestedPlant.seedType.cost * 2;
    setCoins(coins + sellPrice);

    const harvested =
      JSON.parse(localStorage.getItem("harvestedFlowers")) || [];
    const existing = harvested.find(
      (f) => f.type === harvestedPlant.seedType.id
    );

    if (existing) {
      existing.count += 1;
    } else {
      harvested.push({
        id: Date.now(),
        type: harvestedPlant.seedType.id,
        name: harvestedPlant.seedType.name,
        count: 1,
        sellPrice: sellPrice,
      });
    }

    localStorage.setItem("harvestedFlowers", JSON.stringify(harvested));

    // Reset slot
    newSlots[slotIndex] = {
      id: slotIndex,
      stage: "empty",
      seedType: null,
      plantedTime: null,
      nextStageReadyAt: null,
      lastWatered: null,
      fertilized: false,
      health: 100,
    };

    setGardenSlots(newSlots);
    setSelectedAction(null);
    alert(`Harvested ${harvestedPlant.seedType.name} for ${sellPrice} coins!`);
  };

  return (
    <div className="garden-container">
      <div className="garden-header">
        <h1> My Garden</h1>
        <div className="coins-display">🪙 {coins} Coins</div>
      </div>

      <div className="action-buttons">
        <button
          className={`action-btn ${selectedAction === "plant" ? "active" : ""}`}
          onClick={() => handleActionSelect("plant")}
        >
          🌱 Plant Seed
        </button>
        <button
          className={`action-btn ${selectedAction === "water" ? "active" : ""}`}
          onClick={() => handleActionSelect("water")}
        >
          💧 Water
        </button>
        <button
          className={`action-btn ${
            selectedAction === "fertilize" ? "active" : ""
          }`}
          onClick={() => handleActionSelect("fertilize")}
        >
          🌿 Fertilize
        </button>
        <button
          className={`action-btn ${
            selectedAction === "harvest" ? "active" : ""
          }`}
          onClick={() => handleActionSelect("harvest")}
        >
          ✂️ Harvest
        </button>
      </div>

      {showSeedDropdown && (
        <div className="seed-dropdown">
          <h3>Choose a seed:</h3>
          <div className="seed-options">
            {SEED_TYPES.map((seed) => (
              <button
                key={seed.id}
                className={`seed-option ${coins < seed.cost ? "disabled" : ""}`}
                onClick={() => handleSeedSelect(seed)}
                disabled={coins < seed.cost}
              >
                {seed.name} - {seed.cost} coins
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedAction && (
        <div className="current-action">
          {selectedAction === "plant" &&
            selectedSeed &&
            `Ready to plant ${selectedSeed.name} - Click an empty slot`}
          {selectedAction === "water" && "Click a planted slot to water it"}
          {selectedAction === "fertilize" && "Click a plant to fertilize it"}
          {selectedAction === "harvest" && "Click a mature plant to harvest it"}
        </div>
      )}

      <div className="garden-grid">
        {gardenSlots.map((slot, index) => (
          <Slot
            key={slot.id}
            slot={slot}
            index={index}
            isSelected={selectedSlot === index}
            onClick={handleSlotClick}
          />
        ))}
      </div>
    </div>
  );
}
