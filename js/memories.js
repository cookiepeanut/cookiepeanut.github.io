let currentUser = null;
let selectedDates = [];
let currentActivities = [];
let currentPhotos = [];

// User color mapping - YOUR EMAILS ARE NOW CONFIGURED
const USER_COLORS = {
    'pmitr02@gmail.com': { color: '#3b82f6', name: 'Cookie', class: 'user-blue' },
    'lisapatel1101@gmail.com': { color: '#ec4899', name: 'Peanut', class: 'user-pink' }
};

// Security: HTML escape function to prevent XSS
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

// Get user color
function getUserColor(email) {
    return USER_COLORS[email] || { color: '#999', name: 'Unknown', class: 'user-blue' };
}

// Auth state observer
window.addEventListener('load', () => {
    if (window.firebaseOnAuthStateChanged && window.firebaseAuth) {
        window.firebaseOnAuthStateChanged(window.firebaseAuth, (user) => {
            currentUser = user;
            updateAuthUI(user);
            if (user) {
                loadMemories();
            }
        });
    }
});

// Sign in with Google
async function signInWithGoogle() {
    try {
        const result = await window.firebaseSignInWithPopup(window.firebaseAuth, window.firebaseProvider);
        currentUser = result.user;
        updateAuthUI(currentUser);
        loadMemories();
    } catch (error) {
        console.error('Error signing in:', error);
        alert('Error signing in: ' + error.message);
    }
}

// Sign out
async function signOutUser() {
    try {
        await window.firebaseSignOut(window.firebaseAuth);
        currentUser = null;
        updateAuthUI(null);
        document.getElementById('memoriesGrid').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔒</div><p>Sign in to view memories</p></div>';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Update auth UI
function updateAuthUI(user) {
    const authContainer = document.getElementById('authContainer');
    const userInfo = document.getElementById('userInfo');
    const tabContainer = document.getElementById('tabContainer');

    if (user) {
        authContainer.style.display = 'none';
        userInfo.style.display = 'flex';
        tabContainer.style.display = 'flex';
        document.getElementById('userAvatar').src = user.photoURL || '';
        document.getElementById('userName').textContent = user.displayName || user.email;
    } else {
        authContainer.style.display = 'block';
        userInfo.style.display = 'none';
        tabContainer.style.display = 'none';
    }
}

// Switch tabs
function switchTab(tab) {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => btn.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));

    if (tab === 'view') {
        buttons[0].classList.add('active');
        document.getElementById('viewTab').classList.add('active');
        loadMemories();
    } else {
        buttons[1].classList.add('active');
        document.getElementById('addTab').classList.add('active');
    }
}

// Add date
function addDate() {
    const dateInput = document.getElementById('dateInput');
    const dateValue = dateInput.value;

    if (dateValue && !selectedDates.includes(dateValue)) {
        selectedDates.push(dateValue);
        renderDates();
        dateInput.value = '';
    }
}

// Remove date
function removeDate(date) {
    selectedDates = selectedDates.filter(d => d !== date);
    renderDates();
}

// Render dates
function renderDates() {
    const container = document.getElementById('selectedDates');
    container.innerHTML = selectedDates.map(date => `
        <div class="date-tag">
            <span>${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <button type="button" onclick="removeDate('${date}')" title="Remove date">×</button>
        </div>
    `).join('');
}

// Add activity
function addActivity() {
    const activityInput = document.getElementById('activityInput');
    const activityText = activityInput.value.trim();

    if (activityText && currentUser) {
        const activity = {
            text: activityText,
            userId: currentUser.email,
            timestamp: Date.now()
        };
        currentActivities.push(activity);
        renderActivities();
        activityInput.value = '';
    }
}

// Remove activity
function removeActivity(index) {
    currentActivities.splice(index, 1);
    renderActivities();
}

// Render activities
function renderActivities() {
    const container = document.getElementById('activitiesList');
    container.innerHTML = currentActivities.map((activity, index) => {
        const userColor = getUserColor(activity.userId);
        return `
            <li class="activity-item ${userColor.class}">
                <span>• ${activity.text}</span>
                <button type="button" class="activity-delete" onclick="removeActivity(${index})">×</button>
            </li>
        `;
    }).join('');
}

// Preview and compress photos
async function previewPhotos(event) {
    const files = Array.from(event.target.files);
    const previews = await Promise.all(files.map(file => compressImage(file)));
    currentPhotos = previews.filter(p => p !== null);
    renderPhotoPreview();
}

