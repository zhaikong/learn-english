let currentWordIndex = 0;
let progress = 0;
let currentStage = 1;
let audioRecording = null;
let mediaRecorder = null;
let audioChunks = [];

function changeGrade() {
    const grade = document.getElementById('grade').value;
    words = allWords[grade];
    currentWordIndex = 0;
    progress = 0;
    updateWord();
    updateProgress();
    updateStage();
    console.log(`Changed to grade ${grade}, words count: ${words.length}`); // 添加这行来调试
}

function updateWord() {
    const wordObj = words[currentWordIndex];
    document.getElementById('wordDisplay').textContent = `${wordObj.word} - ${wordObj.translation}`;
    document.getElementById('pronunciationGuide').textContent = `发音指南: ${wordObj.pronunciation}`;
    document.getElementById('phoneticDisplay').textContent = `音标: ${wordObj.phonetic}`;
    document.getElementById('feedback').textContent = '';
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('speakBtn').disabled = false;
    document.getElementById('playRecordingBtn').disabled = true;
}

function listen() {
    const wordObj = words[currentWordIndex];
    const utterance = new SpeechSynthesisUtterance(wordObj.word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

async function speak() {
    const wordObj = words[currentWordIndex];
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioRecording = new Audio(URL.createObjectURL(audioBlob));
            document.getElementById('playRecordingBtn').disabled = false;
            document.getElementById('feedback').textContent = '录音完成！点击"播"听你的发音。';
            document.getElementById('feedback').style.color = 'green';
        };

        mediaRecorder.start();
        document.getElementById('speakBtn').textContent = '停止录音';
        document.getElementById('speakBtn').onclick = stopRecording;
    } catch (err) {
        console.error('Error accessing microphone:', err);
        document.getElementById('feedback').textContent = '无法访问麦克风，请检查权限设置。';
        document.getElementById('feedback').style.color = 'red';
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        document.getElementById('speakBtn').textContent = '说';
        document.getElementById('speakBtn').onclick = speak;
    }
}

function playRecording() {
    if (audioRecording) {
        audioRecording.play();
    }
}

function nextWord() {
    currentWordIndex = (currentWordIndex + 1) % words.length;
    updateWord();
    if (currentWordIndex === 0) {
        currentStage++;
        updateStage();
    }
    if (Math.random() < 0.3) {
        startGame();
    } else if (Math.random() < 0.3) {
        startPhoneticGame();
    }
}

function updateProgress() {
    progress = (currentWordIndex / words.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    updateLevel();
}

function updateLevel() {
    const level = Math.floor(progress / 20);
    const levels = ['初学者', '入门', '基础', '中级', '高级'];
    document.getElementById('levelDisplay').textContent = `当前等级：${levels[level] || '大师'}`;
}

function updateStage() {
    const stages = ['单词认识', '听力练习', '口语练习', '阅读理解', '写作练习'];
    document.getElementById('stageDisplay').textContent = `当前阶段：${stages[currentStage - 1] || '高级学习'}`;
}

function startGame() {
    const gameContainer = document.querySelector('.game-container');
    const lessonContainer = document.querySelector('.lesson-container');
    
    gameContainer.style.display = 'block';
    lessonContainer.style.display = 'none';
    
    const currentWord = words[currentWordIndex];
    const options = [currentWord.translation, ...getRandomTranslations(3)];
    shuffleArray(options);
    
    document.getElementById('gameWord').textContent = currentWord.word;
    const optionsContainer = document.getElementById('gameOptions');
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('game-option');
        button.onclick = () => checkAnswer(option);
        optionsContainer.appendChild(button);
    });
}

function getRandomTranslations(count) {
    const translations = words.map(w => w.translation).filter(t => t !== words[currentWordIndex].translation);
    shuffleArray(translations);
    return translations.slice(0, count);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function checkAnswer(selectedTranslation) {
    if (selectedTranslation === words[currentWordIndex].translation) {
        document.getElementById('feedback').textContent = '答对了！真棒！';
        document.getElementById('feedback').style.color = 'green';
        setTimeout(() => {
            document.querySelector('.game-container').style.display = 'none';
            document.querySelector('.lesson-container').style.display = 'block';
            nextWord();
        }, 1500);
    } else {
        document.getElementById('feedback').textContent = '再想想，你可以的！';
        document.getElementById('feedback').style.color = 'red';
    }
}

function startPhoneticGame() {
    const gameContainer = document.querySelector('.game-container');
    const lessonContainer = document.querySelector('.lesson-container');
    
    gameContainer.style.display = 'block';
    lessonContainer.style.display = 'none';
    
    const currentWord = words[currentWordIndex];
    const options = [currentWord.phonetic, ...getRandomPhonetics(3)];
    shuffleArray(options);
    
    document.getElementById('gameWord').textContent = currentWord.word;
    const optionsContainer = document.getElementById('gameOptions');
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('game-option');
        button.onclick = () => checkPhoneticAnswer(option);
        optionsContainer.appendChild(button);
    });
}

function getRandomPhonetics(count) {
    const phonetics = words.map(w => w.phonetic).filter(p => p !== words[currentWordIndex].phonetic);
    shuffleArray(phonetics);
    return phonetics.slice(0, count);
}

function checkPhoneticAnswer(selectedPhonetic) {
    if (selectedPhonetic === words[currentWordIndex].phonetic) {
        document.getElementById('feedback').textContent = '音标正确！太棒了！';
        document.getElementById('feedback').style.color = 'green';
        setTimeout(() => {
            document.querySelector('.game-container').style.display = 'none';
            document.querySelector('.lesson-container').style.display = 'block';
            nextWord();
        }, 1500);
    } else {
        document.getElementById('feedback').textContent = '再想想，这个音标不太对哦。';
        document.getElementById('feedback').style.color = 'red';
    }
}

// 确保在文档加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    changeGrade(); // 这将加载默认年级（一年级）的单词
    updateStage();
});

// 每30分钟提醒学习
setInterval(() => {
    if (!document.hidden) {
        alert('翟浩宇，是时候学习新单词啦！');
    }
}, 30 * 60 * 1000);