// ==========================================================================
// DATA & STATE: PSYCHOQUEST & MINDPULSE SUITE
// ==========================================================================

const CLINICAL_CASES = [
  {
    id: 1,
    patientName: "Martín (24 años)",
    patientTag: "Motivo: Ansiedad ante Evaluaciones",
    avatar: "🧑‍💼",
    quote: '"Si desapruebo este examen final de psicopatología, mi carrera universitaria está arruinada para siempre y nunca conseguiré trabajo."',
    question: "¿Qué distorsión cognitiva predomina en la afirmación de Martín?",
    options: [
      {
        text: "A) Catastrofismo (Magnificación del peor escenario futuro)",
        correct: true,
        feedback: "¡Diagnóstico certero! El paciente anticipa consecuencias catastróficas irreversibles ('arruinada para siempre') sin evidencia empírica objetiva."
      },
      {
        text: "B) Razonamiento Emocional (Creer que es real porque se siente angustia)",
        correct: false,
        feedback: "No es la principal distorsión. El núcleo del sesgo radica en magnificar desproporcionadamente las consecuencias futuras."
      },
      {
        text: "C) Personalización (Asumir la culpa de hechos externos)",
        correct: false,
        feedback: "No aplica. El paciente no se responsabiliza de eventos ajenos, sino que anticipa una catástrofe personal extrema."
      },
      {
        text: "D) Pensamiento Ilusorio y Optimismo Ingenuo",
        correct: false,
        feedback: "Incorrecto. La valencia del pensamiento es intensamente disfórica y pesimista."
      }
    ]
  },
  {
    id: 2,
    patientName: "Valentina (28 años)",
    patientTag: "Motivo: Esquemas de Perfeccionismo / Autoexigencia",
    avatar: "👩‍💼",
    quote: '"Llegué 5 minutos tarde a la reunión matutina del equipo. Soy una completa incompetente y no sirvo para este trabajo."',
    question: "¿Cuál es la distorsión cognitiva y la intervención TCC indicada?",
    options: [
      {
        text: "A) Falacia de Control / Sugerir dimisión de su puesto de trabajo",
        correct: false,
        feedback: "No indicado. La intervención no desafía el sesgo absolutista y refuerza la evitación."
      },
      {
        text: "B) Pensamiento Todo o Nada (Dicotómico) / Técnica del continuo cognitivo y matices",
        correct: true,
        feedback: "¡Excelente abordaje! Valentina evalúa su valía profesional en términos blanco/negro ante un error menor. Trabajar en gradientes de desempeño restablece el equilibrio."
      },
      {
        text: "C) Sesgo de Confirmación / Prescripción farmacológica inmediata",
        correct: false,
        feedback: "No corresponde. Debe abordarse prioritariamente desde la psicoeducación y reestructuración de esquemas de pensamiento."
      },
      {
        text: "D) Adivinación de Futuro / Aislamiento laboral",
        correct: false,
        feedback: "Incorrecto. El sesgo principal es la autoevaluación polarizada (todo o nada)."
      }
    ]
  },
  {
    id: 3,
    patientName: "Esteban (31 años)",
    patientTag: "Motivo: Ansiedad Social en Presentaciones",
    avatar: "👨‍🔬",
    quote: '"Vi que un colega bostezó mientras yo exponía. Es 100% seguro que pensó que soy un incompetente y mi propuesta no vale nada."',
    question: "¿Qué distorsión cognitiva está presente en el juicio de Esteban?",
    options: [
      {
        text: "A) Descalificación de lo positivo",
        correct: false,
        feedback: "No es la distorsión central. No está minimizando un elogio, sino asumiendo conocer el juicio ajeno sin comprobarlo."
      },
      {
        text: "B) Inferencia Arbitraria: Lectura de Pensamiento",
        correct: true,
        feedback: "¡Brillante! Esteban concluye que conoce las intenciones y juicios del observador sin considerar hipótesis alternativas (como cansancio o falta de sueño del colega)."
      },
      {
        text: "C) Etiquetado rígido permanente",
        correct: false,
        feedback: "Secundario. El detonante cognitivo es la lectura arbitraria de la mente ajena."
      },
      {
        text: "D) Sesgo retrospectivo involuntario",
        correct: false,
        feedback: "Incorrecto. Se trata de una inferencia arbitraria en tiempo presente."
      }
    ]
  }
];

