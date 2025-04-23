// API Configuration
const API_CONFIG = {
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-3.5-turbo"
};

// Initialize API key from localStorage
let API_KEY = localStorage.getItem('openai_api_key') || '';

// Voice settings
let voiceSettings = {
    gender: localStorage.getItem('voice_gender') || 'default',
    rate: parseFloat(localStorage.getItem('voice_rate')) || 1.0
};

// ==================== DOM Elements ====================
// Settings Modal Elements
const settingsButton = document.getElementById('settingsButton');
const apiKeyModal = new bootstrap.Modal(document.getElementById('apiKeyModal'));
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeyStatus = document.getElementById('apiKeyStatus');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const pasteApiKeyBtn = document.getElementById('pasteApiKeyBtn');
const voiceGender = document.getElementById('voiceGender');
const voiceRate = document.getElementById('voiceRate');
const voiceRateValue = document.getElementById('voiceRateValue');

// Dual Mic Mode
const dualMicModeUI = document.getElementById('dualMicModeUI');
const leftMicBtn = document.getElementById('leftMicBtn');
const rightMicBtn = document.getElementById('rightMicBtn');
const leftMicLabel = document.getElementById('leftMicLabel');
const rightMicLabel = document.getElementById('rightMicLabel');
const leftLangLabel = document.getElementById('leftLangLabel');
const rightLangLabel = document.getElementById('rightLangLabel');
const leftMicLang = document.getElementById('leftMicLang');
const rightMicLang = document.getElementById('rightMicLang');
const leftMicName = document.getElementById('leftMicName');
const rightMicName = document.getElementById('rightMicName');
const soundWave = document.getElementById('soundWave');
const bubblesContainer = document.getElementById('bubblesContainer');
const statusIndicator = document.getElementById('statusIndicator');
const translationResult = document.getElementById('translationResult');
const translationLanguage = document.getElementById('translationLanguage');
const copyTranslation = document.getElementById('copyTranslation');
const speakTranslation = document.getElementById('speakTranslation');

// Conversation Mode
const conversationModeUI = document.getElementById('conversationModeUI');
const conversationAutoModeToggle = document.getElementById('conversationAutoModeToggle');
const currentSpeakerDisplay = document.getElementById('currentSpeakerDisplay');
const currentSpeakerName = document.getElementById('currentSpeakerName');
const speakerALang = document.getElementById('speakerALang');
const speakerBLang = document.getElementById('speakerBLang');
const speakerAName = document.getElementById('speakerAName');
const speakerBName = document.getElementById('speakerBName');
const conversationInputText = document.getElementById('conversationInputText');
const conversationPasteButton = document.getElementById('conversationPasteButton');
const conversationMicButton = document.getElementById('conversationMicButton');
const conversationStatusIndicator = document.getElementById('conversationStatusIndicator');
const conversationTranslateBtn = document.getElementById('conversationTranslateBtn');
const conversationHistory = document.getElementById('conversationHistory');

// Single Mode
const singleModeUI = document.getElementById('singleModeUI');
const singleAutoModeToggle = document.getElementById('singleAutoModeToggle');
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');
const singleInputText = document.getElementById('singleInputText');
const singlePasteButton = document.getElementById('singlePasteButton');
const singleMicButton = document.getElementById('singleMicButton');
const singleStatusIndicator = document.getElementById('singleStatusIndicator');
const singleTranslateBtn = document.getElementById('singleTranslateBtn');
const singleTranslationResult = document.getElementById('singleTranslationResult');
const singleTranslationLanguage = document.getElementById('singleTranslationLanguage');
const singleCopyTranslation = document.getElementById('singleCopyTranslation');
const singleSpeakTranslation = document.getElementById('singleSpeakTranslation');

// Mode Selector
const singleModeBtn = document.getElementById('singleModeBtn');
const conversationModeBtn = document.getElementById('conversationModeBtn');
const dualMicModeBtn = document.getElementById('dualMicModeBtn');

// Audio elements
const startBeep = document.getElementById('startBeep');
const endBeep = document.getElementById('endBeep');
const errorBeep = document.getElementById('errorBeep');

