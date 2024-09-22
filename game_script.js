let player = {
    x: null,
    y: null,
    moves: 0,
    cost: 0,
    score: 100,  // Initial score (e.g., 1000 points)
    carrying: false,
    goodsCarried: 0,
    goodsDelivered: 0,
    vehicle: null,
    maxGoods: 0,
    movementRange: 0
};


const vehicles = {
    bike: { movementRange: 1, maxGoods: 1 },
    car: { movementRange: 2, maxGoods: 1 },
    van: { movementRange: 3, maxGoods: 2 },
    truck: { movementRange: 4, maxGoods: 2 },
    train: { movementRange: 5, maxGoods: 2 },
    boat: { movementRange: 4, maxGoods: 1 },
    airplane: { movementRange: 6, maxGoods: 1 }
};

let board = {
    size: 15,  // Updated board size
    garage: { x: null, y: null },
    pickup: { x: null, y: null },
    delivery: { x: null, y: null }
};

let warehouseGoods = 10;  // Initial goods in the warehouse (maximum 10)
let deliveryGoodsNeeded = 2;  // Goods that need to be delivered at the delivery point
let deliveryGoodsGoal = 0;
let movementMode = false;
let gameOver = false;
let level = 1;
let questGoods = 2;  // Default goods to deliver

// Function to select vehicle
function selectVehicle() {
    const vehicleSelect = document.getElementById('vehicle-select').value;
    const vehicle = vehicles[vehicleSelect];
    
    // Set player's vehicle properties
    player.vehicle = vehicle;
    player.movementRange = vehicle.movementRange;
    player.maxGoods = vehicle.maxGoods;

    // Update the vehicle properties in the status display
    document.getElementById('vehicle-name').textContent = vehicleSelect.charAt(0).toUpperCase() + vehicleSelect.slice(1);
    document.getElementById('vehicle-movement').textContent = vehicle.movementRange;
    document.getElementById('vehicle-capacity').textContent = vehicle.maxGoods;
}

// Function to select level
function getSelectedLevel() {
    const levelSelect = document.getElementById('level-select').value;
    level = parseInt(levelSelect);

    // Set deliveryGoodsNeeded based on the selected level
    if (level === 1) {
        deliveryGoodsNeeded = getRandomInt(1, 2);  // 1 to 2 goods for easy level
    } else if (level === 2) {
        deliveryGoodsNeeded = getRandomInt(2, 4);  // 2 to 4 goods for medium level
    } else if (level === 3) {
        deliveryGoodsNeeded = getRandomInt(4, 6);  // 4 to 6 goods for hard level
    }

    deliveryGoodsGoal = deliveryGoodsNeeded
}

function initializeGame() {
    selectVehicle();   // Ensure a vehicle is selected
    getSelectedLevel(); // Ensure a level is selected and set deliveryGoodsNeeded
    
    randomizeLocations(); // Randomize the garage, pickup, and delivery locations
    player.x = board.garage.x; // Set the player's starting position at the garage
    player.y = board.garage.y;

    generateBoard(); // Create the game board
    updateStatus(); // Update the player, warehouse, and delivery status
}


// Function to update all status sections (player, warehouse, delivery)
// Update the player, warehouse, and delivery statuses
// Update the player, warehouse, and delivery statuses
function updateStatus() {
    // Update Player status
    document.getElementById('player-moves').textContent = `${player.moves}`;
    document.getElementById('player-cost').textContent = `${player.cost}`;
    
    const carryStatus = document.getElementById('carry-status');
    carryStatus.textContent = `Carrying: ${player.carrying ? 'Yes' : 'No'}`;
    carryStatus.className = player.carrying ? 'green' : 'red';

    document.getElementById('goods-status').textContent = `${player.goodsCarried}`;
    document.getElementById('score').textContent = `${player.score}`;
    document.getElementById('level').textContent = `${level}`;
    document.getElementById('player-position').textContent = `(${player.x}, ${player.y})`;

    // Update Warehouse status (current/maximum format)
    document.getElementById('warehouse-status-value').textContent = `${warehouseGoods}/10`;

    // Update Delivery status (Delivered/Target format)
    document.getElementById('delivery-status-value').textContent = `${player.goodsDelivered}/${deliveryGoodsGoal}`;
}






