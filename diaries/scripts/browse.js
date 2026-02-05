// Digital Diaries - Browse View JavaScript

// User color mapping
const USER_COLORS = {
    'pmitr02@gmail.com': { color: '#3b82f6', name: 'Cookie', class: 'user-blue' },
    'lisapatel1101@gmail.com': { color: '#ec4899', name: 'Peanut', class: 'user-pink' }
};

let currentUser = null;
let allMemories = [];
let filteredMemories = [];
let currentView = 'grid';

// ============================================
// SECURITY: HTML ESCAPE FUNCTION
// ============================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? String(text).replace(/[&<>"']/g, (m) => map[m]) : '';
}

// ============================================
// AUTHENTICATION
// ============================================

async function signInWithGoogle() {
    try {
        const result = await window.firebaseSignInWithPopup(window.firebaseAuth, window.firebaseProvider);
        currentUser = result.user;
        updateAuthUI(currentUser);
        loadMemories();
    } catch (error) {
        console.error('Sign-in error:', error);
        alert('Failed to sign in. Please try again.');
    }
}

async function signOutUser() {
    try {
        await window.firebaseSignOut(window.firebaseAuth);
        currentUser = null;
        updateAuthUI(null);
        allMemories = [];
        filteredMemories = [];
        document.getElementById('memoriesGrid').innerHTML = '';
        document.getElementById('emptyState').style.display = 'flex';
    } catch (error) {
        console.error('Sign-out error:', error);
    }
}

function updateAuthUI(user) {
    const signInBtn = document.getElementById('signInBtn');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    if (user) {
        signInBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = user.displayName || user.email;
    } else {
        signInBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

// Initialize Firebase auth listener
function initializeAuth() {
    if (window.firebaseOnAuthStateChanged && window.firebaseAuth) {
        window.firebaseOnAuthStateChanged(window.firebaseAuth, (user) => {
            currentUser = user;
            if (user) {
                updateAuthUI(user);
                loadMemories();
            } else {
                // Not authenticated - redirect to homepage
                window.location.href = '../index.html';
            }
        });
    } else {
        // Firebase not loaded yet, retry after a short delay
        setTimeout(initializeAuth, 100);
    }
}

// ============================================
// LOAD MEMORIES FROM FIREBASE
// ============================================

async function loadMemories() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const memoriesGrid = document.getElementById('memoriesGrid');

    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    memoriesGrid.innerHTML = '';

    try {
        const memoriesRef = window.firestoreCollection(window.firebaseDb, 'memories');
        const q = window.firestoreQuery(memoriesRef, window.firestoreOrderBy('createdAt', 'desc'));
        const querySnapshot = await window.firestoreGetDocs(q);

        allMemories = [];
        querySnapshot.forEach((doc) => {
            allMemories.push({ id: doc.id, ...doc.data() });
        });

        filteredMemories = [...allMemories];
        loadingState.style.display = 'none';

        if (allMemories.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            renderMemories(filteredMemories);
        }
    } catch (error) {
        console.error('Error loading memories:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'flex';
    }
}

// ============================================
// RENDER MEMORIES
// ============================================

function renderMemories(memories) {
    const memoriesGrid = document.getElementById('memoriesGrid');
    const emptyState = document.getElementById('emptyState');

    memoriesGrid.innerHTML = '';

    if (memories.length === 0) {
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    memories.forEach((memory, index) => {
        const memoryCard = createMemoryCard(memory, index);
        memoriesGrid.appendChild(memoryCard);
    });
}

function createMemoryCard(memory, index) {
    const card = document.createElement('div');
    card.className = 'memory-card visible';

    // Format dates
    const dates = memory.dates || [];
    const formattedDates = dates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }).join(', ');

    // Activities HTML
    let activitiesHTML = '';
    if (memory.activities && memory.activities.length > 0) {
        activitiesHTML = '<div class="card-activities">';
        memory.activities.forEach(activity => {
            const userConfig = USER_COLORS[activity.userId] || { class: '' };
            activitiesHTML += `<span class="activity-item ${escapeHtml(userConfig.class)}">${escapeHtml(activity.text)}</span>`;
        });
        activitiesHTML += '</div>';
    }

    // Restaurant HTML
    let restaurantHTML = '';
    if (memory.restaurant) {
        restaurantHTML = `<div class="card-restaurant">🍽️ ${escapeHtml(memory.restaurant)}</div>`;
    }

    // Photos HTML
    let photosHTML = '';
    if (memory.photos && memory.photos.length > 0) {
        photosHTML = '<div class="card-photos">';
        memory.photos.forEach((photo, photoIndex) => {
            const photoId = `browse-photo-${index}-${photoIndex}`;
            photosHTML += `
                <img src="${escapeHtml(photo)}"
                     alt="Memory photo"
                     class="card-photo"
                     data-photo-src="${escapeHtml(photo)}"
                     id="${photoId}"
                     loading="lazy">
            `;
        });
        photosHTML += '</div>';
    }

    card.innerHTML = `
        <div class="card-content">
            <div class="card-header-actions">
                <div class="card-date">${escapeHtml(formattedDates)}</div>
                <button class="btn-edit-memory" onclick="window.location.href='timeline.html?edit=${memory.id}'" title="Edit memory">✏️</button>
            </div>
            <h3 class="card-location">${escapeHtml(memory.location || 'Unknown Location')}</h3>
            ${activitiesHTML}
            ${restaurantHTML}
            ${photosHTML}
        </div>
    `;

    // Add click handlers to photos after rendering
    if (memory.photos && memory.photos.length > 0) {
        memory.photos.forEach((photo, photoIndex) => {
            const photoId = `browse-photo-${index}-${photoIndex}`;
            setTimeout(() => {
                const photoEl = document.getElementById(photoId);
                if (photoEl) {
                    photoEl.addEventListener('click', () => openModal(photo));
                }
            }, 0);
        });
    }

    return card;
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterMemories(searchTerm);
    }, 300));
}