// ==================== App State ====================
const appState = {
    currentMode: 'single',
    isProcessing: false,
    apiKeyValid: false,
    
    // Dual Mic State
    isLeftMicActive: false,
    isRightMicActive: false,
    
    // Conversation State
    conversationAutoMode: false,
    currentSpeaker: 'A',
    conversationStep: 0,
    
    // Single Mode State
    singleAutoMode: false,
    singleRecording: false
};

// ==================== Speech Recognition ====================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognitionLeft = SpeechRecognition ? new SpeechRecognition() : null;
const recognitionRight = SpeechRecognition ? new SpeechRecognition() : null;
const conversationRecognition = SpeechRecognition ? new SpeechRecognition() : null;
const singleRecognition = SpeechRecognition ? new SpeechRecognition() : null;

// ==================== Initialization ====================
function init() {
    // Load saved API key if exists
    if (API_KEY) {
        apiKeyInput.value = API_KEY;
        validateApiKey(API_KEY);
    }
    
    // Load voice settings
    voiceGender.value = voiceSettings.gender;
    voiceRate.value = voiceSettings.rate;
    voiceRateValue.textContent = voiceSettings.rate + 'x';
    
    if (SpeechRecognition) {
        setupSpeechRecognition();
    } else {
        // Disable all mic buttons if recognition not supported
        const micButtons = [
            leftMicBtn, rightMicBtn, 
            conversationMicButton, singleMicButton
        ];
        
        micButtons.forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.title = "Browser tidak mendukung pengenalan suara";
            }
        });
    }
    
    setupEventListeners();
    createBubbles();
    setMode(appState.currentMode);
}

// ==================== Setup Functions ====================
function setupSpeechRecognition() {
    // Setup for left mic (Dual Mic Mode)
    if (recognitionLeft) {
        recognitionLeft.continuous = false;
        recognitionLeft.interimResults = false;
        
        recognitionLeft.onstart = () => {
            leftMicBtn.classList.add('mic-active');
            soundWave.classList.add('left-active', 'active');
            updateStatus('Merekam Bahasa A...', 'status-recording');
            playSound(startBeep);
        };
        
        recognitionLeft.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            processDualMicTranslation(transcript, 'left');
        };
        
        recognitionLeft.onerror = (event) => {
            console.error('Left mic recognition error:', event.error);
            resetDualMicState();
            updateStatus('Gagal merekam', 'text-danger');
            playSound(errorBeep);
        };
        
        recognitionLeft.onend = () => {
            resetDualMicState();
        };
    }
    
    // Setup for right mic (Dual Mic Mode)
    if (recognitionRight) {
        recognitionRight.continuous = false;
        recognitionRight.interimResults = false;
        
        recognitionRight.onstart = () => {
            rightMicBtn.classList.add('mic-active');
            soundWave.classList.add('right-active', 'active');
            updateStatus('Merekam Bahasa B...', 'status-recording');
            playSound(startBeep);
        };
        
        recognitionRight.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            processDualMicTranslation(transcript, 'right');
        };
        
        recognitionRight.onerror = (event) => {
            console.error('Right mic recognition error:', event.error);
            resetDualMicState();
            updateStatus('Gagal merekam', 'text-danger');
            playSound(errorBeep);
        };
        
        recognitionRight.onend = () => {
            resetDualMicState();
        };
    }
    
    // Setup for conversation mode recognition
    if (conversationRecognition) {
        conversationRecognition.continuous = false;
        conversationRecognition.interimResults = false;
        
        conversationRecognition.onstart = () => {
            conversationMicButton.classList.add('mic-active');
            updateConversationStatus('Merekam...', 'status-recording');
            playSound(startBeep);
        };
        
        conversationRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            conversationInputText.value = transcript;
            
            if (appState.conversationAutoMode) {
                processConversationStep(transcript);
            }
        };
        
        conversationRecognition.onerror = (event) => {
            console.error('Conversation recognition error:', event.error);
            conversationMicButton.classList.remove('mic-active');
            updateConversationStatus('Gagal merekam', 'text-danger');
            playSound(errorBeep);
            appState.isProcessing = false;
        };
        
        conversationRecognition.onend = () => {
            conversationMicButton.classList.remove('mic-active');
            
            if (!appState.conversationAutoMode) {
                updateConversationStatus('', '');
            }
        };
    }
    
    // Setup for single mode recognition
    if (singleRecognition) {
        singleRecognition.continuous = false;
        singleRecognition.interimResults = false;
        
        singleRecognition.onstart = () => {
            appState.singleRecording = true;
            singleMicButton.classList.add('mic-active');
            updateSingleStatus('Merekam...', 'status-recording');
            playSound(startBeep);
        };
        
        singleRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            singleInputText.value = transcript;
            
            if (appState.singleAutoMode) {
                processSingleTranslation(transcript);
            }
        };
        
        singleRecognition.onerror = (event) => {
            console.error('Single recognition error:', event.error);
            appState.singleRecording = false;
            singleMicButton.classList.remove('mic-active');
            updateSingleStatus('Gagal merekam', 'text-danger');
            playSound(errorBeep);
            appState.isProcessing = false;
        };
        
        singleRecognition.onend = () => {
            appState.singleRecording = false;
            singleMicButton.classList.remove('mic-active');
            
            if (!appState.singleAutoMode) {
                updateSingleStatus('', '');
            }
        };
    }
}

