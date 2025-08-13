import React, { useState, useEffect, useCallback } from "react";
import "./Styles/Slot.css";

export default function Slot({
  slot,
  index,
  isSelected,
  onClick,
  selectedAction,
}) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Update timer
  useEffect(() => {
    if (slot.stage !== "empty" && slot.nextStageReadyAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, slot.nextStageReadyAt - Date.now());
        setTimeRemaining(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [slot.nextStageReadyAt]);

  // Animation trigger when slot changes
  useEffect(() => {
    if (slot.stage !== "empty") {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [slot.stage, slot.seedType]);

  // Show progress bar on hover for growing plants
  const handleMouseEnter = useCallback(() => {
    if (slot.stage !== "empty" && timeRemaining > 0) {
      setShowProgress(true);
    }
  }, [slot.stage, timeRemaining]);

  const handleMouseLeave = useCallback(() => {
    setShowProgress(false);
  }, []);

  const getSlotContent = () => {
    const stages = {
      empty: "🟫",
      planted: "🌱",
      sprouting: "🌿",
      growing: "🌾",
      readyToFertilize: "🌼",
      mature: slot.seedType?.name?.split(" ")[0] || "🌸",
    };
    return stages[slot.stage] || "🟫";
  };

  const getSlotClass = () => {
    let classes = ["garden-slot", slot.stage];

    if (isSelected) classes.push("selected");
    if (isAnimating) classes.push("animating");
    if (slot.fertilized) classes.push("fertilized");
    if (
      timeRemaining === 0 &&
      slot.stage !== "empty" &&
      slot.stage !== "mature"
    ) {
      classes.push("ready-for-action");
    }
    if (slot.stage === "mature") classes.push("ready-to-harvest");

    // Add interaction hints
    if (selectedAction) {
      if (canPerformAction(selectedAction)) {
        classes.push("can-interact");
      } else {
        classes.push("cannot-interact");
      }
    }

    return classes.join(" ");
  };

  const canPerformAction = (action) => {
    switch (action) {
      case "plant":
        return slot.stage === "empty";
      case "water":
        return (
          ["planted", "sprouting", "growing"].includes(slot.stage) &&
          timeRemaining === 0
        );
      case "fertilize":
        return slot.stage === "readyToFertilize" && !slot.fertilized;
      case "harvest":
        return slot.stage === "mature";
      default:
        return false;
    }
  };

  const formatTime = (ms) => {
    if (ms === 0) return "Ready!";

    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getHealthColor = () => {
    if (slot.health >= 80) return "#4CAF50";
    if (slot.health >= 50) return "#FF9800";
    return "#F44336";
  };

  const getProgressPercentage = () => {
    if (!slot.seedType || !slot.plantedTime) return 0;
    const totalTime = slot.seedType.growthTime;
    const elapsed = Date.now() - slot.plantedTime;
    return Math.min(100, (elapsed / totalTime) * 100);
  };

  return (
    <div
      className={getSlotClass()}
      onClick={() => onClick(index)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={getTooltipText()}
    >
      {/* Main slot content */}
      <div className="slot-content">{getSlotContent()}</div>

      {/* Health bar for planted slots */}
      {slot.stage !== "empty" && slot.health < 100 && (
        <div className="health-bar">
          <div
            className="health-fill"
            style={{
              width: `${slot.health}%`,
              backgroundColor: getHealthColor(),
            }}
          />
        </div>
      )}

      {/* Time remaining display */}
      {slot.stage !== "empty" && (
        <div className={`time-display ${timeRemaining === 0 ? "ready" : ""}`}>
          {formatTime(timeRemaining)}
        </div>
      )}

      {/* Progress circle for hover */}
      {showProgress && slot.stage !== "empty" && slot.stage !== "mature" && (
        <div className="progress-overlay">
          <svg className="progress-circle" viewBox="0 0 36 36">
            <path
              className="progress-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="progress-bar"
              strokeDasharray={`${getProgressPercentage()}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="progress-text">
            {Math.round(getProgressPercentage())}%
          </div>
        </div>
      )}

      {/* Special effects */}
      {slot.fertilized && (
        <div className="fertilized-sparkles">
          <span>✨</span>
          <span>✨</span>
          <span>✨</span>
        </div>
      )}

      {/* Ready pulse animation */}
      {timeRemaining === 0 &&
        slot.stage !== "empty" &&
        slot.stage !== "mature" && <div className="ready-pulse" />}

      {/* Harvest glow */}
      {slot.stage === "mature" && <div className="harvest-glow" />}

      {/* Slot number for debugging/reference */}
      <div className="slot-number">{index + 1}</div>
    </div>
  );

  function getTooltipText() {
    if (slot.stage === "empty") {
      return "Empty slot - Plant a seed here";
    }

    let tooltip = `${slot.seedType?.name || "Unknown"} - ${slot.stage}`;

    if (slot.health < 100) {
      tooltip += ` (Health: ${slot.health}%)`;
    }

    if (timeRemaining > 0) {
      tooltip += ` - ${formatTime(timeRemaining)} remaining`;
    } else if (slot.stage !== "mature") {
      tooltip += " - Ready for next action!";
    }

    if (selectedAction) {
      if (canPerformAction(selectedAction)) {
        tooltip += ` - Click to ${selectedAction}`;
      } else {
        tooltip += ` - Cannot ${selectedAction} here`;
      }
    }

    return tooltip;
  }
}