// ==========================================================================
// STATE VARIABLES
// ==========================================================================
let currentCaseIndex = 0;
let playerXP = 0;
let playerLives = 3;
let playerStreak = 0;
let maxStreak = 0;
let correctCount = 0;
let hasAnsweredCurrent = false;

let zenXP = 450;

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initGameEvents();
});

function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      switchTab(target);
    });
  });
}

function switchTab(tabKey) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  const activeTabBtn = document.querySelector(`.nav-tab[data-tab="${tabKey}"]`);
  const activePane = document.getElementById(`pane-${tabKey}`);

  if (activeTabBtn && activePane) {
    activeTabBtn.classList.add('active');
    activePane.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================================================
// SIMULATOR LOGIC (AULA)
// ==========================================================================
function initGameEvents() {
  const btnStart = document.getElementById('btn-start-game');
  const btnNext = document.getElementById('btn-next-question');
  const btnRetry = document.getElementById('btn-retry-question');
  const btnRestart = document.getElementById('btn-restart-game');

  if (btnStart) btnStart.addEventListener('click', startGame);
  if (btnNext) btnNext.addEventListener('click', nextCase);
  if (btnRetry) btnRetry.addEventListener('click', retryCurrentCase);
  if (btnRestart) btnRestart.addEventListener('click', restartGame);
}

function startGame() {
  currentCaseIndex = 0;
  playerXP = 0;
  playerLives = 3;
  playerStreak = 0;
  maxStreak = 0;
  correctCount = 0;
  updateStatsUI();

  showView('game-play-view');
  loadCase(currentCaseIndex);
}

function restartGame() {
  showView('game-intro-view');
}

function showView(viewId) {
  document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById(viewId);
  if (targetView) targetView.classList.add('active');
}

function loadCase(index) {
  hasAnsweredCurrent = false;
  const currentCase = CLINICAL_CASES[index];

  // Update headers
  document.getElementById('case-counter-badge').textContent = `Caso ${index + 1} de ${CLINICAL_CASES.length}`;
  document.getElementById('case-patient-name').textContent = `Paciente: ${currentCase.patientName}`;
  document.getElementById('case-tag').textContent = currentCase.patientTag;
  document.getElementById('patient-quote').textContent = currentCase.quote;
  document.getElementById('question-text').textContent = currentCase.question;

  // Hide feedback
  const feedbackPanel = document.getElementById('feedback-panel');
  feedbackPanel.classList.add('hidden');
  feedbackPanel.className = 'feedback-panel hidden';

  // Render options
  const optionsGrid = document.getElementById('options-grid');
  optionsGrid.innerHTML = '';

  currentCase.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.innerHTML = `<span class="opt-text">${opt.text}</span>`;
    btn.addEventListener('click', () => handleOptionSelect(opt, btn));
    optionsGrid.appendChild(btn);
  });

  // Update progress
  const progressPercent = (index / CLINICAL_CASES.length) * 100;
  document.getElementById('game-progress').style.width = `${progressPercent}%`;
}

function handleOptionSelect(option, buttonElem) {
  if (hasAnsweredCurrent) return;
  hasAnsweredCurrent = true;

  // Disable all options
  document.querySelectorAll('.btn-option').forEach(b => b.disabled = true);

  const feedbackPanel = document.getElementById('feedback-panel');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackMsg = document.getElementById('feedback-msg');
  const feedbackIcon = document.getElementById('feedback-icon');
  const btnNext = document.getElementById('btn-next-question');
  const btnRetry = document.getElementById('btn-retry-question');

  if (option.correct) {
    buttonElem.classList.add('correct');
    playerXP += 100;
    playerStreak += 1;
    correctCount++;
    if (playerStreak > maxStreak) maxStreak = playerStreak;

    feedbackPanel.className = 'feedback-panel success';
    feedbackIcon.textContent = '🎉';
    feedbackTitle.textContent = '¡Diagnóstico Correcto! (+100 XP)';
    feedbackMsg.textContent = option.feedback;

    btnNext.classList.remove('hidden');
    btnRetry.classList.add('hidden');

    if (typeof confetti === 'function') {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }
  } else {
    buttonElem.classList.add('incorrect');
    playerLives = Math.max(0, playerLives - 1);
    playerStreak = 0;

    feedbackPanel.className = 'feedback-panel error';
    feedbackIcon.textContent = '⚠️';
    feedbackTitle.textContent = 'Diagnóstico No Óptimo';
    feedbackMsg.textContent = option.feedback;

    if (playerLives > 0) {
      btnNext.classList.add('hidden');
      btnRetry.classList.remove('hidden');
    } else {
      feedbackMsg.textContent += " Has agotado tus oportunidades clínicas en esta ronda.";
      btnNext.classList.remove('hidden');
      btnRetry.classList.add('hidden');
    }
  }

  feedbackPanel.classList.remove('hidden');
  updateStatsUI();
}