// Handle pick-up goods logic when player reaches warehouse
// Handle pickup logic with user input for number of goods
function handlePickup() {
    if (!player.carrying && player.x === board.pickup.x && player.y === board.pickup.y && warehouseGoods > 0) {
        setTimeout(() => {
            // Determine the maximum goods the player can carry based on vehicle capacity and warehouse availability
            const maxGoodsToPickup = Math.min(player.maxGoods, warehouseGoods);

            // Prompt the user to input the number of goods to carry (limited by max capacity)
            const goodsToPickup = parseInt(prompt(`Enter the number of goods to pick up (max: ${maxGoodsToPickup}):`, maxGoodsToPickup));

            // Validate user input
            if (goodsToPickup > 0 && goodsToPickup <= maxGoodsToPickup) {
                player.goodsCarried += goodsToPickup;
                warehouseGoods -= goodsToPickup;  // Reduce the goods in the warehouse
                alert(`Picked up ${goodsToPickup} goods!`);
                player.carrying = true;
                updateStatus();  // Update the status dynamically
                generateBoard();  // Re-render the board to reflect the changes
            } else {
                alert(`Invalid input. Please enter a number between 1 and ${maxGoodsToPickup}.`);
            }
        }, 500); // Short delay before showing the prompt
    } else if (warehouseGoods === 0) {
        alert("No more goods available in the warehouse.");
    }
}


// Handle delivery logic with user input for number of goods to deliver
function handleDelivery() {
    if (player.carrying && player.x === board.delivery.x && player.y === board.delivery.y) {
        setTimeout(() => {
            // Determine the maximum goods the player can deliver based on what they carry and the goods needed
            const maxGoodsToDeliver = Math.min(player.goodsCarried, deliveryGoodsNeeded);

            // Prompt the user to input the number of goods to deliver (limited by max deliverable)
            const goodsToDeliver = parseInt(prompt(`Enter the number of goods to deliver (max: ${maxGoodsToDeliver}):`, maxGoodsToDeliver));

            // Validate user input
            if (goodsToDeliver > 0 && goodsToDeliver <= maxGoodsToDeliver) {
                player.goodsDelivered += goodsToDeliver;
                deliveryGoodsNeeded -= goodsToDeliver;  // Reduce the goods needed at the delivery point
                player.goodsCarried -= goodsToDeliver;  // Reduce the player's carried goods
                alert(`Delivered ${goodsToDeliver} goods!`);
                if (player.goodsCarried === 0) player.carrying = false;  // Update carrying status if all goods are delivered
                updateStatus();  // Update status dynamically
                generateBoard();  // Re-render the board to reflect the changes

                // Check if all deliveries are completed
                if (deliveryGoodsNeeded <= 0) {
                    alert('All goods have been delivered!');
                    showCongratsAndHold();  // Show congratulations and hold the game until restart
                }
            } else {
                alert(`Invalid input. Please enter a number between 1 and ${maxGoodsToDeliver}.`);
            }
        }, 500); // Short delay before showing the prompt
    }
}



// Generate the game board and place the player, pickup, delivery, and garage points
function generateBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';  // Clear the previous board

    for (let row = 0; row < board.size; row++) {
        for (let col = 0; col < board.size; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;

            if (row === board.garage.y && col === board.garage.x) {
                if (row === player.y && col === player.x) {
                    cell.classList.add('garage');
                    cell.textContent = 'G&P';
                    cell.onclick = () => activateMoveMode();
                } else {
                    cell.classList.add('garage');
                    cell.textContent = 'G';
                }
            } else if (row === player.y && col === player.x) {
                if (row === board.pickup.y && col === board.pickup.x) {
                    cell.classList.add('pickup');
                    cell.textContent = 'W&P';
                    handlePickup();
                } else if (row === board.delivery.y && col === board.delivery.x) {
                    cell.classList.add('delivery');
                    cell.textContent = 'D&P';
                    handleDelivery();
                } else {
                    cell.classList.add('player');
                    cell.textContent = 'P';
                }
                cell.onclick = () => activateMoveMode();
            } else if (row === board.pickup.y && col === board.pickup.x) {
                cell.classList.add('pickup');
                cell.textContent = 'W';
            } else if (row === board.delivery.y && col === board.delivery.x) {
                cell.classList.add('delivery');
                cell.textContent = 'D';
            }

            boardElement.appendChild(cell);
        }
    }
}

// Function to check if the move is valid based on the vehicle's movement range
function isValidMove(targetRow, targetCol) {
    const distX = Math.abs(targetCol - player.x);
    const distY = Math.abs(targetRow - player.y);
    return (distX + distY <= player.movementRange); // Ensure move is within the vehicle's range
}