function setupEventListeners() {
    // ===== API Key Settings =====
    settingsButton.addEventListener('click', () => {
        apiKeyInput.value = API_KEY || '';
        apiKeyStatus.textContent = '';
        apiKeyModal.show();
    });
    
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    pasteApiKeyBtn.addEventListener('click', () => pasteText(apiKeyInput));
    apiKeyInput.addEventListener('input', () => {
        apiKeyStatus.textContent = '';
    });
    
    // Voice settings
    voiceGender.addEventListener('change', (e) => {
        voiceSettings.gender = e.target.value;
        localStorage.setItem('voice_gender', voiceSettings.gender);
    });
    
    voiceRate.addEventListener('input', (e) => {
        voiceSettings.rate = parseFloat(e.target.value);
        voiceRateValue.textContent = voiceSettings.rate.toFixed(1) + 'x';
        localStorage.setItem('voice_rate', voiceSettings.rate);
    });
    
    // ===== Dual Mic Mode Event Listeners =====
    leftMicBtn.addEventListener('mousedown', () => startDualMicRecording('left'));
    leftMicBtn.addEventListener('mouseup', () => stopDualMicRecording('left'));
    leftMicBtn.addEventListener('mouseleave', () => stopDualMicRecording('left'));
    
    rightMicBtn.addEventListener('mousedown', () => startDualMicRecording('right'));
    rightMicBtn.addEventListener('mouseup', () => stopDualMicRecording('right'));
    rightMicBtn.addEventListener('mouseleave', () => stopDualMicRecording('right'));
    
    leftMicLang.addEventListener('change', updateDualMicLabels);
    rightMicLang.addEventListener('change', updateDualMicLabels);
    leftMicName.addEventListener('input', updateDualMicLabels);
    rightMicName.addEventListener('input', updateDualMicLabels);
    
    copyTranslation.addEventListener('click', copyTranslationText);
    speakTranslation.addEventListener('click', speakCurrentTranslation);
    
    // ===== Conversation Mode Event Listeners =====
    conversationAutoModeToggle.addEventListener('change', () => {
        appState.conversationAutoMode = conversationAutoModeToggle.checked;
        
        if (appState.conversationAutoMode) {
            conversationMicButton.classList.add('auto-mode-active');
            startConversationAutoMode();
        } else {
            conversationMicButton.classList.remove('auto-mode-active');
            updateConversationStatus('', '');
        }
    });
    
    speakerALang.addEventListener('change', updateConversationSpeakerDisplay);
    speakerBLang.addEventListener('change', updateConversationSpeakerDisplay);
    speakerAName.addEventListener('input', updateConversationSpeakerDisplay);
    speakerBName.addEventListener('input', updateConversationSpeakerDisplay);
    
    conversationMicButton.addEventListener('click', toggleConversationRecording);
    conversationPasteButton.addEventListener('click', () => pasteText(conversationInputText));
    conversationTranslateBtn.addEventListener('click', () => {
        const text = conversationInputText.value.trim();
        if (text) processConversationStep(text);
    });
    
    // ===== Single Mode Event Listeners =====
    singleAutoModeToggle.addEventListener('change', () => {
        appState.singleAutoMode = singleAutoModeToggle.checked;
        
        if (appState.singleAutoMode) {
            singleMicButton.classList.add('auto-mode-active');
            startSingleAutoMode();
        } else {
            singleMicButton.classList.remove('auto-mode-active');
            updateSingleStatus('', '');
        }
    });
    
    singleMicButton.addEventListener('click', toggleSingleRecording);
    singlePasteButton.addEventListener('click', () => pasteText(singleInputText));
    singleTranslateBtn.addEventListener('click', () => {
        const text = singleInputText.value.trim();
        if (text) processSingleTranslation(text);
    });
    
    singleCopyTranslation.addEventListener('click', () => {
        const text = singleTranslationResult.innerText.trim();
        if (text && !text.includes('Terjemahan akan muncul di sini')) {
            copyToClipboard(text, singleCopyTranslation);
        }
    });
    
    singleSpeakTranslation.addEventListener('click', () => {
        const text = singleTranslationResult.innerText.trim();
        if (text && !text.includes('Terjemahan akan muncul di sini')) {
            speakText(text, targetLang.value);
        }
    });
    
    // ===== Mode Selector Event Listeners =====
    singleModeBtn.addEventListener('click', () => setMode('single'));
    conversationModeBtn.addEventListener('click', () => setMode('conversation'));
    dualMicModeBtn.addEventListener('click', () => setMode('dualMic'));
}