// Compress image to base64
function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if too large (max 800px width)
                const maxWidth = 800;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with quality 0.7
                const compressed = canvas.toDataURL('image/jpeg', 0.7);

                // Check size (should be under ~500KB for Firestore)
                const sizeInBytes = (compressed.length * 3) / 4;
                if (sizeInBytes > 500000) {
                    console.warn('Image still too large, compressing more');
                    resolve(canvas.toDataURL('image/jpeg', 0.5));
                } else {
                    resolve(compressed);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Render photo preview
function renderPhotoPreview() {
    const container = document.getElementById('photoPreviewContainer');
    container.innerHTML = currentPhotos.map((photo, index) => `
        <div class="photo-preview">
            <img src="${photo}" alt="Preview">
            <button type="button" class="photo-preview-remove" onclick="removePhoto(${index})">×</button>
        </div>
    `).join('');
}

// Remove photo
function removePhoto(index) {
    currentPhotos.splice(index, 1);
    renderPhotoPreview();
}

// Save memory to Firestore
async function saveMemory(event) {
    event.preventDefault();

    if (!currentUser) {
        alert('Please sign in first!');
        return;
    }

    if (selectedDates.length === 0) {
        alert('Please add at least one date!');
        return;
    }

    const location = document.getElementById('locationInput').value;

    try {
        const memory = {
            dates: selectedDates,
            location: location,
            activities: currentActivities,
            photos: currentPhotos,
            createdBy: currentUser.email,
            createdByName: currentUser.displayName || currentUser.email,
            createdAt: Date.now()
        };

        await window.firestoreAddDoc(
            window.firestoreCollection(window.firebaseDb, 'memories'),
            memory
        );

        alert('Memory saved! 💕');

        // Reset form
        selectedDates = [];
        currentActivities = [];
        currentPhotos = [];
        document.getElementById('memoryForm').reset();
        renderDates();
        renderActivities();
        renderPhotoPreview();

        // Switch to view tab
        switchTab('view');
    } catch (error) {
        console.error('Error saving memory:', error);
        alert('Error saving memory: ' + error.message);
    }
}

// Load memories from Firestore
async function loadMemories() {
    if (!currentUser) return;

    try {
        const q = window.firestoreQuery(
            window.firestoreCollection(window.firebaseDb, 'memories'),
            window.firestoreOrderBy('createdAt', 'desc')
        );

        const querySnapshot = await window.firestoreGetDocs(q);
        const memories = [];

        querySnapshot.forEach((doc) => {
            memories.push({ id: doc.id, ...doc.data() });
        });

        renderMemories(memories);
    } catch (error) {
        console.error('Error loading memories:', error);
        alert('Error loading memories: ' + error.message);
    }
}

// Render memories grid
function renderMemories(memories) {
    const container = document.getElementById('memoriesGrid');

    if (memories.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No memories yet! Add your first one.</p></div>';
        return;
    }

    container.innerHTML = memories.map(memory => {
        const datesText = memory.dates.map(d =>
            new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        ).join(', ');

        const activitiesHtml = memory.activities.map(activity => {
            const userColor = getUserColor(activity.userId);
            return `<li class="${escapeHtml(userColor.class)}">• ${escapeHtml(activity.text)}</li>`;
        }).join('');

        const photosHtml = memory.photos && memory.photos.length > 0 ? `
            <div class="memory-photos">
                ${memory.photos.map((photo, photoIndex) => `
                    <img src="${escapeHtml(photo)}"
                         alt="Memory photo"
                         class="memory-photo-img"
                         data-photo-src="${escapeHtml(photo)}"
                         id="memory-photo-${escapeHtml(memory.id)}-${photoIndex}">
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="memory-card" data-memory-id="${escapeHtml(memory.id)}">
                <div class="memory-date">${escapeHtml(datesText)}</div>
                <div class="memory-location">📍 ${escapeHtml(memory.location)}</div>
                <ul class="memory-activities">${activitiesHtml}</ul>
                ${photosHtml}
                <div style="font-size: 0.8rem; color: #999; margin-top: 10px;">
                    Added by ${escapeHtml(memory.createdByName)}
                </div>
                ${currentUser.email === memory.createdBy ? `
                    <button class="memory-delete-btn" data-memory-id="${escapeHtml(memory.id)}">Delete</button>
                ` : ''}
            </div>
        `;
    }).join('');

    // Add event listeners for photo clicks
    memories.forEach(memory => {
        if (memory.photos && memory.photos.length > 0) {
            memory.photos.forEach((photo, photoIndex) => {
                const photoEl = document.getElementById(`memory-photo-${memory.id}-${photoIndex}`);
                if (photoEl) {
                    photoEl.addEventListener('click', () => openModal(photo));
                }
            });
        }
    });

    // Add event listeners for delete buttons
    const deleteButtons = container.querySelectorAll('.memory-delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const memoryId = btn.getAttribute('data-memory-id');
            deleteMemory(memoryId);
        });
    });
}

// Delete memory
async function deleteMemory(memoryId) {
    if (!confirm('Are you sure you want to delete this memory?')) return;

    try {
        await window.firestoreDeleteDoc(
            window.firestoreDoc(window.firebaseDb, 'memories', memoryId)
        );
        loadMemories();
    } catch (error) {
        console.error('Error deleting memory:', error);
        alert('Error deleting memory: ' + error.message);
    }
}

// Modal functions
function openModal(imageSrc) {
    document.getElementById('imageModal').classList.add('active');
    document.getElementById('modalImage').src = imageSrc;
}

function closeModal() {
    document.getElementById('imageModal').classList.remove('active');
}

// Allow Enter key to add activities
document.addEventListener('DOMContentLoaded', () => {
    const activityInput = document.getElementById('activityInput');
    if (activityInput) {
        activityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addActivity();
            }
        });
    }
});