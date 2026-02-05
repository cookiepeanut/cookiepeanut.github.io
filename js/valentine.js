// All image files for floating photos
const allPhotos = [
    'images/DSCF3755.JPG', 'images/IMG_1895.jpeg', 'images/IMG_2870.jpeg', 'images/IMG_2876.jpeg',
    'images/IMG_2877.jpeg', 'images/IMG_2885.jpeg', 'images/IMG_2888.jpeg', 'images/IMG_2955.jpeg',
    'images/IMG_2971.jpeg', 'images/IMG_4731.jpeg', 'images/IMG_4751.jpeg', 'images/IMG_4788.jpeg',
    'images/IMG_4807.jpeg', 'images/IMG_7011.jpeg', 'images/IMG_9017.jpeg', 'images/IMG_9039.jpeg',
    'images/IMG_9103.jpeg', 'images/IMG_9344.jpeg', 'images/IMG_9358.jpeg'
];

// Create floating hearts and photos
function createFloatingHearts() {
    const container = document.getElementById('heartsContainer');
    const hearts = ['💕', '💖', '💗', '💓', '💝', '❤️', '🩷'];

    // Initial hearts
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.fontSize = (15 + Math.random() * 20) + 'px';
            heart.style.animationDuration = (4 + Math.random() * 4) + 's';
            heart.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 8000);
        }, i * 300);
    }

    // Initial floating photos
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createFloatingPhoto();
        }, i * 1000);
    }

    // Keep creating hearts and photos
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (15 + Math.random() * 20) + 'px';
        heart.style.animationDuration = (4 + Math.random() * 4) + 's';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 8000);
    }, 600);

    setInterval(() => {
        createFloatingPhoto();
    }, 3000);
}

function createFloatingPhoto() {
    const container = document.getElementById('heartsContainer');
    const photoDiv = document.createElement('div');
    photoDiv.className = 'floating-photo';

    const img = document.createElement('img');
    img.src = allPhotos[Math.floor(Math.random() * allPhotos.length)];

    photoDiv.appendChild(img);
    photoDiv.style.left = Math.random() * 90 + 'vw';
    photoDiv.style.animationDuration = (6 + Math.random() * 4) + 's';
    photoDiv.style.animationDelay = Math.random() + 's';

    container.appendChild(photoDiv);
    setTimeout(() => photoDiv.remove(), 10000);
}

createFloatingHearts();

// Slideshow functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.slideshow-image');

function initSlideshow() {
    const dotsContainer = document.getElementById('slideshowDots');
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'slide-dot' + (index === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });

    setInterval(nextSlide, 3000);
}

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    document.querySelectorAll('.slide-dot')[currentSlide].classList.remove('active');

    currentSlide = (currentSlide + 1) % slides.length;

    slides[currentSlide].classList.add('active');
    document.querySelectorAll('.slide-dot')[currentSlide].classList.add('active');
}

function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    document.querySelectorAll('.slide-dot')[currentSlide].classList.remove('active');

    currentSlide = index;

    slides[currentSlide].classList.add('active');
    document.querySelectorAll('.slide-dot')[currentSlide].classList.add('active');
}

// Initialize slideshow when screen 5 is shown
const slideshowObserver = new MutationObserver(() => {
    if (document.getElementById('screen5').classList.contains('active')) {
        if (document.getElementById('slideshowDots').children.length === 0) {
            initSlideshow();
        }
    }
});
slideshowObserver.observe(document.getElementById('screen5'), { attributes: true });

// Screen navigation
function nextScreen(num) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen' + num).classList.add('active');
}

// Trivia
const triviaQuestions = [
    {
        question: "Where was our very first date? 🚗",
        options: ["A fancy restaurant", "Lipscomb Parking Garage", "The movie theater", "A coffee shop"],
        correct: 1
    },
    {
        question: "What's my favorite food to share with you? 🍴",
        options: ["Pizza", "Burgers", "Tacos", "Sushi"],
        correct: 2
    },
    {
        question: "What candy do I know you absolutely LOVE? 🍬",
        options: ["Skittles", "M&Ms", "Reese's", "Snickers"],
        correct: 2
    },
    {
        question: "What's one of your favorite hobbies? 🎨",
        options: ["Video games", "Coloring", "Knitting", "Gardening"],
        correct: 1
    },
    {
        question: "Besides coloring, what else do you love doing? 👩‍🍳",
        options: ["Skydiving", "Cooking & Baking", "Rock climbing", "Coding"],
        correct: 1
    }
];

let currentQuestion = 0;
let score = 0;

function startTrivia() {
    currentQuestion = 0;
    score = 0;
    nextScreen(3);
    showQuestion();
}