// ==================== API Key Functions ====================
function saveApiKey() {
    const newApiKey = apiKeyInput.value.trim();
    
    if (!newApiKey) {
        apiKeyStatus.textContent = 'API Key tidak boleh kosong';
        apiKeyStatus.className = 'api-key-status invalid';
        return;
    }
    
    validateApiKey(newApiKey, (isValid) => {
        if (isValid) {
            API_KEY = newApiKey;
            localStorage.setItem('openai_api_key', API_KEY);
            appState.apiKeyValid = true;
            
            apiKeyStatus.textContent = 'API Key valid dan tersimpan';
            apiKeyStatus.className = 'api-key-status valid';
            
            setTimeout(() => {
                apiKeyModal.hide();
            }, 1500);
        } else {
            apiKeyStatus.textContent = 'API Key tidak valid';
            apiKeyStatus.className = 'api-key-status invalid';
        }
    });
}

function validateApiKey(apiKey, callback) {
    if (!apiKey) {
        if (callback) callback(false);
        return false;
    }
    
    // Simple validation - check if it starts with "sk-" and has at least 40 characters
    const isValid = apiKey.startsWith('sk-') && apiKey.length >= 40;
    
    if (callback) {
        // For actual validation, we would make a test API call
        // But for this example, we'll just do the simple check
        callback(isValid);
    }
    
    appState.apiKeyValid = isValid;
    return isValid;
}

// ==================== Core Functions ====================

// ===== Dual Mic Mode Functions =====
function startDualMicRecording(side) {
    if (appState.isProcessing || !appState.apiKeyValid) {
        if (!appState.apiKeyValid) {
            updateStatus('API Key tidak valid. Silakan atur di pengaturan.', 'text-danger');
        }
        return;
    }
    
    if (side === 'left') {
        recognitionLeft.lang = getSpeechLangCode(leftMicLang.value);
        recognitionLeft.start();
    } else {
        recognitionRight.lang = getSpeechLangCode(rightMicLang.value);
        recognitionRight.start();
    }
}

function stopDualMicRecording(side) {
    if (side === 'left' && recognitionLeft) {
        recognitionLeft.stop();
    } else if (side === 'right' && recognitionRight) {
        recognitionRight.stop();
    }
}

function resetDualMicState() {
    leftMicBtn.classList.remove('mic-active');
    rightMicBtn.classList.remove('mic-active');
    soundWave.classList.remove('left-active', 'right-active', 'active');
}

function updateDualMicLabels() {
    leftMicLabel.textContent = leftMicName.value || 'Speaker A';
    leftLangLabel.textContent = getLanguageName(leftMicLang.value);
    rightMicLabel.textContent = rightMicName.value || 'Speaker B';
    rightLangLabel.textContent = getLanguageName(rightMicLang.value);
}

