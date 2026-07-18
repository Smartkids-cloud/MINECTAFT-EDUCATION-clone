var screen = "LOGIN";
var emailInput = "student@gmail.com";
var loginMessage = "SYSTEM CONFIG: Gmail Authentication Protocol Active.";
var gameMode = "SURVIVAL";

// --- 3D ENGINE CORE STORAGE ---
var world3D = []; // 3D Array Matrix tracking every block coordinate [x][y][z]
var worldSize = 16;
var playerX = 8.0, playerY = 5.0, playerZ = 8.0; // 3D Floating point positions
var playerRot = 0.0; // Horizontal camera angle look view
var inventoryCount = parseInt(localStorage.getItem("mc_blocks_3d")) || 12;

// --- BOT & COMPILER REGISTRIES ---
var activeScript = "None Running";
var terminalInput = "";
var compilerFeedback = "Enter Python command (e.g., 'agent.build_tower()')";

// --- GENERATE IN-MEMORY 3D CHUNK MAP ---
var generate3DWorld = function() {
    for (var x = 0; x < worldSize; x++) {
        world3D[x] = [];
        for (var y = 0; y < 8; y++) {
            world3D[x][y] = [];
            for (var z = 0; z < worldSize; z++) {
                // Layer physics configuration: Fill bottom stone beds, keep air above
                if (y === 0) { world3D[x][y][z] = "BEDROCK"; }
                else if (y < 4) { world3D[x][y][z] = "DIRT"; }
                else if (y === 4) { world3D[x][y][z] = (random(0, 10) > 8) ? "DIAMOND_ORE" : "GRASS"; }
                else { world3D[x][y][z] = "AIR"; }
            }
        }
    }
};

// --- SAFE COLLISION BOX LOGIC ---
var isMouseInside = function(x, y, w, h) {
    var cX = x + w / 2; var cY = y + h / 2;
    return (abs(mouseX - cX) === (w / 2) || abs(mouseX - cX) < (w / 2)) && 
           (abs(mouseY - cY) === (h / 2) || abs(mouseY - cY) < (h / 2));
};

var drawButton = function(txt, x, y, w, h, r, g, b) {
    fill(r, g, b); rect(x, y, w, h, 6);
    fill(255, 255, 255); textSize(11); textAlign(CENTER, CENTER); text(txt, x + w / 2, y + h / 2);
};

/* === ADVANCED 3D RENDER ENGINE PROJECTION === */
var render3DVoxelWorld = function() {
    background(115, 190, 255); // Rendering horizon sky
    
    // Draw Sun and Far Cloud Layers
    fill(255, 255, 220); rect(180, 40, 40, 40);
    fill(255, 255, 255, 180); rect(40, 60, 120, 20, 5); rect(240, 85, 100, 15, 5);

    // Dynamic Math Projection Casting across the 3D grid
    for (var y = 0; y < 6; y++) {
        for (var x = 0; x < worldSize; x++) {
            for (var z = 0; z < worldSize; z++) {
                var blockType = world3D[x][y][z];
                if (blockType === "AIR" || !blockType) { continue; }

                // Calculate relative vectors from the player camera coordinates
                var relX = x - playerX;
                var relY = y - playerY;
                var relZ = z - playerZ;

                // Apply trigonometric look matrix rotation translations
                var rotX = relX * cos(playerRot) - relZ * sin(playerRot);
                var rotZ = relX * sin(playerRot) + relZ * cos(playerRot);

                // Stop geometry errors if block slips behind the viewport
                if (rotZ === 0 || rotZ < 0.5) { rotZ = 0.5; }

                // Perspective transformation calculation scaling (3D to 2D projection)
                var scaleFactor = 180 / rotZ;
                var projX = 200 + (rotX * scaleFactor);
                var projY = 200 - (relY * scaleFactor);
                var blockSize = scaleFactor * 0.8;

                // Only render entities inside screen coordinates bounds
                if (projX > -50 && projX < 450 && projY > -50 && projY < 450) {
                    // Set shading color profiles based on block matrix type
                    if (blockType === "GRASS") { fill(40, 170, 50); }
                    else if (blockType === "DIRT") { fill(110, 75, 45); }
                    else if (blockType === "DIAMOND_ORE") { fill(80, 200, 220); }
                    else { fill(60, 60, 65); }

                    // Render voxel isometric projection faces
                    rect(projX - blockSize/2, projY - blockSize/2, blockSize, blockSize, 2);
                    fill(0, 0, 0, 30); // Dynamic shadow matrix overlay
                    rect(projX - blockSize/2, projY + blockSize/4, blockSize, blockSize/4);
                }
            }
        }
    }

    // Overlay Crosshair Sight
    stroke(255, 255, 255, 150); strokeWeight(2);
    line(195, 200, 205, 200); line(200, 195, 200, 205); noStroke();
};

/* === COMPILER TERMINAL AUTOMATION MODULE === */
var executePythonScript = function(cmd) {
    if (cmd === "agent.mine_chunk()") {
        // Core bot loops through array chunk slicing rows out
        for (var tx = 4; tx < 12; tx++) {
            for (var tz = 4; tz < 12; tz++) {
                if (world3D[tx][4][tz] === "DIAMOND_ORE") { inventoryCount += 5; }
                world3D[tx][4][tz] = "AIR"; // Voxel array data deletion physics
            }
        }
        compilerFeedback = "Python Script OK: Bot cleared 8x8 voxel layer chunk.";
    } 
    else if (cmd === "agent.build_tower()") {
        // Bot structures blocks upward along Y index layer arrays
        for (var ty = 4; ty < 8; ty++) { world3D[8][ty][8] = "DIRT"; }
        compilerFeedback = "Python Script OK: Voxel array tower spawned at vector [8,Y,8].";
    } 
    else {
        compilerFeedback = "Syntax Error: Python statement unknown in global library.";
    }
};