function showQuestion() {
    const q = triviaQuestions[currentQuestion];
    document.getElementById('triviaQuestion').textContent = q.question;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}/${currentQuestion}`;

    // Progress dots
    const dotsHtml = triviaQuestions.map((_, i) => {
        let className = 'dot';
        if (i < currentQuestion) className += ' completed';
        if (i === currentQuestion) className += ' active';
        return `<div class="${className}"></div>`;
    }).join('');
    document.getElementById('progressDots').innerHTML = dotsHtml;

    // Options
    const optionsHtml = q.options.map((opt, i) =>
        `<div class="trivia-option" onclick="selectAnswer(${i})">${opt}</div>`
    ).join('');
    document.getElementById('triviaOptions').innerHTML = optionsHtml;
}

function selectAnswer(index) {
    const options = document.querySelectorAll('.trivia-option');
    const correct = triviaQuestions[currentQuestion].correct;

    options.forEach((opt, i) => {
        opt.style.pointerEvents = 'none';
        if (i === correct) {
            opt.classList.add('correct');
        } else if (i === index && i !== correct) {
            opt.classList.add('wrong');
        }
    });

    if (index === correct) {
        score++;
    }

    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < triviaQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }, 1200);
}

function showResults() {
    const percentage = (score / triviaQuestions.length) * 100;
    let emoji, title, message;

    if (percentage === 100) {
        emoji = '🏆';
        title = 'PERFECT SCORE!';
        message = "You know everything about us! I'm not surprised though... you're amazing!";
    } else if (percentage >= 60) {
        emoji = '🌟';
        title = 'Great Job!';
        message = "You know us pretty well! We make a great team!";
    } else {
        emoji = '💕';
        title = 'Nice Try!';
        message = "Looks like we need more taco dates to refresh your memory!";
    }

    document.getElementById('resultsEmoji').textContent = emoji;
    document.getElementById('resultsTitle').textContent = title;
    document.getElementById('resultsMessage').textContent = message + ` (${score}/${triviaQuestions.length})`;
    nextScreen(4);
}

// Coloring Canvas
const colors = ['#e74c8c', '#ff6b6b', '#f857a6', '#a855f7', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#ec4899', '#000000'];
let currentColor = colors[0];
let isDrawing = false;
let canvas, ctx;

function initCanvas() {
    canvas = document.getElementById('coloringCanvas');
    ctx = canvas.getContext('2d');

    // Set up color palette
    const palette = document.getElementById('colorPalette');
    palette.innerHTML = colors.map((color, i) =>
        `<div class="color-btn ${i === 0 ? 'active' : ''}" style="background: ${color}" onclick="selectColor('${color}', this)"></div>`
    ).join('');

    // Draw initial heart outline
    drawHeartOutline();

    // Canvas events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);

    // Brush size
    const brushSlider = document.getElementById('brushSize');
    brushSlider.addEventListener('input', (e) => {
        document.getElementById('brushSizeLabel').textContent = e.target.value + 'px';
    });
}

function drawHeartOutline() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ffccd5';
    ctx.lineWidth = 2;
    ctx.beginPath();

    // Draw a heart shape
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const size = 80;

    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y - size / 4);
    ctx.bezierCurveTo(x - size / 2, y - size / 2, x, y - size / 2, x, y - size / 4);
    ctx.bezierCurveTo(x, y - size / 2, x + size / 2, y - size / 2, x + size / 2, y - size / 4);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);

    ctx.stroke();

    // Add some decorative text
    ctx.fillStyle = '#ffb6c1';
    ctx.font = '14px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('Color me! 🎨', x, y + size / 2 + 30);
}

function selectColor(color, element) {
    currentColor = color;
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const brushSize = document.getElementById('brushSize').value;

    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function stopDrawing() {
    isDrawing = false;
}

function clearCanvas() {
    drawHeartOutline();
}

// Initialize canvas when screen 6 is shown
const canvasObserver = new MutationObserver(() => {
    if (document.getElementById('screen6').classList.contains('active')) {
        initCanvas();
    }
});
canvasObserver.observe(document.getElementById('screen6'), { attributes: true });

// The No Button That Runs Away
let noClickCount = 0;
const funnyMessages = [
    "Nice try! 😏",
    "You can't escape love!",
    "The button is too fast for you!",
    "Seriously? Just say yes! 💕",
    "I can do this all day...",
    "You're making the button tired!",
    "Just accept your fate! 😄",
    "RESISTANCE IS FUTILE!",
    "The yes button is lonely...",
    "Okay now you're just being silly!"
];

function runAway() {
    const btn = document.getElementById('noBtn');
    const container = document.getElementById('questionButtons');
    const containerRect = container.getBoundingClientRect();

    // Random position within the container area
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 50;

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    btn.style.position = 'fixed';
    btn.style.left = randomX + 'px';
    btn.style.top = randomY + 'px';
    btn.style.zIndex = '1000';

    // Make it smaller each time
    const currentSize = parseFloat(btn.style.fontSize) || 1.2;
    if (currentSize > 0.5) {
        btn.style.fontSize = (currentSize - 0.1) + 'rem';
    }

    // Show funny message
    noClickCount++;
    const msgEl = document.getElementById('noMessage');
    msgEl.textContent = funnyMessages[noClickCount % funnyMessages.length];
    msgEl.style.display = 'block';

    // Rain tacos and Reese's occasionally
    if (noClickCount % 3 === 0) {
        rainTreats();
    }
}

function rainTreats() {
    const treats = ['🌮', '🍫', '🥜'];
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const treat = document.createElement('div');
            treat.className = 'treat-rain';
            treat.textContent = treats[Math.floor(Math.random() * treats.length)];
            treat.style.left = Math.random() * 100 + 'vw';
            treat.style.animationDuration = (2 + Math.random() * 2) + 's';
            document.body.appendChild(treat);
            setTimeout(() => treat.remove(), 4000);
        }, i * 100);
    }
}

// Say Yes!
function sayYes() {
    nextScreen(8);
    celebrate();
}

function celebrate() {
    // Confetti explosion
    const colors = ['#e74c8c', '#ff6b6b', '#f857a6', '#a855f7', '#3b82f6', '#22c55e', '#eab308', '#ffd700'];

    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (5 + Math.random() * 10) + 'px';
            confetti.style.height = (5 + Math.random() * 10) + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 30);
    }

    // Also rain treats!
    rainTreats();
    setTimeout(rainTreats, 1000);
    setTimeout(rainTreats, 2000);
}