async function processDualMicTranslation(text, side) {
    if (!text.trim()) {
        updateStatus('Tidak ada input suara', 'text-warning');
        playSound(errorBeep);
        return;
    }
    
    appState.isProcessing = true;
    updateStatus('Menerjemahkan...', 'status-translating');
    soundWave.classList.remove('active');
    soundWave.classList.add(side === 'left' ? 'right-active' : 'left-active');
    playSound(endBeep);
    
    try {
        const sourceLang = side === 'left' ? leftMicLang.value : rightMicLang.value;
        const targetLang = side === 'left' ? rightMicLang.value : leftMicLang.value;
        const speakerName = side === 'left' ? leftMicName.value : rightMicName.value;
        const targetSpeakerName = side === 'left' ? rightMicName.value : leftMicName.value;
        
        const translatedText = await translateText(text, sourceLang, targetLang);
        
        if (translatedText) {
            translationResult.textContent = translatedText;
            translationLanguage.textContent = `${getLanguageName(targetLang)} (${targetSpeakerName})`;
            
            updateStatus('Membacakan hasil...', 'status-speaking');
            await speakText(translatedText, targetLang);
            
            updateStatus('Selesai', 'text-success');
            playSound(endBeep);
        } else {
            updateStatus('Hasil kosong', 'text-warning');
            speakText("Maaf, tidak ada respon.", 'id');
            playSound(errorBeep);
        }
    } catch (error) {
        console.error("Dual mic translation error:", error);
        updateStatus('Gagal menerjemahkan', 'text-danger');
        speakText("Maaf, terjadi kesalahan.", 'id');
        playSound(errorBeep);
    } finally {
        appState.isProcessing = false;
        soundWave.classList.remove('left-active', 'right-active');
    }
}

// ===== Conversation Mode Functions =====
function toggleConversationRecording() {
    if (!appState.apiKeyValid) {
        updateConversationStatus('API Key tidak valid. Silakan atur di pengaturan.', 'text-danger');
        return;
    }
    
    if (conversationMicButton.classList.contains('mic-active')) {
        conversationRecognition.stop();
    } else {
        const lang = appState.currentSpeaker === 'A' ? speakerALang.value : speakerBLang.value;
        conversationRecognition.lang = getSpeechLangCode(lang);
        conversationRecognition.start();
    }
}

function startConversationAutoMode() {
    if (!appState.isProcessing && appState.apiKeyValid) {
        updateConversationStatus('Siap merekam...', 'text-primary');
        const lang = appState.currentSpeaker === 'A' ? speakerALang.value : speakerBLang.value;
        conversationRecognition.lang = getSpeechLangCode(lang);
        conversationRecognition.start();
    } else if (!appState.apiKeyValid) {
        updateConversationStatus('API Key tidak valid. Silakan atur di pengaturan.', 'text-danger');
    }
}

async function processConversationStep(text) {
    if (!appState.apiKeyValid) {
        updateConversationStatus('API Key tidak valid. Silakan atur di pengaturan.', 'text-danger');
        return;
    }
    
    const sourceLang = appState.currentSpeaker === 'A' ? speakerALang.value : speakerBLang.value;
    const targetLang = appState.currentSpeaker === 'A' ? speakerBLang.value : speakerALang.value;
    const speakerName = appState.currentSpeaker === 'A' ? speakerAName.value : speakerBName.value;
    const targetSpeakerName = appState.currentSpeaker === 'A' ? speakerBName.value : speakerAName.value;
    
    // Add original text to conversation history
    addToConversationHistory(speakerName, text, sourceLang, false);
    
    // Translate the text
    appState.isProcessing = true;
    updateConversationStatus('Menerjemahkan...', 'status-translating');
    playSound(endBeep);
    
    try {
        const translatedText = await translateText(text, sourceLang, targetLang);
        
        if (translatedText) {
            // Add translation to conversation history
            addToConversationHistory(targetSpeakerName, translatedText, targetLang, true);
            
            // Show in translation result
            singleTranslationLanguage.textContent = getLanguageName(targetLang);
            singleTranslationResult.innerHTML = `<p>${translatedText}</p>`;
            
            // Speak the translation
            updateConversationStatus('Membacakan hasil...', 'status-speaking');
            await speakText(translatedText, targetLang);
            
            // Switch speaker for next turn
            appState.currentSpeaker = appState.currentSpeaker === 'A' ? 'B' : 'A';
            appState.conversationStep++;
            updateConversationSpeakerDisplay();
            
            updateConversationStatus('Selesai', 'text-success');
            playSound(endBeep);
            
            // Update input placeholder for next speaker
            conversationInputText.value = '';
            conversationInputText.placeholder = `Mendengarkan ${appState.currentSpeaker === 'A' ? speakerAName.value : speakerBName.value}...`;
            
            // Restart auto mode if enabled
            if (appState.conversationAutoMode) {
                setTimeout(startConversationAutoMode, 3000);
            }
        } else {
            updateConversationStatus('Hasil kosong', 'text-warning');
            speakText("Maaf, tidak ada respon.", 'id');
            playSound(errorBeep);
        }
    } catch (error) {
        console.error("Conversation error:", error);
        updateConversationStatus('Gagal memproses', 'text-danger');
        speakText("Maaf, terjadi kesalahan.", 'id');
        playSound(errorBeep);
    } finally {
        appState.isProcessing = false;
    }
}

