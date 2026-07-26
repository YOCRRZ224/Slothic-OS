const defaultApps = [
    // ────────────────
    // DEVELOPMENT
    // ────────────────

    {
        id: 1,
        name: "CyberChef",
        category: "Development",
        url: "https://gchq.github.io/CyberChef/",
        icon: "https://gchq.github.io/CyberChef/images/cyberchef-128x128.png",
        inDock: true
    },

    {
        id: "2",
        name: "Paper.io",
        category: "games",
        url: "https://paper-io.com/",
        icon: "https://games.voodoo.io/paperio2/favicons/favicon.svg",
        inDock: false
    },

    {
        id: 3,
        name: "JSFiddle",
        category: "Development",
        url: "https://jsfiddle.net/",
        icon: "https://jsfiddle.net/img/favicon.png",
        inDock: false
    },

    {
        id: 4,
        name: "CodePen",
        category: "Development",
        url: "https://codepen.io/",
        icon: "https://public.codepenassets.com/images/blocks/classic.svg",
        inDock: false
    },


    // ────────────────
    // NEWS
    // ────────────────

    {
        id: 5,
        name: "HackerNews",
        category: "News",
        url: "https://news.ycombinator.com",
        icon: "https://news.ycombinator.com/favicon.ico",
        inDock: false
    },


    // ────────────────
    // PRODUCTIVITY
    // ────────────────

    {
        id: 6,
        name: "Excalidraw",
        category: "Productivity",
        url: "https://excalidraw.com/",
        icon: "https://excalidraw.com/favicon.ico",
        inDock: false
    },

    {
        id: 7,
        name: "Photopea",
        category: "Productivity",
        url: "https://www.photopea.com/",
        icon: "https://www.photopea.com/promo/icon512.png",
        inDock: false
    },


    // ────────────────
    // UTILITIES
    // ────────────────

    {
        id: 8,
        name: "JSON Viewer",
        category: "Utilities",
        url: "https://jsonviewer.stack.hu/",
        icon: "https://jsonviewer.stack.hu/favicon.ico",
        inDock: false
    },
    {
        id: 9,
        name: "Flappy bird",
        category: "Productivity",
        url: "https://flappybird.io/",
        icon: "https://flappybird.io/favicon.ico",
        inDock: false
    },
    {
        id: 10,
        name: "Minecraft",
        category: "games",
        url: "https://classic.minecraft.net/",
        icon: "https://classic.minecraft.net/favicon.ico",
        inDock: false
    },
    {
        id: 11,
        name: "Dark Snake",
        category: "games",
        url: "https://darksnakegang.github.io/",
        icon: "https://darksnakegang.github.io/favicon.ico",
        inDock: false
    },
    {
        id: 12,
        name: "Venge",
        category: "games",
        url: "https://venge.io/",
        icon: "https://venge.io/favicon.ico",
        inDock: false
    },
    {
        id: 13,
        name: "Zombie royal",
        category: "games",
        url: "https://zombsroyale.io/",
        icon: "https://zombsroyale.io/favicon.ico",
        inDock: false
    }
];

// Load from local storage, or use defaults if it's empty
let apps = JSON.parse(localStorage.getItem('webOS_apps')) || defaultApps;
let zIndexCounter = 10;
let wallpaperUrl = localStorage.getItem('webOS_wallpaper') || 'https://wallpaperswide.com/download/canyon_reflection-wallpaper-3840x2400.jpg';
let openWindows = []; // Array of { id, appId, winElement, focused }
let activeCategory = "All";
let appSearchQuery = "";
// Apply saved wallpaper
document.body.style.backgroundImage = `url('${wallpaperUrl}')`;

// Helper function to save state
function saveApps() {
    localStorage.setItem('webOS_apps', JSON.stringify(apps));
}

function saveWallpaper(url) {
    localStorage.setItem('webOS_wallpaper', url);
}
/* ==========================================
   SYSTEM ACTIONS
========================================== */

function lockWebOS() {

    closeWhiskerMenu();

    if (!lockScreen) return;

    // Make sure lock screen is visible
    lockScreen.classList.remove("unlocked");

    lockScreen.style.transition = "none";
    lockScreen.style.transform = "translateY(0)";
    lockScreen.style.opacity = "1";

    // Force browser to apply reset
    void lockScreen.offsetWidth;

    lockScreen.style.transition = "";

}