/* === ACTIVE LAYOUT ROUTERS === */

var renderLoginScreen = function() {
    background(230, 245, 235);
    fill(40, 70, 50); textSize(20); textAlign(CENTER, TOP); text("Minecraft Core 3D Sandbox Engine", 200, 45);
    fill(250, 250, 250); rect(50, 110, 300, 45, 5);
    fill(50, 50, 50); textSize(14); textAlign(CENTER, CENTER); text(emailInput, 200, 132);
    drawButton("SURVIVAL", 40, 185, 100, 32, (gameMode === "SURVIVAL" ? 255 : 100), 120, 50);
    drawButton("CREATIVE", 150, 185, 100, 32, 50, (gameMode === "CREATIVE" ? 255 : 100), 150);
    drawButton("HARDCORE", 260, 185, 100, 32, 200, 50, (gameMode === "HARDCORE" ? 255 : 100));
    drawButton("INITIALIZE WORLD LOAD", 50, 250, 300, 45, 65, 105, 225);
    fill(100, 110, 130); textSize(11); text(loginMessage, 200, 325);
};

var renderWorldScreen = function() {
    render3DVoxelWorld();

    // 2D Interface Panels overlaid cleanly over the 3D Projection Canvas
    fill(0, 0, 0, 120); rect(0, 0, 400, 50);
    fill(255, 255, 255); textSize(11); textAlign(LEFT, CENTER);
    text("Pos: [" + playerX.toFixed(1) + ", " + playerY.toFixed(1) + ", " + playerZ.toFixed(1) + "] | Inventory Blocks: " + inventoryCount, 15, 25);
    
    // 3D Navigation Stride Buttons
    drawButton("⬅️ LOOK L", 20, 280, 75, 35, 45, 55, 72);
    drawButton("⬆️ WALK F", 100, 280, 75, 35, 45, 55, 72);
    drawButton("⬇️ WALK B", 180, 280, 75, 35, 45, 55, 72);
    drawButton("➡️ LOOK R", 260, 280, 75, 35, 45, 55, 72);
    drawButton("⛏️ MINE", 340, 280, 50, 35, 180, 60, 60);

    // Dynamic Script Injector Box
    fill(20, 20, 25); rect(20, 325, 360, 65, 4);
    fill(130, 240, 130); textSize(10); textAlign(LEFT, TOP); text("> " + terminalInput + "█", 30, 335);
    fill(170, 175, 190); text("Feedback: " + compilerFeedback, 30, 350);

    // Code Compiler Entry Hooks
    drawButton("Macro: Mine Chunk", 20, 368, 110, 20, 60, 80, 110);
    drawButton("Macro: Build Tower", 135, 368, 110, 20, 60, 80, 110);
    drawButton("RUN PY", 250, 368, 45, 20, 70, 160, 90);
    drawButton("DISCONNECT", 300, 368, 80, 20, 110, 110, 110);
};

draw = function() {
    if (world3D.length === 0) { generate3DWorld(); }
    if (screen === "LOGIN") { renderLoginScreen(); }
    else { renderWorldScreen(); }
};

mouseClicked = function() {
    if (screen === "LOGIN") {
        if (isMouseInside(40, 185, 100, 32)) { gameMode = "SURVIVAL"; }
        if (isMouseInside(150, 185, 100, 32)) { gameMode = "CREATIVE"; }
        if (isMouseInside(260, 185, 100, 32)) { gameMode = "HARDCORE"; }
        if (isMouseInside(50, 250, 300, 45)) { screen = "WORLD_3D"; }
    } 
    else if (screen === "WORLD_3D") {
        // Navigation Vector Translation Triggers
        if (isMouseInside(20, 280, 75, 35)) { playerRot -= 0.3; } // Camera rotation look vectors
        if (isMouseInside(260, 280, 75, 35)) { playerRot += 0.3; }
        if (isMouseInside(100, 280, 75, 35)) { playerX += sin(playerRot) * 0.8; playerZ += cos(playerRot) * 0.8; } // Tride matrix math forward walk
        if (isMouseInside(180, 280, 75, 35)) { playerX -= sin(playerRot) * 0.8; playerZ -= cos(playerRot) * 0.8; }
        
        // Manual Voxel Block Breaker Interaction
        if (isMouseInside(340, 280, 50, 35)) {
            var frontX = floor(playerX + sin(playerRot) * 1.5);
            var frontZ = floor(playerZ + cos(playerRot) * 1.5);
            // Array safe constraints protection bounds checks
            if (frontX >= 0 && frontX < worldSize && frontZ >= 0 && frontZ < worldSize) {
                if (world3D[frontX][4][frontZ] !== "AIR") {
                    world3D[frontX][4][frontZ] = "AIR"; // Destroys the block tracking coordinate index
                    inventoryCount += 1;
                    localStorage.setItem("mc_blocks_3d", inventoryCount);
                }
            }
        }

        // Terminal String Injection Handling Triggers
        if (isMouseInside(20, 368, 110, 20)) { terminalInput = "agent.mine_chunk()"; }
        if (isMouseInside(135, 368, 110, 20)) { terminalInput = "agent.build_tower()"; }
        if (isMouseInside(250, 368, 45, 20)) { executePythonScript(terminalInput); }
        if (isMouseInside(300, 368, 80, 20)) { screen = "LOGIN"; }
    }
};