// Function to move the player to the selected cell
function movePlayer(targetRow, targetCol) {
    if (!movementMode) return;

    // Check if the move is valid
    if (isValidMove(targetRow, targetCol)) {
        // Update player's position
        player.x = targetCol;
        player.y = targetRow;
        player.moves += 1;
        player.cost += 1;

        // Subtract points for each move (e.g., 10 points per move)
        player.score -= 5;

        updateStatus();  // Update the status to reflect the new player position, moves, and score
        generateBoard();  // Re-generate the board to show the player's new position
        movementMode = false;  // Reset movement mode after the move
    } else {
        alert("Invalid move! Please stay within the vehicle's movement range.");
    }
}

// Activate movement mode when clicking on the player
function activateMoveMode() {
    if (gameOver) return;
    movementMode = true;
    previewMovement();
}

// Preview valid movement cells based on vehicle's movement range
function previewMovement() {
    const boardElement = document.getElementById('game-board');
    const cells = boardElement.getElementsByClassName('grid-cell');

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Highlight the valid cells where the player can move
        if (isValidMove(row, col)) {
            cell.classList.add('preview');
            cell.onclick = () => movePlayer(row, col);  // Move the player when clicking a valid cell
        }
    }
}


// Show congratulations text and hold the game until restart
function showCongratsAndHold() {
    gameOver = true;  // Prevent further moves
    const congrats = document.getElementById('congrats');
    congrats.style.display = 'block';

    const restartBtn = document.getElementById('restart');
    restartBtn.disabled = false;  // Enable the restart button
}

// Restart game functionality
// Restart game functionality
function restartGame() {
    // Reset player status
    player.moves = 0;
    player.cost = 0;
    player.carrying = false;
    player.goodsCarried = 0;
    player.goodsDelivered = 0;
    player.score = 100;  // Reset score to initial value

    warehouseGoods = 10;  // Reset warehouse goods

    // Reset movement mode and gameOver status
    movementMode = false;
    gameOver = false;  // Allow gameplay again
    
    getSelectedLevel();  // Randomize the delivery goods based on the level

    randomizeLocations();  // Randomize new pickup, delivery, and garage locations

    player.x = board.garage.x;  // Reset player position to garage
    player.y = board.garage.y;

    generateBoard();  // Regenerate the game board
    updateStatus();  // Update the status display

    document.getElementById('congrats').style.display = 'none';  // Hide congratulations
}

// Call restartGame when the Restart button is clicked
document.getElementById('restart').addEventListener('click', () => {
    restartGame();
});


// Randomize locations based on the selected level
function randomizeLocations() {
    let minDistance, maxDistance;

    // Set distance constraints based on the level
    if (level === 1) {  // Easy level
        minDistance = 2;
        maxDistance = 4;
    } else if (level === 2) {  // Medium level
        minDistance = 4;
        maxDistance = 7;
    } else if (level === 3) {  // Hard level
        minDistance = 7;
        maxDistance = 10;
    }

    // Randomize garage location
    board.garage.x = getRandomInt(0, board.size - 1);
    board.garage.y = getRandomInt(0, board.size - 1);

    // Randomize pickup location (warehouse) with level constraints
    do {
        board.pickup.x = getRandomInt(0, board.size - 1);
        board.pickup.y = getRandomInt(0, board.size - 1);
    } while (distanceBetween(board.garage.x, board.garage.y, board.pickup.x, board.pickup.y) < minDistance ||
             distanceBetween(board.garage.x, board.garage.y, board.pickup.x, board.pickup.y) > maxDistance);

    // Randomize delivery location with level constraints
    do {
        board.delivery.x = getRandomInt(0, board.size - 1);
        board.delivery.y = getRandomInt(0, board.size - 1);
    } while (distanceBetween(board.pickup.x, board.pickup.y, board.delivery.x, board.delivery.y) < minDistance ||
             distanceBetween(board.pickup.x, board.pickup.y, board.delivery.x, board.delivery.y) > maxDistance ||
             (board.delivery.x === board.garage.x && board.delivery.y === board.garage.y)); // Avoid overlap
}

// Utility function to generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Calculate distance between two points
function distanceBetween(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// Generate a random integer between 0 and max (exclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ensure the vehicle is selected before starting the game
document.getElementById('vehicle-select').addEventListener('change', () => {
    selectVehicle();
});

// Ensure the level is selected and initialize the game
document.getElementById('level-select').addEventListener('change', () => {
    getSelectedLevel();
    initializeGame();  // Initialize the game once the level is selected
});

// Restart button functionality
document.getElementById('restart').addEventListener('click', () => {
    restartGame();
});

// Initialize the game when the page loads
window.onload = () => {
    initializeGame();  // Call initializeGame to set up the initial state
};