function shutdownWebOS() {

    closeWhiskerMenu();

    /*
    Simple shutdown animation.
    Later we can replace this with
    a proper shutdown screen.
    */

    const shutdownScreen =
        document.createElement("div");

    shutdownScreen.id =
        "shutdown-screen";

    shutdownScreen.innerHTML = `
        <div class="shutdown-content">
            <div class="shutdown-logo">◉</div>
            <div>Shutting down...</div>
        </div>
    `;

    document.body.appendChild(
        shutdownScreen
    );

    setTimeout(() => {

        shutdownScreen.classList.add(
            "shutdown-finished"
        );

    }, 1200);

}
// DOM Elements
const whiskerMenu = document.getElementById('whisker-menu');
const dockAppsContainer = document.getElementById('dock-apps');
const debianBtn = document.getElementById('debian-btn');
const desktop = document.getElementById('desktop');
const ctxMenu = document.getElementById('context-menu');
const desktopCtxMenu = document.getElementById('desktop-context-menu');
let activeAppId = null; // Track which app we right-clicked

// Toggle Menu Logic
debianBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent immediate closing
    if (whiskerMenu.classList.contains('active')) {
        closeWhiskerMenu();
    } else {
        whiskerMenu.classList.remove('closing');
        whiskerMenu.classList.add('active');
    }
});

function closeWhiskerMenu() {
    if (whiskerMenu.classList.contains('active')) {
        whiskerMenu.classList.remove('active');
        whiskerMenu.classList.add('closing');
        setTimeout(() => {
            whiskerMenu.classList.remove('closing');
        }, 150);
    }
}

// Click anywhere on desktop to close menus
desktop.addEventListener('click', (e) => {
    if (e.target.closest('#whisker-menu') || e.target.closest('.window')) return;
    closeWhiskerMenu();
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.context-menu')) {
        ctxMenu.classList.add('hidden');
        desktopCtxMenu.classList.add('hidden');
    }
});

// Custom Prompt Logic
function customPrompt(title, defaultValue = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('os-modal');
        const input = document.getElementById('modal-input');
        document.getElementById('modal-title').innerText = title;
        input.value = defaultValue;
        modal.classList.remove('hidden');
        input.focus();

        document.getElementById('modal-ok').onclick = () => {
            modal.classList.add('hidden');
            resolve(input.value);
        };
        document.getElementById('modal-cancel').onclick = () => {
            modal.classList.add('hidden');
            resolve(null);
        };
    });
}
// ==========================================
// SEARCH BAR
// ==========================================

const searchContainer = document.createElement('div');

searchContainer.className = 'whisker-search';

searchContainer.innerHTML = `
    <svg
        class="search-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        fill="currentColor"
        viewBox="0 0 256 256"
    >
        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
    </svg>

    <input
        type="text"
        id="whisker-search-input"
        placeholder="Search apps..."
        autocomplete="off"
    >
`;

whiskerMenu.appendChild(searchContainer);

const searchInput =
    searchContainer.querySelector(
        "#whisker-search-input"
    );