function updateConversationSpeakerDisplay() {
    const speakerName = appState.currentSpeaker === 'A' ? speakerAName.value : speakerBName.value;
    const speakerLang = appState.currentSpeaker === 'A' ? speakerALang.value : speakerBLang.value;
    
    currentSpeakerName.textContent = `${speakerName} (${getLanguageName(speakerLang)})`;
    conversationInputText.placeholder = `Mendengarkan ${speakerName}...`;
}

// ===== Single Mode Functions =====
function toggleSingleRecording() {
    if (!appState.apiKeyValid) {
        updateSingleStatus('API Key tidak valid. Silakan atur di pengaturan.', 'text-danger');
        return;
    }
    
    if (appState.singleRecording) {
        singleRecognition.stop();
    } else {
        singleRecognition.lang = getSpeechLangCode(sourceLang.value);
        singleRecognition.start();
    }
}

function startSingleAutoMode() {
    if (!appState.isProcessing && appState.apiKeyValid && !appState.singleRecording) {
        updateSingleStatus('Siap merekam...', 'text-primary');
        singleRecognition.lang = getSpeechLangCode(sourceLang.value);
        singleRecognition.start();
    } else if (!appState.apiKeyValid) {
        updateSingleStatus('API Key tidak valid. Silakan atur di pengaturan.', 'text-danger');
    }
}

async function processSingleTranslation(text) {
    if (!appState.apiKeyValid) {
        updateSingleStatus('API Key tidak valid. Silakan atur di pengaturan.', 'text-danger');
        return;
    }
    
    const source = sourceLang.value;
    const target = targetLang.value;
    
    appState.isProcessing = true;
    singleTranslationResult.innerHTML = '<p class="text-muted mb-0">Menerjemahkan...</p>';
    updateSingleStatus('Menerjemahkan...', 'status-translating');
    
    try {
        const result = await translateText(text, source === 'auto' ? 'id' : source, target);
        
        singleTranslationLanguage.textContent = getLanguageName(target);
        singleTranslationResult.innerHTML = `<p>${result}</p>`;
        updateSingleStatus('Membacakan hasil...', 'status-speaking');
        
        // Speak the translation
        await speakText(result, target);
        
        updateSingleStatus('Selesai', 'text-success');
        
        // Restart auto mode if enabled
        if (appState.singleAutoMode) {
            setTimeout(startSingleAutoMode, 3000);
        }
    } catch (error) {
        console.error("Single translation failed:", error);
        singleTranslationResult.innerHTML = '<p class="text-danger">Gagal menerjemahkan. Silakan coba lagi.</p>';
        updateSingleStatus('Gagal', 'text-danger');
        playSound(errorBeep);
        
        // Restart auto mode if enabled
        if (appState.singleAutoMode) {
            setTimeout(startSingleAutoMode, 3000);
        }
    } finally {
        appState.isProcessing = false;
    }
}

// ===== Shared Functions =====
function setMode(mode) {
    appState.currentMode = mode;
    
    // Update mode buttons
    singleModeBtn.classList.remove('active');
    conversationModeBtn.classList.remove('active');
    dualMicModeBtn.classList.remove('active');
    
    // Hide all UIs
    singleModeUI.classList.add('hidden');
    conversationModeUI.classList.add('hidden');
    dualMicModeUI.classList.add('hidden');
    
    // Show selected mode UI
    if (mode === 'single') {
        singleModeBtn.classList.add('active');
        singleModeUI.classList.remove('hidden');
    } 
    else if (mode === 'conversation') {
        conversationModeBtn.classList.add('active');
        conversationModeUI.classList.remove('hidden');
        updateConversationSpeakerDisplay();
    } 
    else if (mode === 'dualMic') {
        dualMicModeBtn.classList.add('active');
        dualMicModeUI.classList.remove('hidden');
        updateDualMicLabels();
    }
}

