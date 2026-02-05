// Digital Diaries - Timeline View JavaScript

// User color mapping (same as memories.js)
const USER_COLORS = {
    'pmitr02@gmail.com': { color: '#3b82f6', name: 'Cookie', class: 'user-blue' },
    'lisapatel1101@gmail.com': { color: '#ec4899', name: 'Peanut', class: 'user-pink' }
};

let currentUser = null;
let allMemories = [];

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
        document.getElementById('timeline').innerHTML = '';
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
    const timeline = document.getElementById('timeline');

    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    timeline.innerHTML = '';

    try {
        const memoriesRef = window.firestoreCollection(window.firebaseDb, 'memories');
        const q = window.firestoreQuery(memoriesRef, window.firestoreOrderBy('createdAt', 'desc'));
        const querySnapshot = await window.firestoreGetDocs(q);

        allMemories = [];
        querySnapshot.forEach((doc) => {
            allMemories.push({ id: doc.id, ...doc.data() });
        });

        loadingState.style.display = 'none';

        if (allMemories.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            renderTimeline(allMemories);
            setupScrollAnimations();
        }
    } catch (error) {
        console.error('Error loading memories:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'flex';
    }
}

// ============================================
// RENDER TIMELINE
// ============================================

function renderTimeline(memories) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    memories.forEach((memory, index) => {
        const memoryCard = createTimelineCard(memory, index);
        timeline.appendChild(memoryCard);
    });
}

function createTimelineCard(memory, index) {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.setAttribute('data-index', index);

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
            const photoId = `photo-${index}-${photoIndex}`;
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
                <button class="btn-edit-memory" onclick="editMemory('${memory.id}')" title="Edit memory">✏️</button>
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
            const photoId = `photo-${index}-${photoIndex}`;
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
// SCROLL-TRIGGERED ANIMATIONS (APPLE-STYLE)
// ============================================

function setupScrollAnimations() {
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation delay based on order
                const delay = index * 100;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const memoryCards = document.querySelectorAll('.memory-card');
    memoryCards.forEach(card => {
        observer.observe(card);
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
// LAZY LOADING FOR IMAGES
// ============================================

// Images already use loading="lazy" attribute in HTML
// For older browsers, we can add this polyfill
if ('loading' in HTMLImageElement.prototype === false) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src || img.src;
    });
}

// ============================================
// SMOOTH SCROLL PERFORMANCE
// ============================================

// Debounce scroll events for better performance
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

// Add smooth reveal on scroll
window.addEventListener('scroll', debounce(() => {
    // Additional scroll-based animations can be added here
}, 100));

// ============================================
// ADD MEMORY FUNCTIONALITY
// ============================================

let currentNotes = [];
let currentPhotos = [];
let editingMemoryId = null;

function openAddMemoryModal(memory = null) {
    const modal = document.getElementById('addMemoryModal');
    const modalTitle = modal.querySelector('.modal-header h2');

    if (memory) {
        // Edit mode
        editingMemoryId = memory.id;
        modalTitle.textContent = 'Edit Memory';

        // Pre-fill form fields
        const dates = memory.dates || [];
        document.getElementById('startDate').value = dates[0] || '';
        document.getElementById('endDate').value = dates[1] || '';
        document.getElementById('memoryLocation').value = memory.location || '';
        document.getElementById('restaurantInput').value = memory.restaurant || '';

        // Pre-fill notes
        currentNotes = (memory.activities || []).map(activity => activity.text);
        renderNotesList();

        // Pre-fill photos
        currentPhotos = memory.photos || [];
        renderPhotoPreview();
    } else {
        // Add mode
        editingMemoryId = null;
        modalTitle.textContent = 'Add New Memory';
        resetAddMemoryForm();
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAddMemoryModal() {
    document.getElementById('addMemoryModal').classList.remove('active');
    document.body.style.overflow = '';
    resetAddMemoryForm();
}

function resetAddMemoryForm() {
    document.getElementById('addMemoryForm').reset();
    currentNotes = [];
    currentPhotos = [];
    editingMemoryId = null;
    document.getElementById('notesList').innerHTML = '';
    document.getElementById('photoPreviewGrid').innerHTML = '';
}

function editMemory(memoryId) {
    const memory = allMemories.find(m => m.id === memoryId);
    if (memory) {
        openAddMemoryModal(memory);
    }
}

function addNote() {
    const noteInput = document.getElementById('noteInput');
    const noteText = noteInput.value.trim();

    if (noteText) {
        currentNotes.push(noteText);
        renderNotesList();
        noteInput.value = '';
    }
}

function handleNoteKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addNote();
    }
}

function removeNote(index) {
    currentNotes.splice(index, 1);
    renderNotesList();
}

function renderNotesList() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = currentNotes.map((note, index) => `
        <li>
            <span>${escapeHtml(note)}</span>
            <button type="button" class="btn-remove-note" onclick="removeNote(${index})">&times;</button>
        </li>
    `).join('');
}