searchInput.addEventListener(
    "input",
    (e) => {

        appSearchQuery =
            e.target.value
                .toLowerCase()
                .trim();

        renderAppMenu();

    }
);
function renderAppMenu() {

    // Remove old app area
    const oldAppArea =
        whiskerMenu.querySelector(
            ".whisker-app-area"
        );

    if (oldAppArea) {
        oldAppArea.remove();
    }


    const appArea =
        document.createElement("div");

    appArea.className =
        "whisker-app-area";


    // ==========================================
    // FILTER APPS
    // ==========================================

    let filteredApps =
        apps.filter(app => {

            const matchesSearch =
                app.name
                    .toLowerCase()
                    .includes(
                        appSearchQuery
                    );

            const matchesCategory =
                activeCategory === "All" ||
                app.category ===
                    activeCategory;

            return (
                matchesSearch &&
                matchesCategory
            );

        });


    // ==========================================
    // CATEGORIES
    // ==========================================

    const categories = [
        "All",
        ...new Set(
            apps.map(
                app => app.category
            )
        )
    ];


    // ==========================================
    // CATEGORY BAR
    // ==========================================

    const categoryBar =
        document.createElement("div");

    categoryBar.className =
        "whisker-categories";


    categories.forEach(category => {

        const categoryBtn =
            document.createElement("button");

        categoryBtn.className =
            "whisker-category";

        if (
            category ===
            activeCategory
        ) {
            categoryBtn.classList.add(
                "active"
            );
        }

        categoryBtn.textContent =
            category;

        categoryBtn.onclick = () => {

            activeCategory =
                category;

            renderAppMenu();

        };

        categoryBar.appendChild(
            categoryBtn
        );

    });


    appArea.appendChild(
        categoryBar
    );


    // ==========================================
    // APP GRID
    // ==========================================

    const appGrid =
        document.createElement("div");

    appGrid.className =
        "whisker-app-grid";


    if (
        filteredApps.length === 0
    ) {

        appGrid.innerHTML = `
            <div class="no-apps">
                No apps found
            </div>
        `;

    } else {

        filteredApps.forEach(app => {

            const menuItem =
                document.createElement(
                    "div"
                );

            menuItem.className =
                "menu-item";

            menuItem.innerHTML = `
                <img
                    src="${app.icon}"
                    alt="${app.name}"
                    onerror="
                        this.src='https://via.placeholder.com/44/333333/FFFFFF?text=${app.name.charAt(0)}'
                    "
                >

                <span>
                    ${app.name}
                </span>
            `;

            menuItem.onclick = () =>
                launchApp(app);

            attachContextMenu(
                menuItem,
                app
            );

            appGrid.appendChild(
                menuItem
            );

        });

    }


    appArea.appendChild(
        appGrid
    );


    // ==========================================
    // INSERT BEFORE ADD APP
    // ==========================================

    whiskerMenu.appendChild(
        appArea
    );
}
// Add App Modal Logic
function openAddAppModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('add-app-modal');
        const nameInput = document.getElementById('add-app-name');
        const urlInput = document.getElementById('add-app-url');
        const iconInput = document.getElementById('add-app-icon');
        
        nameInput.value = '';
        urlInput.value = '';
        iconInput.value = '';
        
        modal.classList.remove('hidden');
        nameInput.focus();

        document.getElementById('add-app-ok').onclick = () => {
            modal.classList.add('hidden');
            resolve({
                name: nameInput.value,
                url: urlInput.value,
                icon: iconInput.value
            });
        };
        document.getElementById('add-app-cancel').onclick = () => {
            modal.classList.add('hidden');
            resolve(null);
        };
    });
}

// Context Menu Attachment for Apps
function attachContextMenu(htmlElement, app) {
    let pressTimer;

    const showMenu = (x, y) => {
        activeAppId = app.id;
        desktopCtxMenu.classList.add('hidden'); // Hide desktop menu
        ctxMenu.style.left = `${x}px`;
        ctxMenu.style.top = `${y}px`;
        ctxMenu.classList.remove('hidden');
        
        // Update pin text contextually
        document.getElementById('toggle-pin-btn').innerText = app.inDock ? "Unpin from Dock" : "Pin to Dock";
    };

    // Right-click
    htmlElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showMenu(e.pageX, e.pageY);
    });

    // Long-press
    htmlElement.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
            const touch = e.touches[0];
            showMenu(touch.pageX, touch.pageY);
        }, 600);
    });
    htmlElement.addEventListener('touchend', () => clearTimeout(pressTimer));
    htmlElement.addEventListener('touchmove', () => clearTimeout(pressTimer));
}

// Context Menu Attachment for Desktop
function attachDesktopContextMenu() {
    let pressTimer;

    const showMenu = (x, y) => {
        ctxMenu.classList.add('hidden'); // Hide app menu
        desktopCtxMenu.style.left = `${x}px`;
        desktopCtxMenu.style.top = `${y}px`;
        desktopCtxMenu.classList.remove('hidden');
    };

    // Right-click on desktop
    desktop.addEventListener('contextmenu', (e) => {
        if (e.target.closest('#dock') || e.target.closest('#whisker-menu') || e.target.closest('.window')) return;
        e.preventDefault();
        showMenu(e.pageX, e.pageY);
    });

    // Long-press on desktop
    desktop.addEventListener('touchstart', (e) => {
        if (e.target.closest('#dock') || e.target.closest('#whisker-menu') || e.target.closest('.window')) return;
        pressTimer = setTimeout(() => {
            const touch = e.touches[0];
            showMenu(touch.pageX, touch.pageY);
        }, 600);
    });
    desktop.addEventListener('touchend', () => clearTimeout(pressTimer));
    desktop.addEventListener('touchmove', () => clearTimeout(pressTimer));
}