function filterMemories(searchTerm) {
    if (!searchTerm) {
        filteredMemories = [...allMemories];
    } else {
        filteredMemories = allMemories.filter(memory => {
            const location = (memory.location || '').toLowerCase();
            const activities = (memory.activities || [])
                .map(a => a.text.toLowerCase())
                .join(' ');
            const dates = (memory.dates || []).join(' ');

            return location.includes(searchTerm) ||
                   activities.includes(searchTerm) ||
                   dates.includes(searchTerm);
        });
    }

    // Re-apply current sort
    const sortBy = document.getElementById('sortBy').value;
    sortMemories(sortBy);
}

// ============================================
// SORT FUNCTIONALITY
// ============================================

const sortBySelect = document.getElementById('sortBy');
if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
        sortMemories(e.target.value);
    });
}

function sortMemories(sortType) {
    switch (sortType) {
        case 'date-desc':
            filteredMemories.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            break;
        case 'date-asc':
            filteredMemories.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            break;
        case 'location-asc':
            filteredMemories.sort((a, b) => {
                const locA = (a.location || '').toLowerCase();
                const locB = (b.location || '').toLowerCase();
                return locA.localeCompare(locB);
            });
            break;
    }

    renderMemories(filteredMemories);
}

// ============================================
// VIEW TOGGLE (GRID / LIST)
// ============================================

function switchView(view) {
    currentView = view;
    const container = document.getElementById('memoriesContainer');
    const buttons = document.querySelectorAll('.view-btn');

    // Update container class
    if (view === 'grid') {
        container.classList.remove('list-view');
        container.classList.add('grid-view');
    } else {
        container.classList.remove('grid-view');
        container.classList.add('list-view');
    }

    // Update button states
    buttons.forEach(btn => {
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// ============================================
// IMAGE MODAL
// ============================================

function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modalImage.src = imageSrc;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Digital Diaries Browse initialized');

    // Initialize Firebase auth
    initializeAuth();

    // Remove loading class for smooth fade-in
    setTimeout(() => {
        document.body.classList.remove('diary-loading');
    }, 100);
});
