// ============================================================
// SMART PET FEEDER - ENHANCED RECOGNITION SCRIPT
// ============================================================

// -------------------- STATE --------------------
const API_BASE_URL = "https://localhost:7261";
let state = {
    pets: [
        {
            id: 'pet1',
            name: "Buddy",
            type: "Dog",
            breed: "Labrador",
            age: 3,
            weight: 25,
            dailyTarget: 180,
            mealAmount: 30,
            profileImage: null,
            isActive: true,
            traits: {
                color: "Golden",
                markings: "White chest",
                personality: "Energetic"
            },
            recognitionData: {
                confidence: 0.947,
                lastDetected: "12:32 PM",
                imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=center"
            }
        },
        {
            id: 'pet2',
            name: "Whiskers",
            type: "Cat",
            breed: "Persian",
            age: 2,
            weight: 4.5,
            dailyTarget: 120,
            mealAmount: 20,
            profileImage: null,
            isActive: false,
            traits: {
                color: "White",
                markings: "Blue eyes",
                personality: "Calm"
            },
            recognitionData: {
                confidence: 0.891,
                lastDetected: "11:15 AM",
                imageUrl: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=80&h=80&fit=crop&crop=center"
            }
        },
        {
            id: 'pet3',
            name: "Molly",
            type: "Dog",
            breed: "Golden Retriever",
            age: 4,
            weight: 28,
            dailyTarget: 200,
            mealAmount: 30,
            profileImage: null,
            isActive: false,
            traits: {
                color: "Golden",
                markings: "Fluffy tail",
                personality: "Playful"
            },
            recognitionData: {
                confidence: 0.0,
                lastDetected: null,
                imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=center"
            }
        }
    ],
    activePetId: 'pet1',
    foodLevel: 72,
    waterLevel: 85,
    tds: 145,
    feedingMode: "automatic",
    manualAmount: 30,
    currentRecognition: {
        petId: 'pet1',
        petName: "Buddy",
        confidence: 0.947,
        authorized: true,
        lastDetected: "12:32 PM"
    },
    meals: [
        { id: 'm1', time: '08:00', amount: 30, days: [1,2,3,4,5,6,7], enabled: true, skipped: false },
        { id: 'm2', time: '13:00', amount: 25, days: [1,2,3,4,5,6,7], enabled: true, skipped: false },
        { id: 'm3', time: '18:00', amount: 30, days: [1,2,3,4,5,6,7], enabled: true, skipped: false }
    ],
    feedingHistory: [
        { date: 'Tue Sep 01 2028', time: '22:49', pet: 'Buddy', amount: 25, mode: 'Manual' },
        { date: 'Tue Sep 01 2028', time: '22:49', pet: 'Buddy', amount: 25.5, mode: 'Manual' },
        { date: 'Tue Sep 01 2028', time: '22:48', pet: 'Buddy', amount: 20, mode: 'Auto' }
    ],
    notifications: [
        { id: 'n1', message: 'Switched to automatic mode', type: 'info', timestamp: '10:17', read: false },
        { id: 'n2', message: 'Switched to automatic mode', type: 'info', timestamp: '10:12', read: false },
        { id: 'n3', message: 'TDS quality: 96.54 ppm', type: 'info', timestamp: '10:09', read: false },
        { id: 'n4', message: 'Water level checked: 79%', type: 'info', timestamp: '10:09', read: false },
        { id: 'n5', message: 'Switched to automatic mode', type: 'info', timestamp: '10:07', read: false }
    ],
    activityLog: [
        { id: 'a1', message: 'Buddy recognized', icon: 'fa-dog', color: '#2d7d46', timestamp: '12:32 PM' },
        { id: 'a2', message: 'Food dispensed 30 g', icon: 'fa-utensils', color: '#e65100', timestamp: '12:35 PM' }
    ],
    darkMode: false,
    isCameraActive: false,
    isModelLoaded: false,
    isLoggedIn: false
};

// ==================== CAMERA VARIABLES ====================
let mobilenetModel = null;
let cameraStream = null;

// ==================== USER PROFILE (South Africa) ====================
let userProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+27 82 123 4567',
    address: '123 Main Street',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001',
    country: 'South Africa',
    petPreference: 'both',
    experience: 'intermediate',
    avatar: null
};

// ==================== ENHANCED PET RECOGNITION KEYWORDS ====================
const PET_KEYWORDS = [
    'dog', 'puppy', 'canine', 'hound', 'retriever', 'labrador', 'golden',
    'bulldog', 'poodle', 'beagle', 'dachshund', 'husky', 'malamute',
    'german shepherd', 'rottweiler', 'doberman', 'boxer', 'great dane',
    'chihuahua', 'shih tzu', 'maltese', 'pomeranian', 'corgi', 'collie',
    'spaniel', 'terrier', 'mastiff', 'saint bernard', 'newfoundland',
    'akita', 'samoyed', 'border collie', 'australian shepherd',
    'cat', 'kitten', 'feline', 'persian', 'siamese', 'maine coon',
    'ragdoll', 'sphynx', 'bengal', 'abyssinian', 'birman', 'burmese',
    'pet', 'animal', 'mammal', 'fur', 'paw', 'whisker', 'tail'
];

const NON_PET_KEYWORDS = [
    'person', 'human', 'man', 'woman', 'child', 'boy', 'girl',
    'car', 'truck', 'bus', 'bicycle', 'motorcycle', 'airplane',
    'boat', 'train', 'ship', 'building', 'house', 'tree', 'flower',
    'plant', 'table', 'chair', 'sofa', 'bed', 'lamp', 'clock',
    'book', 'phone', 'computer', 'television', 'remote', 'keyboard',
    'mouse', 'monitor', 'laptop', 'tablet', 'camera', 'lens',
    'bottle', 'cup', 'glass', 'plate', 'bowl', 'fork', 'knife',
    'spoon', 'food', 'pizza', 'burger', 'sandwich', 'hot dog'
];

// ==================== AUTHENTICATION FUNCTIONS ====================

// ==================== AUTHENTICATION FUNCTIONS (REAL SQL SERVER AUTH) ====================

// Check if user has an active session
function checkAuth() {
    const userSession = localStorage.getItem('currentUser');
    if (userSession) {
        state.isLoggedIn = true;
        const user = JSON.parse(userSession);
        
        document.getElementById('authOverlay').classList.add('hidden');
        document.getElementById('mainHeader').style.display = 'flex';
        document.getElementById('sidebar').style.display = 'flex';

        // Display user's real name from SQL Server
        if (dom.headerUserName) dom.headerUserName.textContent = `${user.firstName} ${user.lastName}`;
        if (dom.displayUserName) dom.displayUserName.textContent = `${user.firstName} ${user.lastName}`;
        if (dom.displayUserEmail) dom.displayUserEmail.textContent = user.email;
        
        return true;
    }
    return false;
}

// Real Login against C# API & SQL Server
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save real verified session from database
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            state.isLoggedIn = true;

            document.getElementById('authOverlay').classList.add('hidden');
            document.getElementById('mainHeader').style.display = 'flex';
            document.getElementById('sidebar').style.display = 'flex';

            if (dom.headerUserName) dom.headerUserName.textContent = `${data.user.firstName} ${data.user.lastName}`;
            if (dom.displayUserName) dom.displayUserName.textContent = `${data.user.firstName} ${data.user.lastName}`;
            if (dom.displayUserEmail) dom.displayUserEmail.textContent = data.user.email;

            addActivity(`Logged in as ${data.user.firstName}`, 'fa-sign-in-alt', '#2d7d46');
            addNotification(`Welcome back, ${data.user.firstName}!`, 'success');
            return true;
        } else {
            alert(data.message || 'Invalid email or password.');
            return false;
        }
    } catch (error) {
        alert('Cannot connect to authentication server.');
        return false;
    }
}

// Real Registration into SQL Server
async function registerUser(firstName, lastName, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Account created in SQL Server! Please sign in with your credentials.');
            showAuthForm('login');
            return true;
        } else {
            alert(data.message || 'Registration failed.');
            return false;
        }
    } catch (error) {
        alert('Cannot connect to registration server.');
        return false;
    }
}

function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        state.isLoggedIn = false;
        document.getElementById('authOverlay').classList.remove('hidden');
        document.getElementById('mainHeader').style.display = 'none';
        document.getElementById('sidebar').style.display = 'none';
        showAuthForm('login');
    }
}

function showAuthForm(form) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    if (form === 'login') document.getElementById('loginForm').classList.add('active');
    else if (form === 'register') document.getElementById('registerForm').classList.add('active');
    else if (form === 'forgot') document.getElementById('forgotPasswordForm').classList.add('active');
}

// ==================== AUTO-DETECTION FEATURE ====================
let autoDetectEnabled = false;
let autoDetectInterval = null;

function toggleAutoDetect() {
    autoDetectEnabled = !autoDetectEnabled;
    const btn = document.getElementById('autoDetectToggle');
    if (autoDetectEnabled) {
        btn.innerHTML = '<i class="fas fa-robot"></i> Auto-Detect: ON';
        btn.style.background = '#22c55e';
        startAutoDetect();
        addActivity('Auto-detect enabled', 'fa-robot', '#22c55e');
        addNotification('Auto-detect enabled - Camera will automatically detect pets', 'success');
    } else {
        btn.innerHTML = '<i class="fas fa-robot"></i> Auto-Detect: OFF';
        btn.style.background = '#f59e0b';
        stopAutoDetect();
        addActivity('Auto-detect disabled', 'fa-robot', '#f59e0b');
        addNotification('Auto-detect disabled', 'info');
    }
}

function startAutoDetect() {
    if (autoDetectInterval) clearInterval(autoDetectInterval);
    autoDetectInterval = setInterval(() => {
        if (state.isCameraActive && autoDetectEnabled) {
            captureAndRecognize();
        }
    }, 3000);
}

function stopAutoDetect() {
    if (autoDetectInterval) {
        clearInterval(autoDetectInterval);
        autoDetectInterval = null;
    }
}