function retryCurrentCase() {
  hasAnsweredCurrent = false;
  const feedbackPanel = document.getElementById('feedback-panel');
  feedbackPanel.classList.add('hidden');

  document.querySelectorAll('.btn-option').forEach(b => {
    b.disabled = false;
    b.classList.remove('incorrect');
  });
}

function nextCase() {
  if (currentCaseIndex < CLINICAL_CASES.length - 1) {
    currentCaseIndex++;
    loadCase(currentCaseIndex);
  } else {
    finishGame();
  }
}

function finishGame() {
  document.getElementById('game-progress').style.width = '100%';
  showView('game-result-view');

  document.getElementById('final-score').textContent = `${playerXP} XP`;
  document.getElementById('final-streak').textContent = `${maxStreak} 🔥`;
  
  const accuracy = Math.round((correctCount / CLINICAL_CASES.length) * 100);
  document.getElementById('final-accuracy').textContent = `${accuracy}%`;

  if (playerXP >= 200) {
    document.getElementById('result-trophy').textContent = '🏆';
    document.getElementById('result-title').textContent = '¡Acreditación Clínica Lograda!';
    document.getElementById('result-desc').textContent = 'Has demostrado un dominio excepcional en la detección y reestructuración de distorsiones cognitivas.';
    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
    }
  } else {
    document.getElementById('result-trophy').textContent = '📜';
    document.getElementById('result-title').textContent = 'Sesión Finalizada';
    document.getElementById('result-desc').textContent = 'Puedes repasar los conceptos clínicos y realizar otra consulta de entrenamiento.';
  }
}

function updateStatsUI() {
  document.getElementById('player-xp').textContent = `${playerXP} XP`;
  document.getElementById('player-streak').textContent = `🔥 ${playerStreak}`;

  const playerTitle = document.getElementById('player-title');
  if (playerXP >= 300) playerTitle.textContent = "Terapeuta Senior ⭐";
  else if (playerXP >= 150) playerTitle.textContent = "Terapeuta Residente 📘";
  else playerTitle.textContent = "Interno Novato 🟢";

  const heartsContainer = document.getElementById('player-lives');
  heartsContainer.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.textContent = i < playerLives ? '❤️' : '🖤';
    heartsContainer.appendChild(heart);
  }
}

// ==========================================================================
// CORPORATE WORKSPACE INTERACTION (EMPRESA)
// ==========================================================================
function completeCorporateTask(taskId, points, msg) {
  zenXP += points;
  updateCorporateUI();
  
  const taskCard = document.getElementById(`task-${taskId}`);
  if (taskCard) {
    taskCard.style.opacity = '0.6';
    const btn = taskCard.querySelector('button');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '✅ Realizado hoy';
      btn.className = 'btn btn-secondary btn-sm';
    }
  }

  // Add item to activity log
  addActivityLog(`Completaste una micro-pausa activa (+${points} ZenXP)`);
}

function registerMood(moodName) {
  zenXP += 30;
  updateCorporateUI();
  addActivityLog(`Registraste tu check-in de ánimo: "${moodName}" (+30 ZenXP)`);
}

function redeemReward(rewardName, cost) {
  if (zenXP >= cost) {
    zenXP -= cost;
    updateCorporateUI();
    addActivityLog(`Canjeaste la recompensa: "${rewardName}"`);
    alert(`🎉 ¡Canje exitoso!\nHas desbloqueado: "${rewardName}".\nTu nuevo saldo es ${zenXP} ZenXP.`);
    if (typeof confetti === 'function') {
      confetti({ particleCount: 40, spread: 50 });
    }
  } else {
    alert(`⚠️ Puntos insuficientes. Necesitas ${cost} ZenXP y cuentas con ${zenXP} ZenXP.`);
  }
}

function updateCorporateUI() {
  const display = document.getElementById('zen-points-display');
  if (display) display.textContent = `⚡ ${zenXP} ZenXP`;
}

function addActivityLog(text) {
  const logContainer = document.getElementById('activity-log');
  if (!logContainer) return;

  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML = `<span class="log-dot"></span><p><strong>Tú</strong> ${text}.</p>`;
  logContainer.insertBefore(item, logContainer.firstChild);
}