attachDesktopContextMenu();

// Desktop Context Menu Actions
const wallpaperUpload = document.getElementById('wallpaper-upload');

document.getElementById('fullscreen-btn').addEventListener('click', () => {
    desktopCtxMenu.classList.add('hidden');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

document.getElementById('change-wallpaper-btn').addEventListener('click', () => {
    desktopCtxMenu.classList.add('hidden');
    wallpaperUpload.click();
});

wallpaperUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            wallpaperUrl = event.target.result;
            document.body.style.backgroundImage = `url('${wallpaperUrl}')`;
            saveWallpaper(wallpaperUrl);
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('developer-btn').addEventListener('click', () => {
    desktopCtxMenu.classList.add('hidden');
    window.open('https://yocrrz.is-a.dev', '_blank');
});

// App Context Menu Actions
document.getElementById('toggle-pin-btn').addEventListener('click', () => {
    ctxMenu.classList.add('hidden');
    const app = apps.find(a => a.id === activeAppId);
    if (app) {
        app.inDock = !app.inDock;
        saveApps(); // Save to LocalStorage
        renderUI(); // Re-render everything
    }
});

document.getElementById('delete-app-btn').addEventListener('click', () => {
    ctxMenu.classList.add('hidden');
    apps = apps.filter(a => a.id !== activeAppId);
    saveApps(); // Save to LocalStorage
    renderUI();
});

// Render Dock and Whisker Menu
function renderUI() {
    // Clear current DOM
    whiskerMenu.innerHTML = '';
    dockAppsContainer.innerHTML = '';

    // 1. Populate Whisker Menu
    apps.forEach(app => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${app.icon}" alt="${app.name}" onerror="this.src='https://via.placeholder.com/44/333333/FFFFFF?text=${app.name.charAt(0)}'">
            <span>${app.name}</span>
        `;
        menuItem.onclick = () => launchApp(app);
        
        attachContextMenu(menuItem, app); // Attach right-click/long-press
        whiskerMenu.appendChild(menuItem);
    });

    // Add "+" Button to Whisker Menu
// ==========================================
// ADD APP BUTTON
// ==========================================

const addBtnContainer =
    document.createElement('div');

addBtnContainer.className =
    'menu-item';

addBtnContainer.innerHTML = `
    <div id="add-app-btn">+</div>
    <span>Add App</span>
`;

addBtnContainer.onclick =
    addNewApp;

whiskerMenu.appendChild(
    addBtnContainer
);


// ==========================================
// SYSTEM ACTIONS
// ==========================================

const systemActions =
    document.createElement('div');

systemActions.className =
    'whisker-system-actions';


// ------------------------------------------
// LOCK SCREEN
// ------------------------------------------

const lockItem =
    document.createElement('div');

lockItem.className =
    'system-menu-item system-lock';

lockItem.innerHTML = `
    <div class="system-menu-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path></svg>
    </div>

  
`;

lockItem.onclick =
    lockWebOS;


// ------------------------------------------
// SHUTDOWN
// ------------------------------------------

const shutdownItem =
    document.createElement('div');

shutdownItem.className =
    'system-menu-item system-shutdown';

shutdownItem.innerHTML = `
    <div class="system-menu-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M120,128V48a8,8,0,0,1,16,0v80a8,8,0,0,1-16,0Zm60.37-78.7a8,8,0,0,0-8.74,13.4C194.74,77.77,208,101.57,208,128a80,80,0,0,1-160,0c0-26.43,13.26-50.23,36.37-65.3a8,8,0,0,0-8.74-13.4C47.9,67.38,32,96.06,32,128a96,96,0,0,0,192,0C224,96.06,208.1,67.38,180.37,49.3Z"></path></svg>
    </div>

 
`;

shutdownItem.onclick =
    shutdownWebOS;


// Add to system actions
systemActions.appendChild(
    lockItem
);

systemActions.appendChild(
    shutdownItem
);


// Add system actions to menu
whiskerMenu.appendChild(
    systemActions
);
    addBtnContainer.onclick = addNewApp;
    whiskerMenu.appendChild(addBtnContainer);

    // 2. Populate Center Dock
    // Collect apps that are either inDock OR currently running
    const runningAppIds = new Set(openWindows.map(w => w.appId));
    
    const dockApps = apps.filter(a => a.inDock || runningAppIds.has(a.id));
    
    dockApps.forEach(app => {
        const isRunning = runningAppIds.has(app.id);
        const isFocused = openWindows.some(w => w.appId === app.id && w.focused);
        
        const dockItem = document.createElement('div');
        dockItem.className = 'dock-item';
        
        const dockIcon = document.createElement('img');
        dockIcon.className = 'app-icon';
        dockIcon.src = app.icon;
        dockIcon.title = app.name;
        dockIcon.onerror = function() { this.src=`https://via.placeholder.com/48/333333/FFFFFF?text=${app.name.charAt(0)}` };
        
        // If app is running, clicking it focuses it, otherwise launch
        dockIcon.onclick = () => {
            if (isRunning) {
                // Focus the most recent instance of this app
                const appWindows = openWindows.filter(w => w.appId === app.id);
                if (appWindows.length > 0) {
                    const latestWin = appWindows[appWindows.length - 1];
                    latestWin.winElement.style.zIndex = ++zIndexCounter;
                    focusWindow(latestWin.id);
                }
            } else {
                launchApp(app);
            }
        };
        
        attachContextMenu(dockIcon, app); // Attach right-click/long-press
        dockItem.appendChild(dockIcon);
        
        // Add running indicator
        if (isRunning) {
            const indicator = document.createElement('div');
            indicator.className = `dock-indicator ${isFocused ? 'focused' : 'running'}`;
            dockItem.appendChild(indicator);
        }
        
        dockAppsContainer.appendChild(dockItem);
    });
}

function focusWindow(winId) {
    openWindows.forEach(w => w.focused = (w.id === winId));
    renderUI();
}

// Add New App Logic
async function addNewApp() {
    closeWhiskerMenu();
    
    const result = await openAddAppModal();
    if (!result || !result.name || !result.url) return;
    
    let { name, url, icon } = result;

    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    if (!icon) {
        try {
            const urlObj = new URL(url);
            icon = `${urlObj.origin}/favicon.ico`;
        } catch {
            icon = ""; 
        }
    }

    const newApp = {
        id: Date.now(),
        name: name,
        url: url,
        icon: icon,
        inDock: true // Automatically toss new apps into the dock for quick access
    };
    
    apps.push(newApp);
    saveApps(); // Save to LocalStorage
    renderUI();
}

// Window Management
function launchApp(app) {
    closeWhiskerMenu();
    
    const winId = Date.now() + Math.random();
    const win = document.createElement('div');
    win.className = 'window';
    win.style.zIndex = ++zIndexCounter;
    
    // Stagger window spawns slightly
    const offset = (zIndexCounter % 10) * 30;
    
    // Calculate centered position for responsive devices
    let startTop = 50 + offset;
    let startLeft = 100 + offset;

    if (window.innerWidth <= 850) {
        startTop = 30 + (offset/2);
        startLeft = (window.innerWidth - (window.innerWidth * 0.9)) / 2 + (offset/2);
    }

    win.style.top = `${startTop}px`;
    win.style.left = `${startLeft}px`;

    win.innerHTML = `
        <div class="title-bar">
            <div class="title-info">
                <img src="${app.icon}" onerror="this.src='https://via.placeholder.com/18/333333/FFFFFF?text=${app.name.charAt(0)}'">
                <span>${app.name}</span>
            </div>
            <div class="window-controls">
                <button class="btn btn-max" title="Open in New Tab (Maximize)"></button>
                <button class="btn btn-close" title="Exit"></button>
            </div>
        </div>
        <div class="window-content">
            <iframe src="${app.url}"></iframe>
        </div>
        <div class="resize-handle"></div>
    `;

    desktop.appendChild(win);
    
    // Add to openWindows state
    openWindows.push({ id: winId, appId: app.id, winElement: win, focused: true });
    focusWindow(winId);

    // Bring window to front when clicked
    const bringToFront = () => {
        win.style.zIndex = ++zIndexCounter;
        focusWindow(winId);
    };
    win.addEventListener('mousedown', bringToFront);
    win.addEventListener('touchstart', bringToFront, { passive: true });

    // Window Controls Logic
    const closeBtn = win.querySelector('.btn-close');
    const maxBtn = win.querySelector('.btn-max');
    const titleBar = win.querySelector('.title-bar');

    closeBtn.onclick = () => {
        win.classList.add('closing');
        openWindows = openWindows.filter(w => w.id !== winId);
        renderUI();
        setTimeout(() => win.remove(), 200); // Wait for animation to finish
    };
    
    maxBtn.onclick = () => {
        window.open(app.url, '_blank');
        win.classList.add('closing');
        openWindows = openWindows.filter(w => w.id !== winId);
        renderUI();
        setTimeout(() => win.remove(), 200);
    };

    // Dragging Logic (Mouse & Touch)
    let isDragging = false;
    let offsetX, offsetY;
    const iframe = win.querySelector('iframe');

    const startDrag = (clientX, clientY) => {
        isDragging = true;
        const rect = win.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        if (iframe) iframe.style.pointerEvents = 'none';
    };

    const doDrag = (clientX, clientY) => {
        if (!isDragging) return;
        win.style.left = `${clientX - offsetX}px`;
        win.style.top = `${clientY - offsetY}px`;
    };

    const stopDrag = () => {
        isDragging = false;
        if (iframe) iframe.style.pointerEvents = 'auto';
    };

    // Mouse Events for Dragging
    titleBar.addEventListener('mousedown', (e) => {
        startDrag(e.clientX, e.clientY);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) { doDrag(e.clientX, e.clientY); }
    function onMouseUp() {
        stopDrag();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    // Touch Events for Dragging
    titleBar.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    });

    function onTouchMove(e) {
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        doDrag(touch.clientX, touch.clientY);
    }

    function onTouchEnd() {
        stopDrag();
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }

    // Custom Resizing Logic
    const resizeHandle = win.querySelector('.resize-handle');
    let isResizing = false;
    let startWidth, startHeight;
    let startX, startY;

    const startResize = (clientX, clientY) => {
        isResizing = true;
        startWidth = win.offsetWidth;
        startHeight = win.offsetHeight;
        startX = clientX;
        startY = clientY;
        if (iframe) iframe.style.pointerEvents = 'none';
    };

    const doResize = (clientX, clientY) => {
        if (!isResizing) return;
        win.style.width = `${startWidth + (clientX - startX)}px`;
        win.style.height = `${startHeight + (clientY - startY)}px`;
    };

    const stopResize = () => {
        isResizing = false;
        if (iframe) iframe.style.pointerEvents = 'auto';
    };

    // Mouse Events for Resizing
    resizeHandle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        startResize(e.clientX, e.clientY);
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
    });

    function onResizeMove(e) { doResize(e.clientX, e.clientY); }
    function onResizeUp() {
        stopResize();
        document.removeEventListener('mousemove', onResizeMove);
        document.removeEventListener('mouseup', onResizeUp);
    }

    // Touch Events for Resizing
    resizeHandle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        const touch = e.touches[0];
        startResize(touch.clientX, touch.clientY);
        document.addEventListener('touchmove', onTouchResizeMove, { passive: false });
        document.addEventListener('touchend', onTouchResizeUp);
    });

    function onTouchResizeMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        doResize(touch.clientX, touch.clientY);
    }

    function onTouchResizeUp() {
        stopResize();
        document.removeEventListener('touchmove', onTouchResizeMove);
        document.removeEventListener('touchend', onTouchResizeUp);
    }
}
function updateDockClock() {
    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
    });

    const date = now.toLocaleDateString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });

    document.getElementById('dock-time').textContent = time;
    document.getElementById('dock-date').textContent = date;
}
/* ==========================================
   LOCK SCREEN
========================================== */