// -------------------- UTILITY FUNCTIONS --------------------
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function getTimeStamp() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getTodayStr() {
    return new Date().toDateString();
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getActivePet() {
    return state.pets.find(p => p.id === state.activePetId) || state.pets[0];
}

function getPetById(petId) {
    return state.pets.find(p => p.id === petId);
}

function getPetImage(pet) {
    if (pet.profileImage) return pet.profileImage;
    if (pet.type && pet.type.toLowerCase() === 'cat') {
        return 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=80&h=80&fit=crop&crop=center';
    }
    return 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=80&fit=crop&crop=center';
}

function isPet(className) {
    const lower = className.toLowerCase();
    for (const keyword of PET_KEYWORDS) {
        if (lower.includes(keyword)) return true;
    }
    for (const keyword of NON_PET_KEYWORDS) {
        if (lower.includes(keyword)) return false;
    }
    if (lower.includes('animal') || lower.includes('mammal')) return true;
    return false;
}

function findMatchingPet(className) {
    const lower = className.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;
    const words = lower.split(/[\s,;:()\-]+/);
    
    for (const pet of state.pets) {
        let score = 0;
        const petName = pet.name.toLowerCase();
        const petType = pet.type.toLowerCase();
        const petBreed = pet.breed.toLowerCase();
        const petColor = pet.traits?.color?.toLowerCase() || '';
        const petMarkings = pet.traits?.markings?.toLowerCase() || '';
        
        if (lower.includes(petName)) score += 5;
        if (petBreed && lower.includes(petBreed)) score += 4;
        if (petBreed) {
            const breedWords = petBreed.split(' ');
            for (const word of breedWords) {
                if (word.length > 2 && lower.includes(word)) score += 2;
            }
        }
        if (lower.includes(petType)) score += 3;
        if (petColor && lower.includes(petColor)) score += 2;
        if (petMarkings && lower.includes(petMarkings)) score += 2;
        
        for (const word of words) {
            if (word.length > 2) {
                if (petName.includes(word) || word.includes(petName)) score += 3;
                if (petBreed && (petBreed.includes(word) || word.includes(petBreed))) score += 2;
                if (petType.includes(word) || word.includes(petType)) score += 2;
                if (petColor && (petColor.includes(word) || word.includes(petColor))) score += 1;
                if (petMarkings && (petMarkings.includes(word) || word.includes(petMarkings))) score += 1;
            }
        }
        
        if (petType === 'dog' && (lower.includes('puppy') || lower.includes('canine') || lower.includes('hound'))) {
            score += 1;
        }
        if (petType === 'cat' && (lower.includes('kitten') || lower.includes('feline'))) {
            score += 1;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = pet;
        }
    }
    
    return bestScore >= 2 ? bestMatch : null;
}

// -------------------- DOM REFS --------------------
function getDom() {
    return {
        sidebar: document.getElementById('sidebar'),
        navLinks: document.querySelectorAll('.sidebar-nav a'),
        pages: document.querySelectorAll('.page'),
        notifBadge: document.getElementById('notifBadge'),
        notifBell: document.getElementById('notificationBell'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        settingsDarkModeBtn: document.getElementById('settingsDarkModeBtn'),
        petNameWelcome: document.getElementById('petNameWelcome'),
        nextMealDisplay: document.getElementById('nextMealDisplay'),
        todayMealsCount: document.getElementById('todayMealsCount'),
        totalFeedings: document.getElementById('totalFeedings'),
        todayFeedings: document.getElementById('todayFeedings'),
        foodRemaining: document.getElementById('foodRemaining'),
        currentDate: document.getElementById('currentDate'),
        currentModeDisplay: document.getElementById('currentModeDisplay'),
        foodLevelDisplay: document.getElementById('foodLevelDisplay'),
        foodProgressFill: document.getElementById('foodProgressFill'),
        foodDecBtn: document.getElementById('foodDecBtn'),
        foodIncBtn: document.getElementById('foodIncBtn'),
        setFoodBtn: document.getElementById('setFoodBtn'),
        waterLevelDisplay: document.getElementById('waterLevelDisplay'),
        waterProgressFill: document.getElementById('waterProgressFill'),
        checkWaterBtn: document.getElementById('checkWaterBtn'),
        tdsValue: document.getElementById('tdsValue'),
        tdsStatus: document.getElementById('tdsStatus'),
        checkTdsBtn: document.getElementById('checkTdsBtn'),
        modeBtns: document.querySelectorAll('.mode-btn'),
        manualPanel: document.getElementById('manualPanel'),
        autoPanel: document.getElementById('autoPanel'),
        manualAmountDisplay: document.getElementById('manualAmountDisplay'),
        amountDecBtn: document.getElementById('amountDecBtn'),
        amountIncBtn: document.getElementById('amountIncBtn'),
        feedNowBtn: document.getElementById('feedNowBtn'),
        quickFeedBtn: document.getElementById('quickFeedBtn'),
        quickAutoBtn: document.getElementById('quickAutoBtn'),
        quickRecogBtn: document.getElementById('quickRecogBtn'),
        quickScheduleBtn: document.getElementById('quickScheduleBtn'),
        recogPetName: document.getElementById('recogPetName'),
        recogConfidence: document.getElementById('recogConfidence'),
        recogAuthBadge: document.getElementById('recogAuthBadge'),
        recogTime: document.getElementById('recogTime'),
        petAvatarImg: document.getElementById('petAvatarImg'),
        miniActivityList: document.getElementById('miniActivityList'),
        mealModal: document.getElementById('mealModal'),
        mealModalTitle: document.getElementById('mealModalTitle'),
        mealForm: document.getElementById('mealForm'),
        mealTime: document.getElementById('mealTime'),
        mealAmount: document.getElementById('mealAmount'),
        dayCbs: document.querySelectorAll('.day-cb'),
        modalClose: document.querySelector('.modal-close'),
        confirmModal: document.getElementById('confirmModal'),
        confirmMessage: document.getElementById('confirmMessage'),
        confirmCancelBtn: document.getElementById('confirmCancelBtn'),
        confirmFeedBtn: document.getElementById('confirmFeedBtn'),
        petProfileCard: document.getElementById('petProfileCard'),
        waterMonitoringPanel: document.getElementById('waterMonitoringPanel'),
        mealSchedulePanel: document.getElementById('mealSchedulePanel'),
        notificationPanel: document.getElementById('notificationPanel'),
        historyPanel: document.getElementById('historyPanel'),
        resetDemoBtn: document.getElementById('resetDemoBtn'),
        feedPageDecBtn: document.getElementById('feedPageDecBtn'),
        feedPageIncBtn: document.getElementById('feedPageIncBtn'),
        feedPageAmount: document.getElementById('feedPageAmount'),
        feedPageFeedBtn: document.getElementById('feedPageFeedBtn'),
        gotoScheduleBtn: document.getElementById('gotoScheduleBtn'),
        addPetBtn: document.getElementById('addPetBtn'),
        addCatBtn: document.getElementById('addCatBtn'),
        addDogBtn: document.getElementById('addDogBtn'),
        uploadImageBtn: document.getElementById('uploadImageBtn'),
        startCameraBtn: document.getElementById('startCameraBtn'),
        stopCameraBtn: document.getElementById('stopCameraBtn'),
        captureRecognitionBtn: document.getElementById('captureRecognitionBtn'),
        videoFeed: document.getElementById('videoFeed'),
        cameraPlaceholder: document.getElementById('cameraPlaceholder'),
        cameraCanvas: document.getElementById('cameraCanvas'),
        recognitionResult: document.getElementById('recognitionResult'),
        uploadedImageDisplay: document.getElementById('uploadedImageDisplay'),
        userProfileBtn: document.getElementById('userProfileBtn'),
        headerUserName: document.getElementById('headerUserName'),
        headerUserAvatar: document.getElementById('headerUserAvatar'),
        userAvatarImg: document.getElementById('userAvatarImg'),
        displayUserName: document.getElementById('displayUserName'),
        displayUserEmail: document.getElementById('displayUserEmail'),
        uploadAvatarBtn: document.getElementById('uploadAvatarBtn'),
        hiddenAvatarInput: document.getElementById('hiddenAvatarInput'),
        saveUserProfileBtn: document.getElementById('saveUserProfileBtn'),
        cancelUserProfileBtn: document.getElementById('cancelUserProfileBtn'),
        userFirstName: document.getElementById('userFirstName'),
        userLastName: document.getElementById('userLastName'),
        userEmail: document.getElementById('userEmail'),
        userPhone: document.getElementById('userPhone'),
        userAddress: document.getElementById('userAddress'),
        userCity: document.getElementById('userCity'),
        userProvince: document.getElementById('userProvince'),
        userPostal: document.getElementById('userPostal'),
        userCountry: document.getElementById('userCountry'),
        userPetPreference: document.getElementById('userPetPreference'),
        userExperience: document.getElementById('userExperience'),
        supportEmailBtn: document.getElementById('supportEmailBtn'),
        supportCallBtn: document.getElementById('supportCallBtn'),
        supportChatBtn: document.getElementById('supportChatBtn'),
        authOverlay: document.getElementById('authOverlay'),
        mainHeader: document.getElementById('mainHeader'),
        logoutBtn: document.getElementById('logoutBtn'),
        autoDetectToggle: document.getElementById('autoDetectToggle'),
    };
}

let dom = {};

// -------------------- LOCAL STORAGE --------------------
function saveState() {
    try {
        localStorage.setItem('petFeederState', JSON.stringify(state));
    } catch (e) { console.warn('Save error:', e); }
}

function loadState() {
    try {
        const raw = localStorage.getItem('petFeederState');
        if (!raw) return false;
        const data = JSON.parse(raw);
        Object.assign(state, data);
        return true;
    } catch (e) { console.warn('Load error:', e); return false; }
}

// ==================== USER PROFILE FUNCTIONS ====================

function loadUserProfile() {
    try {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(userProfile, parsed);
        }
    } catch (e) {
        console.warn('Error loading user profile:', e);
    }
}

function saveUserProfile() {
    try {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (e) {
        console.warn('Error saving user profile:', e);
    }
}

function updateUserProfileUI() {
    if (dom.headerUserName) {
        const fullName = userProfile.firstName + ' ' + userProfile.lastName;
        dom.headerUserName.textContent = fullName || 'Pet Owner';
    }
    if (dom.headerUserAvatar) {
        if (userProfile.avatar) {
            dom.headerUserAvatar.src = userProfile.avatar;
        } else {
            const name = userProfile.firstName + '+' + userProfile.lastName;
            dom.headerUserAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2d7d46&color=fff&size=40`;
        }
    }
    if (dom.displayUserName) {
        dom.displayUserName.textContent = userProfile.firstName + ' ' + userProfile.lastName;
    }
    if (dom.displayUserEmail) {
        dom.displayUserEmail.textContent = userProfile.email || 'No email set';
    }
    if (dom.userAvatarImg) {
        if (userProfile.avatar) {
            dom.userAvatarImg.src = userProfile.avatar;
        } else {
            const name = userProfile.firstName + '+' + userProfile.lastName;
            dom.userAvatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2d7d46&color=fff&size=120`;
        }
    }
    if (dom.userFirstName) dom.userFirstName.value = userProfile.firstName || '';
    if (dom.userLastName) dom.userLastName.value = userProfile.lastName || '';
    if (dom.userEmail) dom.userEmail.value = userProfile.email || '';
    if (dom.userPhone) dom.userPhone.value = userProfile.phone || '';
    if (dom.userAddress) dom.userAddress.value = userProfile.address || '';
    if (dom.userCity) dom.userCity.value = userProfile.city || '';
    if (dom.userProvince) dom.userProvince.value = userProfile.province || 'Western Cape';
    if (dom.userPostal) dom.userPostal.value = userProfile.postalCode || '';
    if (dom.userCountry) dom.userCountry.value = userProfile.country || 'South Africa';
    if (dom.userPetPreference) dom.userPetPreference.value = userProfile.petPreference || 'both';
    if (dom.userExperience) dom.userExperience.value = userProfile.experience || 'intermediate';
}

function saveUserProfileForm() {
    userProfile.firstName = dom.userFirstName.value.trim() || 'John';
    userProfile.lastName = dom.userLastName.value.trim() || 'Doe';
    userProfile.email = dom.userEmail.value.trim() || '';
    userProfile.phone = dom.userPhone.value.trim() || '';
    userProfile.address = dom.userAddress.value.trim() || '';
    userProfile.city = dom.userCity.value.trim() || '';
    userProfile.province = dom.userProvince.value || 'Western Cape';
    userProfile.postalCode = dom.userPostal.value.trim() || '';
    userProfile.country = dom.userCountry.value || 'South Africa';
    userProfile.petPreference = dom.userPetPreference.value || 'both';
    userProfile.experience = dom.userExperience.value || 'intermediate';
    saveUserProfile();
    updateUserProfileUI();
    addActivity('User profile updated', 'fa-user-edit', '#1565c0');
    addNotification('Profile saved successfully!', 'success');
}

function uploadUserAvatar() {
    if (dom.hiddenAvatarInput) {
        dom.hiddenAvatarInput.click();
        dom.hiddenAvatarInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    userProfile.avatar = event.target.result;
                    saveUserProfile();
                    updateUserProfileUI();
                    addActivity('Profile photo updated', 'fa-camera', '#2d7d46');
                    addNotification('Profile photo updated!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
    }
}

function resetUserProfileForm() {
    loadUserProfile();
    updateUserProfileUI();
    addNotification('Profile reset to saved values', 'info');
}

// -------------------- DARK MODE --------------------
function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    applyDarkMode();
    saveState();
}

function applyDarkMode() {
    const body = document.body;
    const icon = dom.darkModeToggle?.querySelector('i');
    const icon2 = dom.settingsDarkModeBtn?.querySelector('i');
    if (state.darkMode) {
        body.classList.add('dark-mode');
        if (icon) icon.className = 'fas fa-sun';
        if (icon2) icon2.className = 'fas fa-sun';
    } else {
        body.classList.remove('dark-mode');
        if (icon) icon.className = 'fas fa-moon';
        if (icon2) icon2.className = 'fas fa-moon';
    }
}

// -------------------- NOTIFICATIONS --------------------
function addNotification(message, type = 'info') {
    const notif = {
        id: generateId(),
        message: message,
        type: type,
        timestamp: getTimeStamp(),
        read: false
    };
    state.notifications.unshift(notif);
    updateNotificationBadge();
    saveState();
}

function updateNotificationBadge() {
    const unread = state.notifications.filter(n => !n.read).length;
    if (dom.notifBadge) {
        dom.notifBadge.textContent = unread;
        dom.notifBadge.style.display = unread > 0 ? 'block' : 'none';
    }
}

function addActivity(message, icon = 'fa-info-circle', color = '#64748b') {
    state.activityLog.unshift({ id: generateId(), message, icon, color, timestamp: getTimeStamp() });
    renderMiniActivity();
    saveState();
}

// -------------------- RENDER FUNCTIONS --------------------
function renderMiniActivity() {
    const list = dom.miniActivityList;
    if (!list) return;
    list.innerHTML = '';
    const recent = state.activityLog.slice(0, 5);
    if (recent.length === 0) {
        list.innerHTML = '<li><i class="fas fa-check-circle" style="color:#2d7d46;"></i> System ready</li>';
        return;
    }
    recent.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas ${item.icon}" style="color:${item.color};"></i> ${item.message}`;
        list.appendChild(li);
    });
}

