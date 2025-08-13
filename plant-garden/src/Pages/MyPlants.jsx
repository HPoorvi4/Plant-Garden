import React, { useState, useEffect } from "react";
import "./Styles/MyPlants.css";

export default function MyPlants() {
  const [plantedFlowers, setPlantedFlowers] = useState([]);
  const [harvestedFlowers, setHarvestedFlowers] = useState([]);

  useEffect(() => {
    const savedSlots = JSON.parse(localStorage.getItem("gardenSlots")) || [];

    const planted = savedSlots
      .filter((slot) => slot.stage !== "empty" && slot.seedType)
      .map((slot, index) => ({
        id: index,
        type: slot.seedType?.id,
        name: slot.seedType?.name,
        stage: slot.stage,
        plantedTime: slot.plantedTime,
        growthTime: slot.seedType?.growthTime || 5000,
        slotNumber: index + 1,
      }));

    setPlantedFlowers(planted);

    const savedHarvest =
      JSON.parse(localStorage.getItem("harvestedFlowers")) || [];
    setHarvestedFlowers(savedHarvest);
  }, []);

  const getStageDisplay = (stage) => {
    const stages = {
      planted: "🌱 Planted",
      sprouting: "🌿 Sprouting",
      growing: "🌾 Growing",
      readyToFertilize: "🌼 Ready to Fertilize",
      mature: "🌸 Ready to Harvest",
    };
    return stages[stage] || stage;
  };

  const getTimeRemaining = (plantedTime, growthTime) => {
    const elapsed = Date.now() - plantedTime;
    const remaining = Math.max(0, growthTime - elapsed);
    if (remaining === 0) return "Ready!";
    const seconds = Math.ceil(remaining / 1000);
    return `${seconds}s remaining`;
  };

  return (
    <div className="my-plants-container">
      <div className="my-plants-header">
        <h1>🌼 My Plants</h1>
        <p>Track your growing garden and harvested flowers</p>
      </div>

      <div className="plants-sections">
        {/* Currently Growing Section */}
        <section className="growing-section">
          <h2>🌱 Currently Growing</h2>
          <div className="plants-grid">
            {plantedFlowers.length === 0 ? (
              <div className="empty-state">
                <p>
                  No plants currently growing. Visit your garden to plant some
                  seeds!
                </p>
              </div>
            ) : (
              plantedFlowers.map((plant) => (
                <div key={plant.id} className="plant-card growing">
                  <div className="plant-icon">{plant.name.split(" ")[0]}</div>
                  <div className="plant-info">
                    <h3>{plant.name.split(" ")[1]}</h3>
                    <p className="plant-stage">
                      {getStageDisplay(plant.stage)}
                    </p>
                    <p className="plant-location">Slot #{plant.slotNumber}</p>
                    <p className="plant-time">
                      {getTimeRemaining(plant.plantedTime, plant.growthTime)}
                    </p>
                  </div>
                  <div className="plant-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.min(
                          100,
                          ((Date.now() - plant.plantedTime) /
                            plant.growthTime) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Harvested Flowers Section */}
        <section className="harvested-section">
          <h2>💐 Harvested Flowers</h2>
          <div className="plants-grid">
            {harvestedFlowers.length === 0 ? (
              <div className="empty-state">
                <p>No flowers harvested yet. Keep growing and harvesting!</p>
              </div>
            ) : (
              harvestedFlowers.map((flower) => (
                <div key={flower.id} className="plant-card harvested">
                  <div className="plant-icon">{flower.name.split(" ")[0]}</div>
                  <div className="plant-info">
                    <h3>{flower.name.split(" ")[1]}</h3>
                    <p className="flower-count">Quantity: {flower.count}</p>
                    <p className="sell-price">
                      Sell Price: 🪙 {flower.sellPrice} each
                    </p>
                    <p className="total-value">
                      Total Value: 🪙 {flower.count * flower.sellPrice}
                    </p>
                  </div>
                  <div className="plant-actions">
                    <button className="use-bouquet-btn">Use in Bouquet</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Summary Statistics */}
      <div className="plants-summary">
        <div className="summary-card">
          <h3>🌱 Plants Growing</h3>
          <p className="summary-number">{plantedFlowers.length}</p>
        </div>
        <div className="summary-card">
          <h3>💐 Flowers Harvested</h3>
          <p className="summary-number">
            {harvestedFlowers.reduce((sum, flower) => sum + flower.count, 0)}
          </p>
        </div>
        <div className="summary-card">
          <h3>🪙 Total Value</h3>
          <p className="summary-number">
            {harvestedFlowers.reduce(
              (sum, flower) => sum + flower.count * flower.sellPrice,
              0
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