function previewMemoryPhotos(event) {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentPhotos.push(e.target.result);
            renderPhotoPreview();
        };
        reader.readAsDataURL(file);
    });
}

function removePhoto(index) {
    currentPhotos.splice(index, 1);
    renderPhotoPreview();
}

function renderPhotoPreview() {
    const previewGrid = document.getElementById('photoPreviewGrid');
    previewGrid.innerHTML = currentPhotos.map((photo, index) => `
        <div class="photo-preview-item">
            <img src="${photo}" alt="Preview">
            <button type="button" class="btn-remove-photo" onclick="removePhoto(${index})">&times;</button>
        </div>
    `).join('');
}

async function compressImage(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Max dimensions
            const maxSize = 800;
            if (width > height && width > maxSize) {
                height = (height / width) * maxSize;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width / height) * maxSize;
                height = maxSize;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = dataUrl;
    });
}

async function saveNewMemory(event) {
    event.preventDefault();

    if (currentNotes.length === 0) {
        alert('Please add at least one note about what you did');
        return;
    }

    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const location = document.getElementById('memoryLocation').value;
    const restaurant = document.getElementById('restaurantInput').value;

    // Build dates array
    const dates = [startDate];
    if (endDate && endDate !== startDate) {
        dates.push(endDate);
    }

    // Compress photos (only new ones that aren't already base64)
    const compressedPhotos = [];
    for (const photo of currentPhotos) {
        // If photo already starts with data:image, it's already compressed
        if (photo.startsWith('data:image')) {
            compressedPhotos.push(photo);
        } else {
            const compressed = await compressImage(photo);
            compressedPhotos.push(compressed);
        }
    }

    // Build memory object
    const memory = {
        dates: dates,
        location: location,
        activities: currentNotes.map(note => ({
            text: note,
            userId: currentUser.email,
            timestamp: Date.now()
        })),
        photos: compressedPhotos,
        updatedAt: Date.now()
    };

    // Add restaurant if provided
    if (restaurant) {
        memory.restaurant = restaurant;
    }

    try {
        if (editingMemoryId) {
            // Update existing memory
            const memoryRef = window.firestoreDoc(window.firebaseDb, 'memories', editingMemoryId);
            await window.firestoreUpdateDoc(memoryRef, memory);
            alert('Memory updated successfully!');
        } else {
            // Create new memory
            memory.createdBy = currentUser.email;
            memory.createdByName = currentUser.displayName || currentUser.email.split('@')[0];
            memory.createdAt = Date.now();

            await window.firestoreAddDoc(
                window.firestoreCollection(window.firebaseDb, 'memories'),
                memory
            );
            alert('Memory saved successfully!');
        }

        closeAddMemoryModal();
        loadMemories(); // Reload the timeline
    } catch (error) {
        console.error('Error saving memory:', error);
        alert('Failed to save memory. Please try again.');
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Digital Diaries Timeline initialized');

    // Initialize Firebase auth
    initializeAuth();

    // Remove loading class for smooth fade-in
    setTimeout(() => {
        document.body.classList.remove('diary-loading');
    }, 100);

    // Check if we should open edit modal from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        // Wait for memories to load, then open edit modal
        const checkMemoriesInterval = setInterval(() => {
            if (allMemories.length > 0) {
                clearInterval(checkMemoriesInterval);
                editMemory(editId);
                // Clear the URL parameter
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }, 100);
    }
});