function renderNotificationPanel() {
    const panel = dom.notificationPanel;
    if (!panel) return;
    panel.innerHTML = '';
    if (state.notifications.length === 0) {
        panel.innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:#94a3b8;">
                <i class="fas fa-bell-slash" style="font-size:48px; display:block; margin-bottom:16px; opacity:0.5;"></i>
                <p style="font-size:1.1rem; font-weight:500;">No notifications</p>
                <p style="font-size:0.85rem; margin-top:4px;">You're all caught up!</p>
            </div>
        `;
        return;
    }
    const unreadCount = state.notifications.filter(n => !n.read).length;
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#e6edf3' : '#1a2332';
    const textSecondary = isDark ? '#8b949e' : '#64748b';
    const borderColor = isDark ? '#30363d' : '#e1e4e8';
    const bgColor = isDark ? '#0d1117' : '#ffffff';
    const unreadBg = isDark ? '#1c2333' : '#f8f9fa';
    
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid ${borderColor};
    `;
    const headerLeft = document.createElement('div');
    headerLeft.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    headerLeft.innerHTML = `
        <span style="font-size:1.1rem; font-weight:700; color:${textColor};">Notifications</span>
        ${unreadCount > 0 ? `<span style="background:#dc3545; color:white; padding:2px 14px; border-radius:20px; font-size:0.7rem; font-weight:700;">${unreadCount} new</span>` : ''}
    `;
    const markAllBtn = document.createElement('button');
    markAllBtn.className = 'action-btn';
    markAllBtn.style.cssText = 'font-size:0.8rem; padding:6px 18px; cursor:pointer; color:' + textColor + '; background:' + (isDark ? '#21262d' : '#f5f7fa') + '; border:1px solid ' + borderColor + '; border-radius:6px;';
    markAllBtn.innerHTML = '<i class="fas fa-check-double"></i> Mark All Read';
    markAllBtn.addEventListener('click', () => {
        state.notifications.forEach(n => n.read = true);
        updateNotificationBadge();
        renderNotificationPanel();
        saveState();
    });
    header.appendChild(headerLeft);
    header.appendChild(markAllBtn);
    panel.appendChild(header);
    
    const grouped = {};
    state.notifications.forEach(n => {
        const date = n.timestamp.split(' ')[0] || 'Today';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(n);
    });
    const sortedDates = Object.keys(grouped);
    sortedDates.forEach(date => {
        const isToday = date === 'Today';
        const dateGroup = document.createElement('div');
        dateGroup.style.cssText = 'margin-bottom:16px;';
        const dateHeader = document.createElement('div');
        dateHeader.style.cssText = `
            font-size:0.7rem; 
            font-weight:600; 
            text-transform:uppercase; 
            color:#94a3b8; 
            letter-spacing:0.5px; 
            margin-bottom:8px; 
            padding:0 4px;
        `;
        dateHeader.textContent = isToday ? 'Today' : date;
        dateGroup.appendChild(dateHeader);
        const notifList = document.createElement('div');
        notifList.style.cssText = 'display:flex; flex-direction:column; gap:6px;';
        grouped[date].forEach(n => {
            const isUnread = !n.read;
            let icon, color, bgColor, borderColor, label;
            switch(n.type) {
                case 'success':
                    icon = 'fa-check-circle';
                    color = '#2d7d46';
                    bgColor = isDark ? '#1a3a2a' : '#e8f5e9';
                    borderColor = '#2d7d46';
                    label = 'Success';
                    break;
                case 'warning':
                    icon = 'fa-exclamation-triangle';
                    color = '#e65100';
                    bgColor = isDark ? '#3a2a1a' : '#fff3e0';
                    borderColor = '#e65100';
                    label = 'Warning';
                    break;
                case 'danger':
                    icon = 'fa-times-circle';
                    color = '#c62828';
                    bgColor = isDark ? '#3a1a1a' : '#fce4ec';
                    borderColor = '#c62828';
                    label = 'Error';
                    break;
                case 'info':
                default:
                    icon = 'fa-info-circle';
                    color = '#1565c0';
                    bgColor = isDark ? '#1a2a3a' : '#e3f2fd';
                    borderColor = '#1565c0';
                    label = 'Info';
                    break;
            }
            const notifItem = document.createElement('div');
            notifItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 12px 18px;
                background: ${isUnread ? unreadBg : 'transparent'};
                border-radius: 10px;
                border-left: 4px solid ${isUnread ? borderColor : 'transparent'};
                transition: background 0.2s;
            `;
            const iconCircle = document.createElement('div');
            iconCircle.style.cssText = `
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: ${bgColor};
                color: ${color};
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 16px;
            `;
            iconCircle.innerHTML = `<i class="fas ${icon}"></i>`;
            notifItem.appendChild(iconCircle);
            const content = document.createElement('div');
            content.style.cssText = 'flex:1; min-width:0; display:flex; flex-direction:column; gap:2px;';
            const msg = document.createElement('div');
            msg.style.cssText = `font-size:0.9rem; color:${textColor}; word-wrap:break-word; line-height:1.4;`;
            msg.textContent = n.message;
            content.appendChild(msg);
            const meta = document.createElement('div');
            meta.style.cssText = `display:flex; align-items:center; gap:12px; font-size:0.65rem; color:${textSecondary};`;
            meta.innerHTML = `
                <span>${n.timestamp}</span>
                ${isUnread ? `<span style="background:#dc3545; color:white; padding:0 10px; border-radius:10px; font-size:0.55rem; font-weight:700;">NEW</span>` : ''}
                <span style="opacity:0.6;">•</span>
                <span style="opacity:0.7;">${label}</span>
            `;
            content.appendChild(meta);
            notifItem.appendChild(content);
            notifList.appendChild(notifItem);
        });
        dateGroup.appendChild(notifList);
        panel.appendChild(dateGroup);
    });
}

function renderHistoryPanel() {
    const panel = dom.historyPanel;
    if (!panel) return;
    if (state.feedingHistory.length === 0) {
        panel.innerHTML = '<p style="color:#94a3b8; padding:20px 0; text-align:center;">No feeding history yet.</p>';
        return;
    }
    const today = getTodayStr();
    const todayMeals = state.feedingHistory.filter(h => h.date === today);
    const totalToday = todayMeals.reduce((sum, h) => sum + h.amount, 0);
    const totalFeedings = state.feedingHistory.length;
    const totalAmount = state.feedingHistory.reduce((sum, h) => sum + h.amount, 0);
    const uniquePets = [...new Set(state.feedingHistory.map(h => h.pet))];
    let html = `
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom:20px;">
            <div style="background:#f8f9fa; padding:12px 16px; border-radius:8px;">
                <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Total Feedings</div>
                <div style="font-size:1.4rem; font-weight:700; color:#1a2332;">${totalFeedings}</div>
            </div>
            <div style="background:#f8f9fa; padding:12px 16px; border-radius:8px;">
                <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Total Food</div>
                <div style="font-size:1.4rem; font-weight:700; color:#1a2332;">${totalAmount.toFixed(1)} g</div>
            </div>
            <div style="background:#f8f9fa; padding:12px 16px; border-radius:8px;">
                <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Pets Fed</div>
                <div style="font-size:1.4rem; font-weight:700; color:#1a2332;">${uniquePets.length}</div>
            </div>
            <div style="background:#f8f9fa; padding:12px 16px; border-radius:8px;">
                <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase;">Today's Total</div>
                <div style="font-size:1.4rem; font-weight:700; color:#1a2332;">${totalToday.toFixed(1)} g</div>
            </div>
        </div>
        <div style="overflow-x:auto; border:1px solid #e1e4e8; border-radius:8px;">
            <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                <thead>
                    <tr style="background:#f8f9fa; border-bottom:2px solid #e1e4e8;">
                        <th style="text-align:left; padding:10px 12px; font-weight:600; color:#64748b; text-transform:uppercase; font-size:0.65rem; letter-spacing:0.5px;">Date</th>
                        <th style="text-align:left; padding:10px 12px; font-weight:600; color:#64748b; text-transform:uppercase; font-size:0.65rem; letter-spacing:0.5px;">Time</th>
                        <th style="text-align:left; padding:10px 12px; font-weight:600; color:#64748b; text-transform:uppercase; font-size:0.65rem; letter-spacing:0.5px;">Pet</th>
                        <th style="text-align:right; padding:10px 12px; font-weight:600; color:#64748b; text-transform:uppercase; font-size:0.65rem; letter-spacing:0.5px;">Amount</th>
                        <th style="text-align:center; padding:10px 12px; font-weight:600; color:#64748b; text-transform:uppercase; font-size:0.65rem; letter-spacing:0.5px;">Mode</th>
                    </tr>
                </thead>
                <tbody>`;
    state.feedingHistory.slice(0, 50).forEach((h, index) => {
        const isEven = index % 2 === 0;
        const modeColor = h.mode === 'Manual' ? '#e65100' : '#1565c0';
        const modeBg = h.mode === 'Manual' ? '#fff3e0' : '#e3f2fd';
        html += `
            <tr style="${isEven ? 'background:#ffffff;' : 'background:#fafbfc;'} border-bottom:1px solid #f0f4f8;">
                <td style="padding:8px 12px; color:#1a2332;">${h.date}</td>
                <td style="padding:8px 12px; color:#1a2332;">${h.time}</td>
                <td style="padding:8px 12px; font-weight:600; color:#1a2332;">${h.pet}</td>
                <td style="padding:8px 12px; text-align:right; font-weight:600; color:#1a2332;">${h.amount} g</td>
                <td style="padding:8px 12px; text-align:center;">
                    <span style="display:inline-block; padding:2px 12px; border-radius:12px; font-size:0.7rem; font-weight:600; background:${modeBg}; color:${modeColor};">
                        ${h.mode}
                    </span>
                </td>
            </tr>
        `;
    });
    html += `
                </tbody>
            </table>
        </div>
        <div style="margin-top:12px; font-size:0.75rem; color:#94a3b8; text-align:right;">
            Showing last ${Math.min(state.feedingHistory.length, 50)} of ${state.feedingHistory.length} records
        </div>
    `;
    panel.innerHTML = html;
    if (dom.todayMealsCount) dom.todayMealsCount.textContent = todayMeals.length;
    if (dom.todayFeedings) dom.todayFeedings.textContent = todayMeals.length;
    if (dom.totalFeedings) dom.totalFeedings.textContent = totalFeedings;
}

function renderMealSchedule() {
    const panel = dom.mealSchedulePanel;
    if (!panel) return;
    if (state.meals.length === 0) {
        panel.innerHTML = `<p style="color:#94a3b8; padding:12px 0;">No meals scheduled.</p>
            <button class="action-btn" id="addMealFromScheduleBtn"><i class="fas fa-plus"></i> Add Meal</button>`;
        document.getElementById('addMealFromScheduleBtn')?.addEventListener('click', () => openMealModal());
        return;
    }
    let html = `
        <div style="margin-bottom:12px; display:flex; gap:10px; flex-wrap:wrap;">
            <button class="action-btn" id="addMealFromScheduleBtn2"><i class="fas fa-plus"></i> Add Meal</button>
            <button class="action-btn" id="clearAllMealsBtn" style="color:#c62828;"><i class="fas fa-trash"></i> Clear All</button>
        </div>
        <div class="schedule-list">`;
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    state.meals.forEach((meal, idx) => {
        const days = meal.days.map(d => dayNames[d-1]).join(', ');
        const status = meal.skipped ? 'SKIPPED' : (meal.enabled ? 'Scheduled' : 'Disabled');
        const statusColor = meal.skipped ? '#fce4ec' : (meal.enabled ? '#e8f5e9' : '#fff3e0');
        const statusTextColor = meal.skipped ? '#c62828' : (meal.enabled ? '#2d7d46' : '#e65100');
        html += `
            <div class="schedule-item">
                <div>
                    <strong>${meal.time}</strong> — ${meal.amount} g
                    <span style="font-size:0.75rem; color:#64748b; margin-left:8px;">${days}</span>
                    <span style="font-size:0.65rem; margin-left:8px; background:${statusColor}; color:${statusTextColor}; padding:2px 10px; border-radius:20px; font-weight:600;">${status}</span>
                </div>
                <div class="actions">
                    <button class="skip-btn" data-idx="${idx}">${meal.skipped ? 'Un-skip' : 'Skip'}</button>
                    <button class="edit-btn" data-idx="${idx}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-idx="${idx}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    panel.innerHTML = html;
    document.querySelectorAll('.skip-btn').forEach(btn => {
        btn.addEventListener('click', function() { skipMeal(parseInt(this.dataset.idx)); });
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() { openMealModal(parseInt(this.dataset.idx)); });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Delete this meal?')) deleteMeal(parseInt(this.dataset.idx));
        });
    });
    document.getElementById('addMealFromScheduleBtn2')?.addEventListener('click', () => openMealModal());
    document.getElementById('clearAllMealsBtn')?.addEventListener('click', () => {
        if (confirm('Delete all meals?')) { state.meals = []; saveState(); renderMealSchedule(); addActivity('All meals cleared', 'fa-trash', '#c62828'); }
    });
    updateNextMeal();
}

function updateNextMeal() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const dayIndex = now.getDay() === 0 ? 7 : now.getDay();
    let next = null, nextTime = Infinity;
    state.meals.forEach(meal => {
        if (!meal.enabled || meal.skipped) return;
        const [h, m] = meal.time.split(':').map(Number);
        const mealMinutes = h * 60 + m;
        if (meal.days.includes(dayIndex) && mealMinutes > currentTime && mealMinutes < nextTime) {
            nextTime = mealMinutes; next = meal;
        }
        if (mealMinutes < currentTime || !meal.days.includes(dayIndex)) {
            for (let d = 1; d <= 7; d++) {
                const checkDay = (dayIndex + d - 1) % 7 + 1;
                if (meal.days.includes(checkDay)) {
                    const candidate = mealMinutes + d * 1440;
                    if (candidate < nextTime) { nextTime = candidate; next = meal; }
                    break;
                }
            }
        }
    });
    if (dom.nextMealDisplay) {
        dom.nextMealDisplay.textContent = next ? `${next.time} — ${next.amount} g` : 'No meals';
    }
}

function renderWaterMonitoring() {
    const panel = dom.waterMonitoringPanel;
    if (!panel) return;
    const quality = state.tds <= 300 ? '✓ Good' : state.tds <= 500 ? '⚠ Acceptable' : '✗ Poor';
    const qualityColor = state.tds <= 300 ? '#2d7d46' : state.tds <= 500 ? '#e65100' : '#c62828';
    panel.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; max-width:500px;">
            <div style="background:#f8f9fa; padding:16px; border-radius:8px;">
                <div style="font-size:0.75rem; color:#94a3b8;">Water Level</div>
                <div style="font-size:1.8rem; font-weight:700;">${Math.round(state.waterLevel)}%</div>
            </div>
            <div style="background:#f8f9fa; padding:16px; border-radius:8px;">
                <div style="font-size:0.75rem; color:#94a3b8;">TDS</div>
                <div style="font-size:1.8rem; font-weight:700;">${state.tds} ppm</div>
            </div>
            <div style="background:#f8f9fa; padding:16px; border-radius:8px;">
                <div style="font-size:0.75rem; color:#94a3b8;">Quality</div>
                <div style="font-size:1.4rem; font-weight:700; color:${qualityColor};">${quality}</div>
            </div>
            <div style="background:#f8f9fa; padding:16px; border-radius:8px;">
                <div style="font-size:0.75rem; color:#94a3b8;">Last checked</div>
                <div style="font-size:1.2rem; font-weight:600;">${getTimeStamp()}</div>
            </div>
        </div>
        <div style="margin-top:16px; display:flex; gap:12px; flex-wrap:wrap;">
            <button class="action-btn" id="waterCheckBtn2"><i class="fas fa-sync-alt"></i> Check Water</button>
            <button class="action-btn" id="tdsCheckBtn2"><i class="fas fa-vial"></i> Test Quality</button>
        </div>
    `;
    document.getElementById('waterCheckBtn2')?.addEventListener('click', checkWater);
    document.getElementById('tdsCheckBtn2')?.addEventListener('click', checkTDS);
}

// ==================== ENHANCED PET PROFILE UI ====================
function updatePetProfileUI() {
    const card = dom.petProfileCard;
    if (!card) return;
    const activePet = getActivePet();
    if (dom.petNameWelcome) dom.petNameWelcome.textContent = activePet.name;
    if (dom.recogPetName) dom.recogPetName.textContent = activePet.name;
    if (dom.petAvatarImg) dom.petAvatarImg.src = getPetImage(activePet);
    
    let traitsHtml = '';
    if (activePet.traits) {
        const traits = activePet.traits;
        if (traits.color) traitsHtml += `<span style="background:#f0f4f8; padding:2px 12px; border-radius:12px; font-size:0.75rem;">🎨 ${traits.color}</span>`;
        if (traits.markings) traitsHtml += `<span style="background:#f0f4f8; padding:2px 12px; border-radius:12px; font-size:0.75rem;">🔍 ${traits.markings}</span>`;
        if (traits.personality) traitsHtml += `<span style="background:#f0f4f8; padding:2px 12px; border-radius:12px; font-size:0.75rem;">💫 ${traits.personality}</span>`;
    }
    
    let html = `
        <div style="display:flex; flex-direction:column; gap:14px;">
            <div style="display:flex; gap:10px; flex-wrap:wrap; padding:6px 0; border-bottom:1px solid #e1e4e8;">`;
    state.pets.forEach(pet => {
        const isActive = pet.id === state.activePetId;
        const petIcon = pet.type && pet.type.toLowerCase() === 'cat' ? '🐱' : '🐕';
        html += `
            <button class="pet-tab" data-pet-id="${pet.id}" style="
                padding:6px 16px;
                border:2px solid ${isActive ? '#2d7d46' : '#e1e4e8'};
                border-radius:20px;
                background: ${isActive ? '#e8f5e9' : 'transparent'};
                color: ${isActive ? '#2d7d46' : '#64748b'};
                font-weight: ${isActive ? '600' : '400'};
                cursor:pointer;
                font-size:0.8rem;
                display:flex;
                align-items:center;
                gap:6px;
            ">
                ${petIcon} ${pet.name}
                ${pet.traits?.color ? `(${pet.traits.color})` : ''}
            </button>`;
    });
    html += `</div>
            <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap; padding:8px 0;">
                <div style="width:80px; height:80px; border-radius:50%; overflow:hidden; border:2px solid #e1e4e8;">
                    <img src="${getPetImage(activePet)}" alt="${activePet.name}" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div>
                    <h3 style="font-size:1.4rem; margin:0;">${activePet.name}</h3>
                    <p style="color:#64748b; font-size:0.85rem;">${activePet.type} · ${activePet.breed} · ${activePet.age} years · ${activePet.weight} kg</p>
                    <p style="color:#64748b; font-size:0.85rem;">Daily: ${activePet.dailyTarget}g · Meal: ${activePet.mealAmount}g</p>
                    ${traitsHtml ? `<div style="margin:6px 0; display:flex; gap:6px; flex-wrap:wrap;">${traitsHtml}</div>` : ''}
                    <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="action-btn" id="editPetBtn"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn" id="uploadPhotoBtn"><i class="fas fa-camera"></i> Photo</button>
                        <button class="action-btn" id="addTraitsBtn"><i class="fas fa-tag"></i> Add Traits</button>
                        ${state.pets.length > 1 ? `<button class="action-btn" id="deletePetBtn" style="color:#c62828;"><i class="fas fa-trash"></i> Remove</button>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    card.innerHTML = html;
    
    document.querySelectorAll('.pet-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            state.activePetId = this.dataset.petId;
            saveState();
            updatePetProfileUI();
            updateRecognitionUI();
            addActivity(`Switched to ${getActivePet().name}`, 'fa-exchange-alt', '#64748b');
        });
    });
    document.getElementById('editPetBtn')?.addEventListener('click', () => openPetProfileEditor());
    document.getElementById('uploadPhotoBtn')?.addEventListener('click', uploadPetPhoto);
    document.getElementById('addTraitsBtn')?.addEventListener('click', () => addPetTraits());
    document.getElementById('deletePetBtn')?.addEventListener('click', () => {
        if (state.pets.length <= 1) { alert('Must have at least one pet.'); return; }
        if (confirm(`Remove ${getActivePet().name}?`)) {
            const petId = getActivePet().id;
            state.pets = state.pets.filter(p => p.id !== petId);
            state.activePetId = state.pets[0].id;
            saveState();
            updatePetProfileUI();
            updateRecognitionUI();
            addActivity(`Removed pet`, 'fa-trash', '#c62828');
        }
    });
}

function addPetTraits() {
    const pet = getActivePet();
    if (!pet) return;
    const color = prompt('Coat color (e.g., Brown, Black, White, Golden):', pet.traits?.color || '');
    if (color === null) return;
    const markings = prompt('Distinctive markings (e.g., Spot on forehead, White paws, Tabby stripes):', pet.traits?.markings || '');
    if (markings === null) return;
    const personality = prompt('Personality trait (e.g., Playful, Calm, Energetic, Shy):', pet.traits?.personality || '');
    if (personality === null) return;
    if (!pet.traits) pet.traits = {};
    if (color) pet.traits.color = color;
    if (markings) pet.traits.markings = markings;
    if (personality) pet.traits.personality = personality;
    saveState();
    updatePetProfileUI();
    addActivity(`Added traits to ${pet.name}`, 'fa-tag', '#8b5cf6');
    addNotification(`Traits updated for ${pet.name}`, 'success');
}

function updateRecognitionUI() {
    const recog = state.currentRecognition;
    const pet = recog.petId ? getPetById(recog.petId) : null;
    if (dom.recogPetName) dom.recogPetName.textContent = recog.petName || 'Unknown';
    if (dom.recogConfidence) dom.recogConfidence.textContent = (recog.confidence * 100).toFixed(1) + '%';
    if (dom.recogTime) dom.recogTime.textContent = recog.lastDetected || '—';
    if (dom.recogAuthBadge) {
        if (recog.authorized) {
            dom.recogAuthBadge.innerHTML = '✓ Authorized';
            dom.recogAuthBadge.className = 'pet-status authorized';
        } else {
            dom.recogAuthBadge.innerHTML = '✗ Unknown';
            dom.recogAuthBadge.className = 'pet-status unknown';
        }
    }
    if (dom.petAvatarImg && pet) dom.petAvatarImg.src = getPetImage(pet);
}

function updateFoodUI() {
    const level = Math.round(state.foodLevel);
    if (dom.foodLevelDisplay) dom.foodLevelDisplay.textContent = level + '%';
    if (dom.foodProgressFill) dom.foodProgressFill.style.width = level + '%';
    if (dom.foodRemaining) dom.foodRemaining.textContent = level + '%';
    updateFoodStatus();
}

function updateFoodStatus() {
    const level = state.foodLevel;
    if (dom.foodProgressFill) {
        dom.foodProgressFill.style.background = level < 20 ? '#c62828' : level < 40 ? '#e65100' : '#2d7d46';
    }
}

function updateWaterUI() {
    const level = Math.round(state.waterLevel);
    if (dom.waterLevelDisplay) dom.waterLevelDisplay.textContent = level + '%';
    if (dom.waterProgressFill) dom.waterProgressFill.style.width = level + '%';
}

function updateTDSUI() {
    const tds = state.tds;
    if (dom.tdsValue) dom.tdsValue.textContent = tds + ' ppm';
    let statusText, className;
    if (tds <= 300) { statusText = '✓ Good'; className = 'good'; }
    else if (tds <= 500) { statusText = '⚠ Acceptable'; className = 'acceptable'; }
    else { statusText = '✗ Poor'; className = 'poor'; }
    if (dom.tdsStatus) dom.tdsStatus.innerHTML = `<span class="badge ${className}">${statusText}</span>`;
}

// ==================== ENHANCED CAMERA RECOGNITION ====================
async function loadModel() {
    try {
        const resultDiv = dom.recognitionResult;
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>
                    <p>Loading AI model...</p>
                </div>
            `;
        }
        mobilenetModel = await mobilenet.load();
        state.isModelLoaded = true;
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="text-align:center; padding:20px; color:#2d7d46;">
                    <i class="fas fa-check-circle" style="font-size:28px;"></i>
                    <p>AI model ready!</p>
                    <p style="font-size:0.75rem; color:#94a3b8;">Upload image or start camera</p>
                </div>
            `;
        }
        console.log('MobileNet model loaded');
    } catch (error) {
        console.error('Error loading model:', error);
        const resultDiv = dom.recognitionResult;
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="text-align:center; padding:20px; color:#c62828;">
                    <i class="fas fa-times-circle" style="font-size:28px;"></i>
                    <p>Failed to load AI model</p>
                </div>
            `;
        }
    }
}