function addToConversationHistory(speaker, text, lang, isTranslation) {
    const item = document.createElement('div');
    item.className = `conversation-item ${isTranslation ? 'translated' : 'original'} speaker-${speaker === speakerAName.value ? 'a' : 'b'}`;
    
    const speakerEl = document.createElement('div');
    speakerEl.className = 'conversation-speaker';
    
    // Speaker name
    const nameSpan = document.createElement('span');
    nameSpan.textContent = speaker;
    speakerEl.appendChild(nameSpan);
    
    // Badge for original/translated
    const badge = document.createElement('span');
    badge.className = `conversation-badge ${isTranslation ? 'badge-translated' : 'badge-original'}`;
    badge.textContent = isTranslation ? 'TERJEMAHAN' : 'ASLI';
    speakerEl.appendChild(badge);
    
    // Language tag
    const langTag = document.createElement('span');
    langTag.className = 'language-tag';
    langTag.textContent = getLanguageName(lang);
    speakerEl.appendChild(langTag);
    
    // Message text
    const textEl = document.createElement('div');
    textEl.className = 'conversation-text';
    textEl.textContent = text;
    
    item.appendChild(speakerEl);
    item.appendChild(textEl);
    conversationHistory.appendChild(item);
    
    // Scroll to bottom
    conversationHistory.scrollTop = conversationHistory.scrollHeight;
}

async function pasteText(textarea) {
    try {
        const text = await navigator.clipboard.readText();
        textarea.value = text;
        
        // Jika textarea adalah apiKeyInput, validasi setelah paste
        if (textarea === apiKeyInput) {
            validateApiKey(text, (isValid) => {
                if (isValid) {
                    apiKeyStatus.textContent = 'API Key valid';
                    apiKeyStatus.className = 'api-key-status valid';
                } else {
                    apiKeyStatus.textContent = 'API Key tidak valid';
                    apiKeyStatus.className = 'api-key-status invalid';
                }
            });
        }
    } catch (err) {
        console.error('Failed to read clipboard: ', err);
        alert('Gagal membaca clipboard. Pastikan Anda memberikan izin akses clipboard.');
    }
}

function copyTranslationText() {
    const text = translationResult.innerText.trim();
    if (text && !text.includes('Tekan dan tahan tombol mikrofon')) {
        copyToClipboard(text, copyTranslation);
    }
}