const lockScreen = document.getElementById("lock-screen");
const lockTime = document.getElementById("lock-time");
const lockDate = document.getElementById("lock-date");


/* ==========================================
   UPDATE LOCK SCREEN CLOCK
========================================== */

function updateLockScreenClock() {

    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

    const date = now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    lockTime.textContent = time;

    lockDate.textContent = date;

}


/* ==========================================
   UNLOCK
========================================== */

function unlockScreen() {

    if (!lockScreen) return;

    lockScreen.style.transition =
        "transform 0.55s cubic-bezier(.22,.8,.2,1), opacity 0.45s ease";

    lockScreen.style.transform =
        "translateY(-100%)";

    lockScreen.style.opacity =
        "0";

    setTimeout(() => {

        lockScreen.classList.add(
            "unlocked"
        );

        lockScreen.style.transform = "";
        lockScreen.style.opacity = "";
        lockScreen.style.transition = "";

    }, 600);

}


/* ==========================================
   CLICK / TAP TO UNLOCK
========================================== */
/* ==========================================
   LOCK SCREEN SWIPE TO UNLOCK
========================================== */
let touchStartY = 0;
let touchCurrentY = 0;
let isDragging = false;

const SWIPE_THRESHOLD = 100;


/* ==========================================
   TOUCH START
========================================== */