async function startCamera() {
    try {
        if (cameraStream) stopCamera();
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: 640, height: 480 }
        });
        const video = dom.videoFeed;
        const placeholder = dom.cameraPlaceholder;
        const uploadedImg = dom.uploadedImageDisplay;
        if (video) {
            video.srcObject = cameraStream;
            video.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (uploadedImg) uploadedImg.style.display = 'none';
        state.isCameraActive = true;
        addActivity('Camera started', 'fa-video', '#2d7d46');
    } catch (error) {
        console.error('Error starting camera:', error);
        alert('Unable to access camera. Please grant permission.');
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    const video = dom.videoFeed;
    const placeholder = dom.cameraPlaceholder;
    if (video) video.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
    state.isCameraActive = false;
    addActivity('Camera stopped', 'fa-video-slash', '#c62828');
}

function uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = dom.uploadedImageDisplay;
                const video = dom.videoFeed;
                const placeholder = dom.cameraPlaceholder;
                if (img) {
                    img.src = event.target.result;
                    img.style.display = 'block';
                }
                if (video) video.style.display = 'none';
                if (placeholder) placeholder.style.display = 'none';
                setTimeout(() => captureAndRecognize(), 500);
                addActivity('Image uploaded', 'fa-upload', '#6a1b9a');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

