import React, { useState, useEffect } from "react";
import "./Styles/Bouquets.css";

export default function Bouquets() {
  const [availableFlowers, setAvailableFlowers] = useState([]);
  const [currentBouquet, setCurrentBouquet] = useState([]);
  const [createdBouquets, setCreatedBouquets] = useState([]);
  const [selectedWrapper, setSelectedWrapper] = useState("basic");

  const wrapperOptions = [
    { id: "basic", name: "Basic Paper", emoji: "📄", cost: 0 },
    { id: "deluxe", name: "Silk Ribbon", emoji: "🎀", cost: 5 },
    { id: "premium", name: "Luxury Box", emoji: "🎁", cost: 10 },
  ];

  useEffect(() => {
    const harvested =
      JSON.parse(localStorage.getItem("harvestedFlowers")) || [];
    setAvailableFlowers(harvested);

    const savedBouquets =
      JSON.parse(localStorage.getItem("createdBouquets")) || [];
    setCreatedBouquets(savedBouquets);
  }, []);

  const addToBouquet = (flower) => {
    if (flower.count <= 0) return;

    setAvailableFlowers((prev) =>
      prev.map((f) => (f.id === flower.id ? { ...f, count: f.count - 1 } : f))
    );

    setCurrentBouquet((prev) => {
      const existing = prev.find((f) => f.id === flower.id);
      if (existing) {
        return prev.map((f) =>
          f.id === flower.id ? { ...f, count: f.count + 1 } : f
        );
      } else {
        return [...prev, { ...flower, count: 1 }];
      }
    });
  };

  const removeFromBouquet = (flower) => {
    setAvailableFlowers((prev) =>
      prev.map((f) => (f.id === flower.id ? { ...f, count: f.count + 1 } : f))
    );

    setCurrentBouquet((prev) =>
      prev
        .map((f) => (f.id === flower.id ? { ...f, count: f.count - 1 } : f))
        .filter((f) => f.count > 0)
    );
  };

  const calculateBouquetValue = () => {
    const flowerValue = currentBouquet.reduce(
      (sum, flower) => sum + flower.price * flower.count,
      0
    );
    const wrapperCost =
      wrapperOptions.find((w) => w.id === selectedWrapper)?.cost || 0;
    return flowerValue + wrapperCost;
  };

  const classifyBouquetSize = () => {
    const totalFlowers = currentBouquet.reduce((sum, f) => sum + f.count, 0);
    if (totalFlowers >= 3 && totalFlowers <= 4) return "Small";
    if (totalFlowers >= 5 && totalFlowers <= 7) return "Medium";
    if (totalFlowers > 7) return "Large";
    return "Invalid";
  };

  const saveBouquet = () => {
    const size = classifyBouquetSize();
    if (size === "Invalid") {
      alert("Bouquet must have at least 3 flowers to be saved!");
      return;
    }

    const bouquet = {
      id: Date.now(),
      flowers: [...currentBouquet],
      wrapper: wrapperOptions.find((w) => w.id === selectedWrapper),
      totalValue: calculateBouquetValue(),
      size: size,
      createdAt: new Date().toLocaleString(),
    };

    const updatedBouquets = [...createdBouquets, bouquet];
    setCreatedBouquets(updatedBouquets);
    localStorage.setItem("createdBouquets", JSON.stringify(updatedBouquets));

    setCurrentBouquet([]);
    alert(`${size} bouquet saved!`);
  };

  const clearBouquet = () => {
    currentBouquet.forEach((flower) => {
      setAvailableFlowers((prev) =>
        prev.map((f) =>
          f.id === flower.id ? { ...f, count: f.count + flower.count } : f
        )
      );
    });
    setCurrentBouquet([]);
  };

  return (
    <div className="bouquets-container">
      <div className="bouquets-header">
        <h1>💐 Bouquet Creator</h1>
        <p>Create beautiful bouquets from your harvested flowers</p>
      </div>

      <div className="bouquets-content">
        {/* Available Flowers */}
        <section className="available-flowers">
          <h2>🌸 Harvested Flowers</h2>
          <div className="flowers-grid">
            {availableFlowers.length === 0 ? (
              <p>No harvested flowers available.</p>
            ) : (
              availableFlowers.map((flower) => (
                <div key={flower.id} className="flower-card">
                  <div className="flower-icon">{flower.name.split(" ")[0]}</div>
                  <h3>{flower.name.split(" ")[1]}</h3>
                  <p>Available: {flower.count}</p>
                  <p>🪙 {flower.price} each</p>
                  <button
                    onClick={() => addToBouquet(flower)}
                    disabled={flower.count === 0}
                  >
                    Add to Bouquet
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Current Bouquet */}
        <section className="bouquet-builder">
          <h2>🎀 Build Your Bouquet</h2>
          <div className="builder-content">
            <div className="current-bouquet">
              <h3>Selected Flowers</h3>
              {currentBouquet.length === 0 ? (
                <p className="empty-bouquet">No flowers added yet</p>
              ) : (
                currentBouquet.map((flower) => (
                  <div key={flower.id} className="bouquet-flower">
                    {flower.name.split(" ")[0]} x{flower.count}
                    <button onClick={() => removeFromBouquet(flower)}>−</button>
                  </div>
                ))
              )}
            </div>

            <div className="wrapper-selection">
              <h3>Choose Wrapper</h3>
              {wrapperOptions.map((wrapper) => (
                <button
                  key={wrapper.id}
                  className={`wrapper-option ${
                    selectedWrapper === wrapper.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedWrapper(wrapper.id)}
                >
                  {wrapper.emoji} {wrapper.name} (+🪙{wrapper.cost})
                </button>
              ))}
            </div>

            <div className="bouquet-summary">
              <h3>Bouquet Summary</h3>
              <p>Size: {classifyBouquetSize()}</p>
              <p>Total Value: 🪙 {calculateBouquetValue()}</p>
              <button onClick={saveBouquet}>💾 Save Bouquet</button>
              <button onClick={clearBouquet}>🗑️ Clear</button>
            </div>
          </div>
        </section>

        {/* Created Bouquets */}
        <section className="created-bouquets">
          <h2>🏆 Your Bouquets</h2>
          {createdBouquets.length === 0 ? (
            <p className="no-bouquets">No bouquets created yet</p>
          ) : (
            <div className="bouquets-gallery">
              {createdBouquets.map((b) => (
                <div key={b.id} className="bouquet-card">
                  <div className="bouquet-wrapper">{b.wrapper.emoji}</div>
                  <div className="bouquet-flowers-display">
                    {b.flowers.map((f, i) => (
                      <span key={i}>{f.name.split(" ")[0]}</span>
                    ))}
                  </div>
                  <div className="bouquet-info">
                    <p>🗓️ {b.createdAt}</p>
                    <p>💰 {b.totalValue} coins</p>
                    <p>📦 {b.size} Bouquet</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