lockScreen.addEventListener(
    "touchstart",
    (event) => {

        touchStartY =
            event.touches[0].clientY;

        touchCurrentY =
            touchStartY;

        isDragging = true;

        // Disable CSS transition while dragging
        lockScreen.style.transition = "none";

    },
    { passive: true }
);


/* ==========================================
   TOUCH MOVE
========================================== */

lockScreen.addEventListener(
    "touchmove",
    (event) => {

        if (!isDragging) return;

        touchCurrentY =
            event.touches[0].clientY;

        const distance =
            touchStartY - touchCurrentY;


        /*
        Only move when swiping UP
        */

        if (distance > 0) {

            /*
            Limit movement to screen height
            */

            const movement =
                Math.min(
                    distance,
                    window.innerHeight
                );


            lockScreen.style.transform =
                `translateY(${-movement}px)`;


            /*
            Slight fade while dragging
            */

            const progress =
                movement / window.innerHeight;

            lockScreen.style.opacity =
                1 - progress * 0.15;

        }

    },
    { passive: true }
);


/* ==========================================
   TOUCH END
========================================== */

lockScreen.addEventListener(
    "touchend",
    () => {

        if (!isDragging) return;

        isDragging = false;

        const distance =
            touchStartY - touchCurrentY;


        /*
        ========================================
        SWIPE WAS LONG ENOUGH
        ========================================
        */

        if (
            distance >= SWIPE_THRESHOLD
        ) {

            /*
            Re-enable transition
            */

            lockScreen.style.transition =
                "transform 0.55s cubic-bezier(.22,.8,.2,1), opacity 0.45s ease";


            /*
            Continue from current position
            and smoothly finish the swipe
            */

            requestAnimationFrame(() => {

                lockScreen.style.transform =
                    "translateY(-100%)";

                lockScreen.style.opacity =
                    "0";

            });


            /*
            Mark as unlocked after animation
            */

            setTimeout(() => {

                lockScreen.classList.add(
                    "unlocked"
                );

                /*
                Clear inline styles
                */

                lockScreen.style.transform =
                    "";

                lockScreen.style.opacity =
                    "";

                lockScreen.style.transition =
                    "";

            }, 600);

        }


        /*
        ========================================
        SWIPE WAS TOO SHORT
        ========================================
        */

        else {

            /*
            Smoothly return to original position
            */

            lockScreen.style.transition =
                "transform 0.4s cubic-bezier(.22,.8,.2,1), opacity 0.3s ease";


            lockScreen.style.transform =
                "translateY(0)";

            lockScreen.style.opacity =
                "1";


            /*
            Clear transition after animation
            */

            setTimeout(() => {

                lockScreen.style.transition =
                    "";

            }, 450);

        }


        touchStartY = 0;

        touchCurrentY = 0;

    }
);
/* ==========================================
   START CLOCK
========================================== */

updateLockScreenClock();

setInterval(
    updateLockScreenClock,
    1000
);
updateDockClock();

setInterval(updateDockClock, 1000);
// Initial Boot
renderUI();