// ==================== ENHANCED CAPTURE AND RECOGNIZE ====================
async function captureAndRecognize() {
    const resultDiv = dom.recognitionResult;
    if (!resultDiv) return;
    if (!state.isModelLoaded) {
        resultDiv.innerHTML = `
            <div style="text-align:center; padding:20px; color:#e65100;">
                <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>
                <p>Loading AI model...</p>
            </div>
        `;
        return;
    }
    try {
        resultDiv.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <i class="fas fa-spinner fa-spin" style="font-size:28px;"></i>
                <p>Analyzing image...</p>
            </div>
        `;
        const video = dom.videoFeed;
        const uploadedImg = dom.uploadedImageDisplay;
        const canvas = dom.cameraCanvas;
        const ctx = canvas.getContext('2d');
        let imageSource = null;
        if (uploadedImg && uploadedImg.style.display !== 'none' && uploadedImg.src) {
            imageSource = uploadedImg;
        } else if (video && video.style.display !== 'none' && video.readyState >= 2) {
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 240;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            imageSource = canvas;
        } else {
            resultDiv.innerHTML = `
                <div style="text-align:center; padding:20px; color:#e65100;">
                    <i class="fas fa-exclamation-triangle" style="font-size:28px;"></i>
                    <p>No image available</p>
                    <p style="font-size:0.75rem;">Upload an image or start the camera</p>
                </div>
            `;
            return;
        }
     const img = new Image();
        img.crossOrigin = "anonymous"; // <--- ADD THIS EXACT LINE
        if (imageSource === canvas) {
            img.src = canvas.toDataURL('image/jpeg');
        } else {
            img.src = imageSource.src;
        }
        await new Promise((resolve) => { img.onload = resolve; });
        const predictions = await mobilenetModel.classify(img);
        const topPrediction = predictions[0];
        const className = topPrediction.className;
        const confidence = topPrediction.probability;
        console.log('Top Prediction:', className, confidence);
        console.log('Top 5 Predictions:', predictions.slice(0, 5).map(p => `${p.className}: ${(p.probability*100).toFixed(1)}%`));
        // MINIMUM CONFIDENCE THRESHOLD FOR FEEDING - 50%
        const MIN_CONFIDENCE_THRESHOLD = 0.50;
        
        let isPetDetected = false;
        let bestPetMatch = null;
        let bestPetConfidence = 0;
        
        for (const pred of predictions) {
            if (isPet(pred.className)) {
                isPetDetected = true;
                const matchedPet = findMatchingPet(pred.className);
                if (matchedPet && pred.probability > bestPetConfidence) {
                    bestPetConfidence = pred.probability;
                    bestPetMatch = matchedPet;
                }
            }
        }
        const topMatch = findMatchingPet(className);
        if (topMatch && topPrediction.probability > bestPetConfidence) {
            bestPetConfidence = topPrediction.probability;
            bestPetMatch = topMatch;
            isPetDetected = true;
        }
        
        // Check if confidence is above threshold for feeding
        const isConfidentEnough = bestPetConfidence >= MIN_CONFIDENCE_THRESHOLD;
        
        if (bestPetMatch && isConfidentEnough && isPetDetected) {
            const pet = bestPetMatch;
            state.currentRecognition = {
                petId: pet.id,
                petName: pet.name,
                confidence: bestPetConfidence,
                authorized: true,
                lastDetected: getTimeStamp()
            };
            if (pet.recognitionData) {
                pet.recognitionData.confidence = bestPetConfidence;
                pet.recognitionData.lastDetected = getTimeStamp();
            }
            const detectedType = isPet(className) ? className : predictions.find(p => isPet(p.className))?.className || 'Unknown Pet Type';
            resultDiv.innerHTML = `
                <div class="recognition-detected">
                    <span class="pet-icon">${pet.type && pet.type.toLowerCase() === 'cat' ? '🐱' : '🐕'}</span>
                    <div class="pet-name">${pet.name}</div>
                    <div class="confidence">Confidence: ${(bestPetConfidence * 100).toFixed(1)}%</div>
                    <div class="status-badge authorized">✓ Authorized</div>
                    <div style="margin-top:8px; font-size:0.8rem; color:#64748b;">
                        ${pet.type} · ${pet.breed}
                        ${pet.traits?.color ? `· ${pet.traits.color}` : ''}
                    </div>
                    <div style="margin-top:4px; font-size:0.7rem; color:#94a3b8;">
                        Detected as: ${detectedType}
                    </div>
                    <div style="margin-top:4px; font-size:0.7rem; color:#94a3b8;">
                        ${pet.age} years · ${pet.weight} kg
                    </div>
                    <div style="margin-top:8px; padding:4px 12px; border-radius:20px; background:#e8f5e9; color:#2d7d46; display:inline-block; font-size:0.75rem; font-weight:600;">
                        ✅ Confidence: ${(bestPetConfidence * 100).toFixed(1)}% (Above 50% threshold)
                    </div>
                </div>
            `;
            updateRecognitionUI();
            addActivity(`${pet.name} recognized via camera (${(bestPetConfidence*100).toFixed(1)}%)`, 'fa-camera', '#2d7d46');
            addNotification(`${pet.name} detected — Authorized (${(bestPetConfidence*100).toFixed(1)}%)`, 'success');
            
            // ONLY DISPENSE FOOD IF CONFIDENCE IS 50% OR HIGHER
            if (state.feedingMode === 'automatic' && bestPetConfidence >= MIN_CONFIDENCE_THRESHOLD) {
                const mealAmt = pet.mealAmount || 30;
                feedPet(mealAmt, 'automatic');
                addNotification(`Food dispensed: ${mealAmt}g for ${pet.name} (${(bestPetConfidence*100).toFixed(1)}% confidence)`, 'success');
            }
        } else if (bestPetMatch && !isConfidentEnough && isPetDetected) {
            // Pet detected but confidence is too low
            state.currentRecognition = {
                petId: null,
                petName: "Low Confidence",
                confidence: bestPetConfidence,
                authorized: false,
                lastDetected: getTimeStamp()
            };
            resultDiv.innerHTML = `
                <div class="recognition-detected">
                    <span class="pet-icon">⚠️</span>
                    <div class="pet-name">Low Confidence Detection</div>
                    <div class="confidence">Confidence: ${(bestPetConfidence * 100).toFixed(1)}%</div>
                    <div class="status-badge unknown">✗ Below 50% Threshold</div>
                    <div style="margin-top:8px; font-size:0.8rem; color:#64748b;">
                        Detected as: ${className}
                    </div>
                    <div style="margin-top:8px; padding:4px 12px; border-radius:20px; background:#fff3e0; color:#e65100; display:inline-block; font-size:0.75rem; font-weight:600;">
                        ⚠️ Confidence below 50% - Food NOT dispensed
                    </div>
                    <div style="margin-top:4px; font-size:0.7rem; color:#94a3b8;">
                        Please ensure clear lighting and a clear view of your pet
                    </div>
                </div>
            `;
            updateRecognitionUI();
            addActivity(`Low confidence detection (${(bestPetConfidence*100).toFixed(1)}%) — Food NOT dispensed`, 'fa-exclamation-triangle', '#e65100');
            addNotification(`Low confidence detection (${(bestPetConfidence*100).toFixed(1)}%) — Food NOT dispensed`, 'warning');
        } else if (isPetDetected) {
            const conf = Math.max(bestPetConfidence, 0.3);
            const detectedType = predictions.find(p => isPet(p.className))?.className || className;
            state.currentRecognition = {
                petId: null,
                petName: "Unknown Pet",
                confidence: conf,
                authorized: false,
                lastDetected: getTimeStamp()
            };
            resultDiv.innerHTML = `
                <div class="recognition-detected">
                    <span class="pet-icon">🐾</span>
                    <div class="pet-name">Unknown Pet</div>
                    <div class="confidence">Confidence: ${(conf * 100).toFixed(1)}%</div>
                    <div class="status-badge unknown">✗ Not Authorized</div>
                    <div style="margin-top:8px; font-size:0.8rem; color:#64748b;">
                        Detected as: ${detectedType}
                    </div>
                    <div style="margin-top:4px; font-size:0.7rem; color:#94a3b8;">
                        This pet is not registered in your profile
                    </div>
                    <div style="margin-top:8px; padding:4px 12px; border-radius:20px; background:#fce4ec; color:#c62828; display:inline-block; font-size:0.75rem; font-weight:600;">
                        🚫 Food NOT dispensed
                    </div>
                </div>
            `;
            updateRecognitionUI();
            addActivity(`Unknown pet detected via camera (${(conf*100).toFixed(1)}%) — NOT dispensed`, 'fa-exclamation-triangle', '#e65100');
            addNotification(`Unknown pet detected — Food NOT dispensed`, 'warning');
        } else {
            const conf = Math.max(confidence, 0.3);
            state.currentRecognition = {
                petId: null,
                petName: "Unknown Entity",
                confidence: conf,
                authorized: false,
                lastDetected: getTimeStamp()
            };
            resultDiv.innerHTML = `
                <div class="recognition-detected">
                    <span class="pet-icon">❓</span>
                    <div class="pet-name">Unknown Entity</div>
                    <div class="confidence">Confidence: ${(conf * 100).toFixed(1)}%</div>
                    <div class="status-badge unknown">✗ Not a Pet</div>
                    <div style="margin-top:8px; font-size:0.8rem; color:#64748b;">
                        Detected as: ${className}
                    </div>
                    <div style="margin-top:4px; font-size:0.7rem; color:#94a3b8;">
                        Please show a clear image of your pet
                    </div>
                    <div style="margin-top:8px; padding:4px 12px; border-radius:20px; background:#fce4ec; color:#c62828; display:inline-block; font-size:0.75rem; font-weight:600;">
                        🚫 Food NOT dispensed
                    </div>
                </div>
            `;
            updateRecognitionUI();
            addActivity(`Unknown entity detected — NOT a pet (${(conf*100).toFixed(1)}%)`, 'fa-times-circle', '#c62828');
            addNotification(`Non-pet entity detected — Food NOT dispensed`, 'danger');
        }
        saveState();
    } catch (error) {
        console.error('Recognition error:', error);
        resultDiv.innerHTML = `
            <div style="text-align:center; padding:20px; color:#c62828;">
                <i class="fas fa-times-circle" style="font-size:28px;"></i>
                <p>Recognition failed</p>
                <p style="font-size:0.75rem;">${error.message}</p>
            </div>
        `;
    }
}

// -------------------- PET FUNCTIONS --------------------
function openPetProfileEditor() {
    const p = getActivePet();
    const name = prompt('Pet Name:', p.name);
    if (name === null) return;
    const type = prompt('Pet Type:', p.type) || 'Pet';
    const breed = prompt('Breed:', p.breed) || '';
    const age = parseInt(prompt('Age:', p.age)) || 0;
    const weight = parseFloat(prompt('Weight (kg):', p.weight)) || 0;
    const daily = parseInt(prompt('Daily Target (g):', p.dailyTarget)) || 180;
    const meal = parseInt(prompt('Meal Amount (g):', p.mealAmount)) || 30;
    p.name = name; p.type = type; p.breed = breed; p.age = age; p.weight = weight; p.dailyTarget = daily; p.mealAmount = meal;
    saveState(); updatePetProfileUI(); addActivity(`Updated ${p.name}`, 'fa-edit', '#1565c0');
}

function uploadPetPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                getActivePet().profileImage = event.target.result;
                saveState();
                updatePetProfileUI();
                addActivity('Photo uploaded', 'fa-camera', '#2d7d46');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function addNewPet(type) {
    const isCat = type === 'cat';
    const defaultName = isCat ? 'New Cat' : 'New Dog';
    const name = prompt('Pet name:', defaultName);
    if (!name) return;
    const petType = prompt('Pet type (Dog, Cat, etc.):', isCat ? 'Cat' : 'Dog') || 'Pet';
    const breed = prompt('Breed:', isCat ? 'Persian' : 'Labrador') || '';
    const age = parseInt(prompt('Age (years):', '2')) || 0;
    const weight = parseFloat(prompt('Weight (kg):', isCat ? '4.5' : '25')) || 0;
    const dailyTarget = parseInt(prompt('Daily food target (g):', isCat ? '120' : '180')) || 180;
    const mealAmount = parseInt(prompt('Meal amount per feeding (g):', isCat ? '20' : '30')) || 30;
    const color = prompt('Coat color (optional):', '') || '';
    const markings = prompt('Distinctive markings (optional):', '') || '';
    const personality = prompt('Personality trait (optional):', '') || '';
    const newPet = {
        id: generateId(),
        name: name,
        type: petType,
        breed: breed,
        age: age,
        weight: weight,
        dailyTarget: dailyTarget,
        mealAmount: mealAmount,
        profileImage: null,
        isActive: false,
        traits: {
            color: color,
            markings: markings,
            personality: personality
        },
        recognitionData: {
            confidence: 0,
            lastDetected: null,
            imageUrl: isCat ? 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=120&h=120&fit=crop&crop=center' : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=120&h=120&fit=crop&crop=center'
        }
    };
    state.pets.push(newPet);
    state.activePetId = newPet.id;
    saveState();
    updatePetProfileUI();
    updateRecognitionUI();
    addActivity(`Added new pet: ${newPet.name} (${newPet.type})`, 'fa-user-plus', '#2d7d46');
    addNotification(`New pet "${newPet.name}" added to your profile`, 'success', 'system');
}

// -------------------- MEAL FUNCTIONS --------------------
function addMeal(time, amount, days) {
    state.meals.push({ id: generateId(), time, amount: parseInt(amount), days: days.map(Number), enabled: true, skipped: false });
    saveState();
    renderMealSchedule();
    addActivity(`Meal scheduled: ${time} — ${amount}g`, 'fa-calendar-plus', '#1565c0');
}

function editMeal(idx, time, amount, days) {
    if (idx < 0 || idx >= state.meals.length) return;
    state.meals[idx].time = time;
    state.meals[idx].amount = parseInt(amount);
    state.meals[idx].days = days.map(Number);
    state.meals[idx].skipped = false;
    saveState();
    renderMealSchedule();
    addActivity(`Meal updated`, 'fa-edit', '#6a1b9a');
}

function deleteMeal(idx) {
    if (idx < 0 || idx >= state.meals.length) return;
    state.meals.splice(idx, 1);
    saveState();
    renderMealSchedule();
    addActivity(`Meal deleted`, 'fa-trash', '#c62828');
}

function skipMeal(idx) {
    if (idx < 0 || idx >= state.meals.length) return;
    state.meals[idx].skipped = !state.meals[idx].skipped;
    saveState();
    renderMealSchedule();
    addActivity(`Meal ${state.meals[idx].skipped ? 'skipped' : 'un-skipped'}`, 'fa-ban', '#e65100');
}

function openMealModal(editIdx = null) {
    const modal = dom.mealModal;
    if (!modal) return;
    const form = dom.mealForm;
    const title = dom.mealModalTitle;
    const timeInput = dom.mealTime;
    const amountInput = dom.mealAmount;
    const cbs = dom.dayCbs;
    form.dataset.editIdx = editIdx !== null ? editIdx : '';
    if (editIdx !== null && editIdx < state.meals.length) {
        const meal = state.meals[editIdx];
        title.textContent = 'Edit Meal';
        timeInput.value = meal.time;
        amountInput.value = meal.amount;
        cbs.forEach(cb => cb.checked = meal.days.includes(parseInt(cb.value)));
    } else {
        title.textContent = 'Add Meal';
        timeInput.value = '08:00';
        amountInput.value = '30';
        cbs.forEach(cb => cb.checked = true);
    }
    modal.classList.add('show');
}

function closeMealModal() {
    if (dom.mealModal) dom.mealModal.classList.remove('show');
}

// -------------------- FEEDING FUNCTIONS --------------------
async function feedPet(amount, mode) {
    if (state.foodLevel <= 0) {
        addNotification('Food container is empty!', 'danger');
        return false;
    }

    // --- NEW: SEND COMMAND TO HARDWARE ---
    try {
        const activePet = getActivePet();
        await fetch(`${API_BASE_URL}/api/dashboard/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                amount: amount,
                petName: activePet.name, // Sends "Molly" or "Rocky"
                mode: mode === 'automatic' ? 'Automatic' : 'Manual'
            })
        });
        addNotification(`Command sent: Dispense ${amount}g`, 'success');
    } catch (error) {
        addNotification('Hardware/Backend Offline', 'danger');
    }
    // --- END NEW SECTION ---

    const petName = getActivePet().name;
    const now = new Date();
    state.feedingHistory.unshift({ 
        date: now.toDateString(), 
        time: getTimeStamp(), 
        pet: petName, 
        amount: amount, 
        mode: mode === 'manual' ? 'Manual' : 'Auto' 
    });
    saveState();
    renderHistoryPanel();
    return true;
}

