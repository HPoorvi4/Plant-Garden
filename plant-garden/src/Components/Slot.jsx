import React, { useState, useEffect } from "react";
import "./Styles/Slot.css";

export default function Slot({ slot, index, isSelected, onClick }) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (slot.stage !== "empty" && slot.nextStageReadyAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, slot.nextStageReadyAt - Date.now());
        setTimeRemaining(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [slot.nextStageReadyAt]);

  const getSlotContent = () => {
    switch (slot.stage) {
      case "empty":
        return "🟫";
      case "planted":
        return "🌱";
      case "sprouting":
        return "🌿";
      case "growing":
        return "🌾";
      case "readyToFertilize":
        return "🌼";
      case "mature":
        return slot.seedType?.name?.split(" ")[0] || "🌸";
      default:
        return "🟫";
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div
      className={`garden-slot ${isSelected ? "selected" : ""} ${slot.stage}`}
      onClick={() => onClick(index)}
    >
      <div className="slot-content">{getSlotContent()}</div>
      {slot.stage !== "empty" && timeRemaining > 0 && (
        <div className="time-remaining">{formatTime(timeRemaining)}</div>
      )}
      {slot.fertilized && <div className="fertilized-indicator">✨</div>}
    </div>
  );
}
