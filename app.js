// ==========================================================================
// DATA & STATE: PSYCHOQUEST & MINDPULSE SUITE (WITH HYBRID PERSISTENCE)
// ==========================================================================

// Supabase Configuration (Official Project Integration + Local Fallback)
const SUPABASE_CONFIG = {
  url: 'https://oeymgclqslgvrqlhruty.supabase.co',
  anonKey: 'sb_publishable_7ZurdpCSncXBeIRKy_T67A_iP1Yj0Dx'
};

let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_CONFIG.url) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log("Supabase Client conectado exitosamente al proyecto UDD:", SUPABASE_CONFIG.url);
  } catch (e) {
    console.warn("Supabase init error, continuando con almacenamiento local:", e);
  }
}

const STORAGE_KEYS = {
  CLINICAL_SESSION: 'udd_psycho_clinical_session',
  ZEN_POINTS: 'udd_mindpulse_zen_xp',
  COMPLETED_TASKS: 'udd_mindpulse_completed_tasks',
  ACTIVITY_LOG: 'udd_mindpulse_activity_log',
  REDEEMED_REWARDS: 'udd_mindpulse_redeemed_rewards'
};

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

let zenXP = parseInt(localStorage.getItem(STORAGE_KEYS.ZEN_POINTS)) || 450;
let completedTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS)) || [];
let activityLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG)) || [
  { text: "Tomás R. completó 5 min de pausa activa. (+50 ZenXP)", user: "Tomás R." },
  { text: "Camila S. envió un Kudo a Matías F.: 'Excelente soporte en el proyecto'.", user: "Camila S." },
  { text: "Escuadra Innovación desbloqueó la insignia 'Zen Masters UDD 🌟'.", user: "Escuadra Innovación" }
];

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initGameEvents();
  loadSavedCorporateState();
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

  // Persist session history
  saveClinicalSession({
    score: playerXP,
    accuracy: accuracy,
    maxStreak: maxStreak,
    date: new Date().toISOString()
  });

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

function saveClinicalSession(sessionData) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLINICAL_SESSION)) || [];
    history.push(sessionData);
    localStorage.setItem(STORAGE_KEYS.CLINICAL_SESSION, JSON.stringify(history));

    if (supabaseClient) {
      supabaseClient.from('clinical_sessions').insert([sessionData]).then(() => {
        console.log("Synced clinical session to Supabase.");
      }).catch(err => console.warn("Supabase sync:", err));
    }
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// ==========================================================================
// CORPORATE WORKSPACE INTERACTION (EMPRESA & PERSISTENCE)
// ==========================================================================
function completeCorporateTask(taskId, points, msg) {
  zenXP += points;
  if (!completedTasks.includes(taskId)) {
    completedTasks.push(taskId);
  }
  
  saveCorporateState();
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

  addActivityLog(`Completaste una micro-pausa activa (+${points} ZenXP)`);
}

function registerMood(moodName) {
  zenXP += 30;
  saveCorporateState();
  updateCorporateUI();
  addActivityLog(`Registraste tu check-in de ánimo: "${moodName}" (+30 ZenXP)`);
  
  if (typeof confetti === 'function') {
    confetti({ particleCount: 25, spread: 40 });
  }
}

function redeemReward(rewardName, cost) {
  if (zenXP >= cost) {
    zenXP -= cost;
    saveCorporateState();
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
  const item = { text: `Tú ${text}.`, user: "Tú", timestamp: new Date().toLocaleTimeString() };
  activityLogs.unshift(item);
  if (activityLogs.length > 10) activityLogs.pop();
  
  saveCorporateState();
  renderActivityLogs();
}

function renderActivityLogs() {
  const logContainer = document.getElementById('activity-log');
  if (!logContainer) return;

  logContainer.innerHTML = '';
  activityLogs.forEach(log => {
    const div = document.createElement('div');
    div.className = 'log-item';
    div.innerHTML = `<span class="log-dot"></span><p><strong>${log.user}</strong> ${log.text.replace(/^Tú\s*/, '')}</p>`;
    logContainer.appendChild(div);
  });
}

function saveCorporateState() {
  try {
    localStorage.setItem(STORAGE_KEYS.ZEN_POINTS, zenXP.toString());
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(completedTasks));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(activityLogs));

    if (supabaseClient) {
      supabaseClient.from('user_zen_state').upsert([{
        user_id: 'default_user',
        zen_points: zenXP,
        completed_tasks: completedTasks,
        updated_at: new Date().toISOString()
      }]).catch(err => console.warn("Supabase sync:", err));
    }
  } catch (e) {
    console.error("Save state error:", e);
  }
}

function loadSavedCorporateState() {
  updateCorporateUI();
  renderActivityLogs();

  completedTasks.forEach(taskId => {
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
  });
}