// -------------------- UPDATED FEEDING MODE (WITH BACKEND SYNC) --------------------
async function setFeedingMode(mode) {
    state.feedingMode = mode;
    dom.modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    if (dom.manualPanel) dom.manualPanel.classList.toggle('hidden', mode === 'automatic');
    if (dom.autoPanel) dom.autoPanel.classList.toggle('hidden', mode === 'manual');
    if (dom.currentModeDisplay) dom.currentModeDisplay.textContent = mode === 'manual' ? 'Manual' : 'Automatic';
    
    // --- SYNC MODE WITH BACKEND SO SCHEDULER KNOWS ---
    try {
        await fetch(`${API_BASE_URL}/api/dashboard/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: mode === 'automatic' ? 'Automatic' : 'Manual' })
        });
    } catch (e) {
        console.warn("Could not sync mode to backend");
    }

    addActivity(`Mode: ${mode}`, 'fa-sliders-h', '#64748b');
    addNotification(`Switched to ${mode} mode`, 'info');
    saveState();
}

// -------------------- WATER / TDS FUNCTIONS --------------------
function checkWater() {
    state.waterLevel = clamp(state.waterLevel + (Math.random() * 10 - 5), 0, 100);
    updateWaterUI();
    renderWaterMonitoring();
    addActivity(`Water level: ${Math.round(state.waterLevel)}%`, 'fa-tint', '#1565c0');
    addNotification(`Water level checked: ${Math.round(state.waterLevel)}%`, 'info');
    saveState();
}

function checkTDS() {
    state.tds = clamp(state.tds + (Math.random() * 60 - 30), 10, 800);
    updateTDSUI();
    renderWaterMonitoring();
    addActivity(`TDS: ${state.tds} ppm`, 'fa-flask', '#6a1b9a');
    if (state.tds > 500) {
        addNotification('Poor water quality! Please change water.', 'danger');
    } else {
        addNotification(`TDS quality: ${state.tds.toFixed(2)} ppm`, 'info');
    }
    saveState();
}

// -------------------- NAVIGATION --------------------
function navigateTo(pageId) {
    dom.navLinks.forEach(a => a.classList.remove('active'));
    const targetLink = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
    if (targetLink) targetLink.classList.add('active');
    dom.pages.forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');
    if (dom.sidebar) dom.sidebar.classList.remove('open');
    if (pageId === 'notifications') renderNotificationPanel();
    if (pageId === 'history') renderHistoryPanel();
    if (pageId === 'schedule') renderMealSchedule();
    if (pageId === 'pet-profile') updatePetProfileUI();
    if (pageId === 'water') renderWaterMonitoring();
}

// -------------------- SUPPORT FUNCTIONS --------------------
function supportEmail() {
    window.location.href = 'mailto:support@smartpet.co.za';
    addActivity('Support email opened', 'fa-envelope', '#1565c0');
}

function supportCall() {
    window.location.href = 'tel:+27821234567';
    addActivity('Support call initiated', 'fa-phone', '#2d7d46');
}

function supportChat() {
    alert('Live chat support is coming soon! Please email or call us for assistance.');
    addActivity('Live chat requested', 'fa-comment', '#6a1b9a');
}

// ==================== AUTH EVENT LISTENERS ====================

function setupAuthListeners() {
    // Login form submit
    document.getElementById('loginFormSubmit')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        loginUser(email, password);
    });

    // Register form submit
    document.getElementById('registerFormSubmit')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const firstName = document.getElementById('regFirstName').value;
        const lastName = document.getElementById('regLastName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        registerUser(firstName, lastName, email, password);
    });

    // Forgot password submit
    document.getElementById('forgotPasswordSubmit')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        forgotPassword(email);
    });

    // Switch to register
    document.getElementById('switchToRegister')?.addEventListener('click', function(e) {
        e.preventDefault();
        showAuthForm('register');
    });

    // Switch to login
    document.getElementById('switchToLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        showAuthForm('login');
    });

    // Forgot password link
    document.getElementById('forgotPasswordLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        showAuthForm('forgot');
    });

    // Back to login
    document.getElementById('backToLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        showAuthForm('login');
    });

    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);

    // Social login buttons (demo)
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('Social login coming soon! Please use email login for now.');
        });
    });
}

// -------------------- INIT --------------------
// -------------------- INIT --------------------
// -------------------- INIT (SERIOUS BACKEND INTEGRATION) --------------------
// -------------------- INIT --------------------
async function init() {
    dom = getDom();
    
    // Setup auth listeners
    setupAuthListeners();
    
    // Check if user is logged in
    if (!checkAuth()) {
        document.getElementById('authOverlay').classList.remove('hidden');
        showAuthForm('login');
        document.getElementById('mainHeader').style.display = 'none';
        document.getElementById('sidebar').style.display = 'none';
    }
    
    loadUserProfile();

    // 1. FIRST LOAD LOCAL STORAGE
    const loaded = loadState();
    if (!loaded) {
        saveState();
    }

    // 2. THEN OVERWRITE WITH REAL DATA FROM BACKEND STATUS
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/status`);
        if (response.ok) {
            const serverData = await response.json();
            state.foodLevel = serverData.foodLevelPercentage;
            state.waterLevel = serverData.waterLevelPercentage;
            state.tds = serverData.tdsValue;

            const badge = document.querySelector('.status-badge');
            if (badge) {
                badge.className = serverData.isOnline ? "status-badge online" : "status-badge offline";
                const badgeSpan = badge.querySelector('span');
                if (badgeSpan) badgeSpan.textContent = serverData.isOnline ? "Online" : "Offline";
            }
        }
    } catch (error) {
        console.warn('Backend server not reached.');
    }

    // 3. THEN OVERWRITE WITH REAL PETS FROM SQL DATABASE
    try {
        const petsResponse = await fetch(`${API_BASE_URL}/api/dashboard/pets`);
        if (petsResponse.ok) {
            const serverPets = await petsResponse.json();
            if (serverPets && serverPets.length > 0) {
                // Map the C# database pets into the dashboard format
                state.pets = serverPets.map(p => ({
                    id: 'pet_' + p.id,
                    name: p.name,
                    type: p.type || 'Dog',
                    breed: p.breed || 'Mixed',
                    age: 2,
                    weight: 15,
                    dailyTarget: p.dailyTarget || 180,
                    mealAmount: 30,
                    traits: { color: 'Tan', markings: 'None', personality: 'Friendly' }
                }));
                state.activePetId = state.pets[0].id;
                saveState(); // Save the new pets to local storage so they stay
            }
        }
    } catch (e) {
        console.warn("Backend Pets Offline");
    }

    // 4. DRAW THE UI NOW THAT REAL DATA IS LOADED
    applyDarkMode();
    updateFoodUI();
    updateWaterUI();
    updateTDSUI();
    updateRecognitionUI();
    updatePetProfileUI(); // <-- This will now draw Rocky!
    updateUserProfileUI();
    renderMiniActivity();
    renderHistoryPanel();
    renderMealSchedule();
    renderNotificationPanel();
    renderWaterMonitoring();
    setFeedingMode(state.feedingMode);
    updateNotificationBadge();
    if (dom.currentDate) dom.currentDate.textContent = formatDate(new Date());
    loadModel();

   // ==========================================
    // BACKEND: 5-SECOND AUTO-REFRESH & CAMERA FEED
    // ==========================================
    let lastProcessedPhoto = "";
    setInterval(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/dashboard/status`);
            if (response.ok) {
                const serverData = await response.json();
                state.foodLevel = serverData.foodLevelPercentage;
                state.waterLevel = serverData.waterLevelPercentage;
                state.tds = serverData.tdsValue;
                
                updateFoodUI();
                updateWaterUI();
                updateTDSUI();

                // 1. Check if ESP-CAM uploaded a new photo
                if (serverData.latestCameraImageUrl && serverData.latestCameraImageUrl !== lastProcessedPhoto) {
                    lastProcessedPhoto = serverData.latestCameraImageUrl;
                    const fullImageUrl = `${API_BASE_URL}${serverData.latestCameraImageUrl}`;
                    
                    const imgElement = document.getElementById('uploadedImageDisplay');
                    const placeholder = document.getElementById('cameraPlaceholder');
                    const video = document.getElementById('videoFeed');

                    if (imgElement) {
                        imgElement.crossOrigin = "anonymous";
                        imgElement.src = fullImageUrl;
                        imgElement.style.display = 'block';
                        if (placeholder) placeholder.style.display = 'none';
                        if (video) video.style.display = 'none';

                        addActivity('New photo from ESP-CAM received!', 'fa-camera', '#1565c0');
                        addNotification('ESP-CAM photo received. Analyzing pet...', 'info');

                        // 2. If in Automatic mode, automatically run AI recognition on the camera photo!
                        if (state.feedingMode === 'automatic') {
                            setTimeout(() => {
                                captureAndRecognize();
                            }, 1000);
                        }
                    }
                }

                // 3. If Backend triggered the buzzer to call the dog:
                if (serverData.buzzerActive) {
                    addNotification('🔔 MEALTIME RING! Calling pet to feeder...', 'warning');
                    addActivity('Buzzer ringing for mealtime!', 'fa-bell', '#f59e0b');
                }
            }
        } catch (e) { /* Connection to C# lost */ }
    }, 5000);
    
    // ==========================================
    // 5. EVENT LISTENERS (Original Wires)
    // ==========================================
    dom.navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) navigateTo(page);
        });
    });
    
    if (dom.userProfileBtn) {
        dom.userProfileBtn.addEventListener('click', function() {
            navigateTo('user-profile');
        });
    }
    if (dom.uploadAvatarBtn) {
        dom.uploadAvatarBtn.addEventListener('click', uploadUserAvatar);
    }
    if (dom.saveUserProfileBtn) {
        dom.saveUserProfileBtn.addEventListener('click', saveUserProfileForm);
    }
    if (dom.cancelUserProfileBtn) {
        dom.cancelUserProfileBtn.addEventListener('click', resetUserProfileForm);
    }
    if (dom.darkModeToggle) dom.darkModeToggle.addEventListener('click', toggleDarkMode);
    if (dom.settingsDarkModeBtn) dom.settingsDarkModeBtn.addEventListener('click', toggleDarkMode);
    
    if (dom.foodDecBtn) {
        dom.foodDecBtn.addEventListener('click', () => {
            state.foodLevel = clamp(state.foodLevel - 5, 0, 100);
            updateFoodUI();
            saveState();
        });
    }
    if (dom.foodIncBtn) {
        dom.foodIncBtn.addEventListener('click', () => {
            state.foodLevel = clamp(state.foodLevel + 5, 0, 100);
            updateFoodUI();
            saveState();
        });
    }
    if (dom.setFoodBtn) {
        dom.setFoodBtn.addEventListener('click', () => {
            const val = prompt('Set food level (0-100):', Math.round(state.foodLevel));
            if (val !== null) {
                const num = parseFloat(val);
                if (!isNaN(num)) {
                    state.foodLevel = clamp(num, 0, 100);
                    updateFoodUI();
                    saveState();
                    addActivity(`Food set to ${Math.round(num)}%`, 'fa-sliders-h', '#64748b');
                }
            }
        });
    }
    if (dom.checkWaterBtn) dom.checkWaterBtn.addEventListener('click', checkWater);
    if (dom.checkTdsBtn) dom.checkTdsBtn.addEventListener('click', checkTDS);
    
    dom.modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setFeedingMode(this.dataset.mode);
        });
    });

    if (dom.amountDecBtn) {
        dom.amountDecBtn.addEventListener('click', () => {
            state.manualAmount = clamp(state.manualAmount - 5, 5, 100);
            if (dom.manualAmountDisplay) dom.manualAmountDisplay.textContent = state.manualAmount;
        });
    }
    if (dom.amountIncBtn) {
        dom.amountIncBtn.addEventListener('click', () => {
            state.manualAmount = clamp(state.manualAmount + 5, 5, 100);
            if (dom.manualAmountDisplay) dom.manualAmountDisplay.textContent = state.manualAmount;
        });
    }

    function handleFeedNow() {
        if (state.feedingMode !== 'manual') {
            addNotification('Switch to Manual mode to feed manually', 'warning');
            return;
        }
        if (dom.confirmMessage) {
            dom.confirmMessage.textContent = `Dispense ${state.manualAmount}g for ${getActivePet().name}?`;
        }
        if (dom.confirmModal) dom.confirmModal.classList.add('show');
    }

    if (dom.feedNowBtn) dom.feedNowBtn.addEventListener('click', handleFeedNow);
    if (dom.feedPageFeedBtn) dom.feedPageFeedBtn.addEventListener('click', handleFeedNow);
    if (dom.quickFeedBtn) dom.quickFeedBtn.addEventListener('click', handleFeedNow);

    if (dom.confirmFeedBtn) {
        dom.confirmFeedBtn.addEventListener('click', () => {
            if (dom.confirmModal) dom.confirmModal.classList.remove('show');
            feedPet(state.manualAmount, 'manual');
        });
    }

    if (dom.quickAutoBtn) {
        dom.quickAutoBtn.addEventListener('click', () => {
            setFeedingMode('automatic');
            navigateTo('dashboard');
        });
    }

    // --- MEAL SCHEDULE SUBMIT (BULLETPROOF DATABASE VERSION) ---
    const mealFormElement = document.getElementById('mealForm');
    if (mealFormElement) {
        mealFormElement.addEventListener('submit', async function(e) {
            e.preventDefault();

            // 1. Directly read the form inputs
            const timeInput = document.getElementById('mealTime');
            const amountInput = document.getElementById('mealAmount');
            const dayCheckboxes = document.querySelectorAll('.day-cb');

            const time = timeInput ? timeInput.value : '08:00';
            const amount = amountInput ? parseInt(amountInput.value) : 30;
            const days = Array.from(dayCheckboxes).filter(cb => cb.checked).map(cb => parseInt(cb.value));

            if (!time || isNaN(amount)) {
                alert('Please enter both a valid time and portion amount.');
                return;
            }

            // 2. Draw the new meal on the dashboard schedule list
            if (typeof addMeal === 'function') {
                addMeal(time, amount, days);
            }

            // 3. Close the modal popup immediately
            const modal = document.getElementById('mealModal');
            if (modal) modal.classList.remove('show');

            // 4. Save directly into SQL Server database via C# API
            try {
                const response = await fetch(`${API_BASE_URL}/api/dashboard/schedules`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        time: time,
                        amount: amount,
                        days: days.join(','),
                        isEnabled: true
                    })
                });

                if (response.ok) {
                    addNotification(`Meal saved to SQL Server: ${time} (${amount}g)`, 'success');
                    if (typeof updateNextMeal === 'function') updateNextMeal();
                } else {
                    addNotification('Backend could not save schedule', 'warning');
                }
            } catch (err) {
                console.error("Failed to save schedule to database", err);
            }

            saveState();
        });
    }

    if (dom.modalClose) dom.modalClose.addEventListener('click', closeMealModal);
    
    // Auth and Data Reset

    if (dom.modalClose) dom.modalClose.addEventListener('click', closeMealModal);
    
    // Auth and Data Reset
    if (dom.logoutBtn) dom.logoutBtn.addEventListener('click', logoutUser);
    if (dom.resetDemoBtn) {
        dom.resetDemoBtn.addEventListener('click', () => {
            if (confirm('Reset all data?')) {
                localStorage.removeItem('petFeederState');
                localStorage.removeItem('userProfile');
                localStorage.removeItem('isLoggedIn');
                location.reload();
            }
        });
    }
    
    // Camera event listeners
    if (dom.uploadImageBtn) dom.uploadImageBtn.addEventListener('click', uploadImage);
    if (dom.startCameraBtn) dom.startCameraBtn.addEventListener('click', startCamera);
    if (dom.stopCameraBtn) dom.stopCameraBtn.addEventListener('click', stopCamera);
    if (dom.captureRecognitionBtn) dom.captureRecognitionBtn.addEventListener('click', captureAndRecognize);
    
    window.addEventListener('click', (e) => {
        if (e.target === dom.mealModal) closeMealModal();
        if (e.target === dom.confirmModal && dom.confirmModal) {
            dom.confirmModal.classList.remove('show');
        }
    });

    console.log('🐾 Smart Pet Feeder - Fully Linked to C# Backend');
    console.log(`📊 History & Pets synced with SQL Server`);
    console.log('📍 Location: South Africa');
    console.log('🔐 Auth: ' + (state.isLoggedIn ? 'Logged in' : 'Logged out'));
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}