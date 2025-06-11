let coins = 50;
let level = 1;

const plantImages = [
    ['./css/images/seed.jpg', './css/images/plant.jpg', './css/images/rose.jpg'],
    ['./css/images/seed.jpg', './css/images/plant.jpg', 'https://cdn-icons-png.flaticon.com/512/415/415733.png'],
    ['./css/images/seed.jpg', './css/images/plant.jpg', 'https://cdn-icons-png.flaticon.com/512/184/184514.png'],
    ['./css/images/seed.jpg', './css/images/plant.jpg', 'https://cdn-icons-png.flaticon.com/512/415/415749.png'],
    ['./css/images/seed.jpg', './css/images/plant.jpg', 'https://cdn-icons-png.flaticon.com/512/415/415733.png']
];

const slots = document.querySelectorAll('.plant-slot');
let currentPlantIndex = 0;

const coinDisplay = document.querySelector('.stats strong');
const plantBtn = document.querySelector('.plant-btn');
const plantModal = document.getElementById('plantModal');
const plantForm = document.getElementById('plantForm');
const plantTypeSelect = document.getElementById('plantType');

// Open modal when "+ Plant" clicked
plantBtn.addEventListener('click', () => {
    plantModal.style.display = 'block';
});

// Handle form submit
plantForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (currentPlantIndex >= slots.length) {
        alert("🌼 Your garden is full!");
        plantModal.style.display = 'none';
        return;
    }

    if (coins < 10) {
        alert(" Not enough coins to plant.");
        plantModal.style.display = 'none';
        return;
    }

    const plantIndex = parseInt(plantTypeSelect.value);
    const img = document.createElement('img');
    img.src = plantImages[plantIndex][0];
    img.style.width = '80px';
    img.style.height = '80px';
    img.dataset.plantIndex = plantIndex.toString();
     img.dataset.growthStage = '0';

    slots[currentPlantIndex].appendChild(img);
    currentPlantIndex++;

    coins -= 10;
    coinDisplay.textContent = coins;

    plantModal.style.display = 'none'; // close modal

    try {
        const res = await axios.post('/update-coins', { coins });
        if (!res.data.success) {
            console.error('Failed to update coins on server');
        }
    } catch (err) {
        console.error('Axios Error:', err);
    }
});

let wateringMode = false;

const waterBtn = document.querySelector('.water-btn');
waterBtn.addEventListener('click', () => {
    wateringMode = true;
    alert("💧 Click a plant slot to water it!");
});

slots.forEach((slot, index) => {
    slot.addEventListener('click', () => {
    if (!wateringMode) return;

    const img = slot.querySelector('img');
    if (!img) {
        alert("No plant in this slot.");
        wateringMode = false;
        return;
    }

    const plantIndex = parseInt(img.dataset.plantIndex);
    let stage = parseInt(img.dataset.growthStage);

    if (isNaN(plantIndex) || !plantImages[plantIndex]) {
        alert("❌ Unknown plant type.");
        wateringMode = false;
        return;
    }

    const stages = plantImages[plantIndex];

    if (stage < stages.length - 1) {
        stage += 1;
        img.src = stages[stage];
        img.dataset.growthStage = stage.toString(); // Save new stage
    } else {
        alert("🌸 This plant is fully grown!");
    }

    wateringMode = false;
});

    });