function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text)
        .then(() => {
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check me-2"></i>Tersalin!';
            setTimeout(() => {
                button.innerHTML = originalIcon;
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

function speakCurrentTranslation() {
    const text = translationResult.innerText.trim();
    if (text && !text.includes('Tekan dan tahan tombol mikrofon')) {
        const lang = appState.isLeftMicActive ? rightMicLang.value : leftMicLang.value;
        speakText(text, lang);
    }
}

// ==================== Helper Functions ====================
function createBubbles() {
    const bubbleCount = 15;
    for (let i = 0; i < bubbleCount; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Random size between 10 and 40px
        const size = Math.random() * 30 + 10;
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        
        // Random position
        bubble.style.left = `${Math.random() * 100}%`;
        
        // Random animation duration and delay
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay = `${delay}s`;
        
        bubblesContainer.appendChild(bubble);
    }
}

function updateStatus(text, className) {
    statusIndicator.textContent = text;
    statusIndicator.className = `status-indicator ${className}`;
}

function updateConversationStatus(text, className) {
    conversationStatusIndicator.textContent = text;
    conversationStatusIndicator.className = `status-indicator ${className}`;
}

function updateSingleStatus(text, className) {
    singleStatusIndicator.textContent = text;
    singleStatusIndicator.className = `status-indicator ${className}`;
}

function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log("Audio play failed:", e));
    }
}

function speakText(text, lang) {
    return new Promise((resolve) => {
        if (!text || !window.speechSynthesis) {
            resolve();
            return;
        }
        
        const speech = new SpeechSynthesisUtterance();
        speech.text = text;
        speech.lang = getSpeechLangCode(lang);
        speech.rate = voiceSettings.rate;
        
        // Try to find a voice that matches the selected gender
        if (voiceSettings.gender !== 'default') {
            const voices = window.speechSynthesis.getVoices();
            const targetVoice = voices.find(voice => {
                const langMatch = voice.lang.startsWith(getSpeechLangCode(lang).substring(0, 2));
                if (voiceSettings.gender === 'male') {
                    // Prioritize male voices
                    return langMatch && (
                        voice.name.toLowerCase().includes('male') || 
                        voice.name.toLowerCase().includes('man') || 
                        voice.name.toLowerCase().includes('pria') ||
                        voice.name.toLowerCase().includes('laki') ||
                        !voice.name.toLowerCase().includes('female') && 
                        !voice.name.toLowerCase().includes('woman') && 
                        !voice.name.toLowerCase().includes('perempuan')
                    );
                } else {
                    // For female voices
                    return langMatch && (
                        voice.name.toLowerCase().includes('female') || 
                        voice.name.toLowerCase().includes('woman') || 
                        voice.name.toLowerCase().includes('perempuan')
                    );
                }
            });
            
            if (targetVoice) {
                speech.voice = targetVoice;
            }
        }
        
        speech.onend = () => {
            resolve();
        };
        
        speech.onerror = (event) => {
            console.error('Speech error:', event);
            resolve();
        };
        
        window.speechSynthesis.speak(speech);
    });
}

function getSpeechLangCode(langCode) {
    const langMap = {
        'id': 'id-ID', // Indonesia
        'en': 'en-US',  // Inggris
        'ar': 'ar-SA',  // Arab
        'de': 'de-DE',  // Jerman
        'fr': 'fr-FR',  // Prancis
        'es': 'es-ES',  // Spanyol
        'ru': 'ru-RU',  // Rusia
        'ja': 'ja-JP',  // Jepang
        'ko': 'ko-KR',  // Korea
        'zh': 'zh-CN', // Mandarin
        'th': 'th-TH', // Thai
        'vi': 'vi-VN', // Vietnam
        'ms': 'ms-MY', // Melayu
        'fil': 'fil-PH', // Filipina
        'it': 'it-IT', // Italia
        'pt': 'pt-PT', // Portugis
        'nl': 'nl-NL', // Belanda
        'tr': 'tr-TR'  // Turki
    };
    return langMap[langCode] || 'id-ID'; // Default to Indonesian
}

function getLanguageName(code) {
    const languages = {
        'id': 'Indonesia',
        'en': 'Inggris',
        'ar': 'Arab',
        'de': 'Jerman',
        'fr': 'Prancis',
        'es': 'Spanyol',
        'ru': 'Rusia',
        'ja': 'Jepang',
        'ko': 'Korea',
        'zh': 'Mandarin',
        'th': 'Thai',
        'vi': 'Vietnam',
        'ms': 'Melayu',
        'fil': 'Filipina',
        'it': 'Italia',
        'pt': 'Portugis',
        'nl': 'Belanda',
        'tr': 'Turki'
    };
    return languages[code] || code;
}

async function translateText(text, source, target) {
    if (!text || !API_KEY) return "";
    
    // Prepare the prompt for translation
    const sourceLangName = source === 'auto' ? '' : `dari ${getLanguageName(source)} `;
    const prompt = `Terjemahkan teks berikut ${sourceLangName}ke ${getLanguageName(target)}:\n\n${text}`;
    
    try {
        const response = await fetch(API_CONFIG.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: "system",
                        content: "Anda adalah penerjemah bahasa yang ahli. Pahami dan terjemahkan teks yang diberikan dengan akurat dan menjaga makna aslinya."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 1,
                max_tokens: 3000
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        let translatedText = data.choices[0].message.content.trim();
        
        // Clean up the response if it includes the prompt
        if (translatedText.includes(prompt)) {
            translatedText = translatedText.replace(prompt, "").trim();
        }
        
        return translatedText;
    } catch (error) {
        console.error("Translation error:", error);
        throw error;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load voices when they become available
    speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', speechSynthesis.getVoices());
    };
    
    init();
});

// Prevent inspect element
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
    }
});