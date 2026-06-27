// Main Application State
const appState = {
  currentUser: null,
  currentPage: 'login',
  finances: {
    workSavings: [],
    momsAllowance: []
  },
  documents: [],
  korean: {
    known: [],
    toLearn: [],
    classNotes: []
  },
  calendar: [],
  bibleVerse: {}
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  checkAuthStatus();
});

function initializeApp() {
  console.log('Initializing Life Hub...');
  renderApp();
}

function checkAuthStatus() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      appState.currentUser = user;
      appState.currentPage = 'dashboard';
      loadUserData();
      renderApp();
    } else {
      appState.currentPage = 'login';
      renderApp();
    }
  });
}

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (!appState.currentUser) {
    renderLoginPage();
  } else {
    renderMainApp();
  }
}

function renderLoginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container" style="margin-top: 5rem;">
      <div class="card" style="max-width: 500px; margin: 0 auto;">
        <h2 style="text-align: center; margin-bottom: 2rem;">🌸 Welcome to Life Hub 🌸</h2>
        
        <div id="auth-toggle" style="display: flex; gap: 1rem; margin-bottom: 2rem;">
          <button class="auth-btn active" onclick="toggleAuthMode('login')" style="flex: 1; background: var(--primary);">Login</button>
          <button class="auth-btn" onclick="toggleAuthMode('signup')" style="flex: 1; background: var(--light); border: 2px solid var(--primary);">Sign Up</button>
        </div>
        
        <div id="login-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="login-email" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="login-password" placeholder="••••••••">
          </div>
          <button onclick="handleLogin()" style="width: 100%; margin-top: 1rem;">Login</button>
          <div id="login-error" class="error" style="margin-top: 1rem; text-align: center;"></div>
        </div>
        
        <div id="signup-form" class="hidden">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="signup-email" placeholder="your@email.com">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="signup-password" placeholder="••••••••">
          </div>
          <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" id="signup-confirm" placeholder="••••••••">
          </div>
          <button onclick="handleSignup()" style="width: 100%; margin-top: 1rem;">Create Account</button>
          <div id="signup-error" class="error" style="margin-top: 1rem; text-align: center;"></div>
        </div>
      </div>
    </div>
  `;
}

function renderMainApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <nav class="navbar">
      <h1>🌸 Life Hub 🌸</h1>
      <ul class="nav-links">
        <button onclick="navigateTo('dashboard')">📊 Dashboard</button>
        <button onclick="navigateTo('finances')">💰 Finances</button>
        <button onclick="navigateTo('documents')">📄 Documents</button>
        <button onclick="navigateTo('korean')">🗣️ Korean</button>
        <button onclick="navigateTo('calendar')">📅 Calendar</button>
        <button onclick="downloadAllData()">⬇️ Download</button>
        <button onclick="handleLogout()">🚪 Logout</button>
      </ul>
    </nav>
    <div class="container">
      <div id="page-content"></div>
    </div>
  `;

  renderPageContent();
}

function renderPageContent() {
  const pageContent = document.getElementById('page-content');
  
  switch(appState.currentPage) {
    case 'dashboard':
      renderDashboard(pageContent);
      break;
    case 'finances':
      renderFinances(pageContent);
      break;
    case 'documents':
      renderDocuments(pageContent);
      break;
    case 'korean':
      renderKorean(pageContent);
      break;
    case 'calendar':
      renderCalendar(pageContent);
      break;
    default:
      renderDashboard(pageContent);
  }
}

// Navigation
function navigateTo(page) {
  appState.currentPage = page;
  renderPageContent();
  window.scrollTo(0, 0);
}

function toggleAuthMode(mode) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const buttons = document.querySelectorAll('.auth-btn');
  
  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (mode === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    buttons[0].classList.add('active');
    buttons[0].style.background = 'var(--primary)';
    buttons[1].style.background = 'var(--light)';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    buttons[1].classList.add('active');
    buttons[0].style.background = 'var(--light)';
    buttons[1].style.background = 'var(--primary)';
  }
}

// Auth Functions
async function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  
  if (!email || !password) {
    errorDiv.textContent = 'Please fill in all fields';
    return;
  }
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    appState.currentUser = auth.currentUser;
    appState.currentPage = 'dashboard';
    await loadUserData();
    renderApp();
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

async function handleSignup() {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  const errorDiv = document.getElementById('signup-error');
  
  if (!email || !password || !confirm) {
    errorDiv.textContent = 'Please fill in all fields';
    return;
  }
  
  if (password !== confirm) {
    errorDiv.textContent = 'Passwords do not match';
    return;
  }
  
  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    return;
  }
  
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    appState.currentUser = auth.currentUser;
    await createUserDocument();
    appState.currentPage = 'dashboard';
    renderApp();
  } catch (error) {
    errorDiv.textContent = error.message;
  }
}

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      await auth.signOut();
      appState.currentUser = null;
      appState.currentPage = 'login';
      renderApp();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

// Dashboard
function renderDashboard(pageContent) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  let bibleHTML = '';
  if (appState.bibleVerse && appState.bibleVerse.text) {
    bibleHTML = `
      <div class="bible-verse">
        <p>"${appState.bibleVerse.text}"</p>
        <p class="bible-reference">— ${appState.bibleVerse.reference}</p>
      </div>
    `;
  }
  
  const totalWorkSavings = appState.finances.workSavings.reduce((sum, item) => sum + item.amount, 0);
  const totalSpending = appState.finances.momsAllowance.reduce((sum, item) => sum + item.amount, 0);
  
  const todayEvents = appState.calendar.filter(e => e.date === new Date().toISOString().split('T')[0]);
  
  pageContent.innerHTML = `
    <div class="fade-in">
      <h1 style="margin-bottom: 1rem; font-size: 2.5rem;">Welcome back, ${appState.currentUser.email.split('@')[0]}! 🌸</h1>
      <p style="font-size: 1.1rem; color: rgba(61, 44, 77, 0.8); margin-bottom: 2rem;">Today is ${today}</p>
      
      ${bibleHTML}
      
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>💼 Work Savings</h3>
          <div class="dashboard-value">₩${totalWorkSavings.toLocaleString('ko-KR')}</div>
          <div class="dashboard-subtitle">Income from work</div>
        </div>
        
        <div class="dashboard-card">
          <h3>🛍️ Spending</h3>
          <div class="dashboard-value">₩${totalSpending.toLocaleString('ko-KR')}</div>
          <div class="dashboard-subtitle">From mom's allowance</div>
        </div>
        
        <div class="dashboard-card">
          <h3>📚 Korean Progress</h3>
          <div class="dashboard-value">${appState.korean.known.length}</div>
          <div class="dashboard-subtitle">Words learned</div>
        </div>
      </div>
      
      <div class="card">
        <h2>📅 Today's Schedule</h2>
        ${todayEvents.length > 0 ? `
          <div>
            ${todayEvents.map(e => `<div class="list-item"><div><strong>${e.title}</strong><br><small>${e.description || 'No description'}</small></div></div>`).join('')}
          </div>
        ` : '<p style="text-align: center; color: rgba(61, 44, 77, 0.6);">No events scheduled for today</p>'}
      </div>
    </div>
  `;
  
  // Fetch Bible verse if not already loaded
  if (!appState.bibleVerse.text) {
    fetchBibleVerse();
  }
}

async function fetchBibleVerse() {
  try {
    const verses = [
      { text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", reference: "John 3:16" },
      { text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13" },
      { text: "The Lord is my light and my salvation; whom shall I fear?", reference: "Psalm 27:1" },
      { text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding.", reference: "Proverbs 3:5" },
      { text: "Peace I leave with you, my peace I give unto you.", reference: "John 14:27" },
      { text: "Let all that you do be done in love.", reference: "1 Corinthians 16:14" },
      { text: "The joy of the Lord is your strength.", reference: "Nehemiah 8:10" },
      { text: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" }
    ];
    const verse = verses[Math.floor(Math.random() * verses.length)];
    appState.bibleVerse = verse;
    renderPageContent();
  } catch (error) {
    console.log('Using local Bible verses');
  }
}

// Finances Section
function renderFinances(pageContent) {
  pageContent.innerHTML = `
    <div class="fade-in">
      <h1 style="margin-bottom: 2rem;">💰 Finances Management</h1>
      
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>💼 Total Work Savings</h3>
          <div class="dashboard-value">₩${appState.finances.workSavings.reduce((s, i) => s + i.amount, 0).toLocaleString('ko-KR')}</div>
        </div>
        <div class="dashboard-card">
          <h3>🛍️ Total Spending</h3>
          <div class="dashboard-value">₩${appState.finances.momsAllowance.reduce((s, i) => s + i.amount, 0).toLocaleString('ko-KR')}</div>
        </div>
      </div>
      
      <div class="card">
        <h2>➕ Add Income (Work Savings)</h2>
        <div class="form-group">
          <label>Date</label>
          <input type="date" id="income-date">
        </div>
        <div class="form-group">
          <label>Amount (₩)</label>
          <input type="number" id="income-amount" placeholder="Enter amount in Won">
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="income-desc" placeholder="e.g., Monthly salary">
        </div>
        <button onclick="addIncome()" style="width: 100%;">Add Income</button>
      </div>
      
      <div class="card">
        <h2>➖ Add Spending (Mom's Allowance)</h2>
        <div class="form-group">
          <label>Date</label>
          <input type="date" id="spending-date">
        </div>
        <div class="form-group">
          <label>Amount (₩)</label>
          <input type="number" id="spending-amount" placeholder="Enter amount in Won">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="spending-category">
            <option>Food</option>
            <option>Transport</option>
            <option>Shopping</option>
            <option>Entertainment</option>
            <option>Education</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="spending-desc" placeholder="e.g., Lunch at restaurant">
        </div>
        <button onclick="addSpending()" style="width: 100%;">Add Spending</button>
      </div>
      
      <div class="card">
        <h2>💼 Work Savings History</h2>
        <table class="finance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${appState.finances.workSavings.length > 0 ? appState.finances.workSavings.map((item, idx) => `
              <tr>
                <td>${item.date}</td>
                <td>₩${item.amount.toLocaleString('ko-KR')}</td>
                <td>${item.description}</td>
                <td><button class="list-item-delete" onclick="deleteIncome(${idx})">Delete</button></td>
              </tr>
            `).join('') : '<tr><td colspan="4" style="text-align: center; color: rgba(61, 44, 77, 0.6);">No income entries yet</td></tr>'}
          </tbody>
        </table>
      </div>
      
      <div class="card">
        <h2>🛍️ Spending History</h2>
        <table class="finance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${appState.finances.momsAllowance.length > 0 ? appState.finances.momsAllowance.map((item, idx) => `
              <tr>
                <td>${item.date}</td>
                <td>₩${item.amount.toLocaleString('ko-KR')}</td>
                <td>${item.category}</td>
                <td>${item.description}</td>
                <td><button class="list-item-delete" onclick="deleteSpending(${idx})">Delete</button></td>
              </tr>
            `).join('') : '<tr><td colspan="5" style="text-align: center; color: rgba(61, 44, 77, 0.6);">No spending entries yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('income-date').value = today;
  document.getElementById('spending-date').value = today;
}

function addIncome() {
  const date = document.getElementById('income-date').value;
  const amount = parseFloat(document.getElementById('income-amount').value);
  const desc = document.getElementById('income-desc').value;
  
  if (!date || !amount || amount <= 0) {
    alert('Please fill in all fields with valid data');
    return;
  }
  
  appState.finances.workSavings.push({ date, amount, description: desc || 'Income' });
  saveUserData();
  renderPageContent();
}

function addSpending() {
  const date = document.getElementById('spending-date').value;
  const amount = parseFloat(document.getElementById('spending-amount').value);
  const category = document.getElementById('spending-category').value;
  const desc = document.getElementById('spending-desc').value;
  
  if (!date || !amount || amount <= 0) {
    alert('Please fill in all fields with valid data');
    return;
  }
  
  appState.finances.momsAllowance.push({ date, amount, category, description: desc || 'Spending' });
  saveUserData();
  renderPageContent();
}

function deleteIncome(idx) {
  if (confirm('Delete this income entry?')) {
    appState.finances.workSavings.splice(idx, 1);
    saveUserData();
    renderPageContent();
  }
}

function deleteSpending(idx) {
  if (confirm('Delete this spending entry?')) {
    appState.finances.momsAllowance.splice(idx, 1);
    saveUserData();
    renderPageContent();
  }
}

// Documents Section
function renderDocuments(pageContent) {
  pageContent.innerHTML = `
    <div class="fade-in">
      <h1 style="margin-bottom: 2rem;">📄 Important Documents</h1>
      
      <div class="card">
        <h2>Upload Document</h2>
        <div class="form-group">
          <label>Document Type</label>
          <select id="doc-type">
            <option>Passport</option>
            <option>Identification</option>
            <option>Housing Contract</option>
            <option>Insurance</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Select File</label>
          <input type="file" id="doc-file" accept="image/*,application/pdf">
        </div>
        <button onclick="uploadDocument()" style="width: 100%;">Upload Document</button>
      </div>
      
      <div class="card">
        <h2>Your Documents</h2>
        ${appState.documents.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem;">
            ${appState.documents.map((doc, idx) => `
              <div class="dashboard-card">
                <h3>${doc.type}</h3>
                <p style="font-size: 0.9rem; color: rgba(61, 44, 77, 0.8); margin: 1rem 0;">Uploaded: ${doc.uploadedDate}</p>
                <button onclick="downloadDocument(${idx})" style="margin-right: 0.5rem;">⬇️ Download</button>
                <button class="list-item-delete" onclick="deleteDocument(${idx})">Delete</button>
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align: center; color: rgba(61, 44, 77, 0.6);">No documents uploaded yet</p>'}
      </div>
    </div>
  `;
}

function uploadDocument() {
  const fileInput = document.getElementById('doc-file');
  const docType = document.getElementById('doc-type').value;
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select a file to upload');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    appState.documents.push({
      type: docType,
      data: e.target.result,
      fileName: file.name,
      uploadedDate: new Date().toLocaleDateString()
    });
    saveUserData();
    renderPageContent();
  };
  reader.readAsDataURL(file);
}

function downloadDocument(idx) {
  const doc = appState.documents[idx];
  const link = document.createElement('a');
  link.href = doc.data;
  link.download = doc.fileName;
  link.click();
}

function deleteDocument(idx) {
  if (confirm('Delete this document?')) {
    appState.documents.splice(idx, 1);
    saveUserData();
    renderPageContent();
  }
}

// Korean Learning Section
function renderKorean(pageContent) {
  pageContent.innerHTML = `
    <div class="fade-in">
      <h1 style="margin-bottom: 2rem;">🗣️ Korean Learning Hub</h1>
      
      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h3>✅ Words Known</h3>
          <div class="dashboard-value">${appState.korean.known.length}</div>
        </div>
        <div class="dashboard-card">
          <h3>⏳ To Learn</h3>
          <div class="dashboard-value">${appState.korean.toLearn.length}</div>
        </div>
        <div class="dashboard-card">
          <h3>📚 Total Progress</h3>
          <div class="dashboard-value">${Math.round((appState.korean.known.length / (appState.korean.known.length + appState.korean.toLearn.length || 1)) * 100)}%</div>
        </div>
      </div>
      
      <div class="card">
        <h2>➕ Add New Word/Phrase</h2>
        <div class="form-group">
          <label>Korean Word/Phrase</label>
          <input type="text" id="korean-word" placeholder="e.g., 안녕하세요">
        </div>
        <div class="form-group">
          <label>English Translation</label>
          <input type="text" id="korean-trans" placeholder="e.g., Hello">
        </div>
        <div class="form-group">
          <label>Grammar/Notes</label>
          <textarea id="korean-notes" placeholder="e.g., Formal greeting, polite form" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="korean-status">
            <option value="toLearn">⏳ To Learn</option>
            <option value="known">✅ Already Know</option>
          </select>
        </div>
        <button onclick="addKoreanWord()" style="width: 100%;">Add Word</button>
      </div>
      
      <div class="card">
        <h2>📝 Upload Class Notes</h2>
        <div class="form-group">
          <label>Select Image(s) of Class Notes</label>
          <input type="file" id="notes-file" accept="image/*" multiple>
        </div>
        <button onclick="uploadClassNotes()" style="width: 100%;">Upload Notes</button>
      </div>
      
      <div class="card">
        <h2>📚 Flashcard Study</h2>
        <button onclick="startFlashcards()" style="width: 100%; margin-bottom: 1rem;">🎴 Start Flashcards</button>
        <button onclick="startQuiz()" style="width: 100%;">🎯 Take Mini Quiz</button>
      </div>
      
      <div class="card">
        <h2>✅ Words I Know</h2>
        ${appState.korean.known.length > 0 ? `
          <div style="display: grid; gap: 1rem;">
            ${appState.korean.known.map((word, idx) => `
              <div class="list-item">
                <div>
                  <strong>${word.korean}</strong> - ${word.english}<br>
                  <small style="color: rgba(61, 44, 77, 0.7);">${word.notes}</small>
                </div>
                <button class="list-item-delete" onclick="moveWord(${idx}, 'known', 'toLearn')">Move to Learn</button>
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align: center; color: rgba(61, 44, 77, 0.6);">No words added yet</p>'}
      </div>
      
      <div class="card">
        <h2>⏳ Words to Learn</h2>
        ${appState.korean.toLearn.length > 0 ? `
          <div style="display: grid; gap: 1rem;">
            ${appState.korean.toLearn.map((word, idx) => `
              <div class="list-item">
                <div>
                  <strong>${word.korean}</strong> - ${word.english}<br>
                  <small style="color: rgba(61, 44, 77, 0.7);">${word.notes}</small>
                </div>
                <button class="list-item-delete" onclick="moveWord(${idx}, 'toLearn', 'known')" style="background: var(--success);">Mark as Known</button>
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align: center; color: rgba(61, 44, 77, 0.6);">No words to learn yet</p>'}
      </div>
    </div>
  `;
}

function addKoreanWord() {
  const korean = document.getElementById('korean-word').value;
  const english = document.getElementById('korean-trans').value;
  const notes = document.getElementById('korean-notes').value;
  const status = document.getElementById('korean-status').value;
  
  if (!korean || !english) {
    alert('Please fill in both Korean and English fields');
    return;
  }
  
  const word = { korean, english, notes };
  
  if (status === 'known') {
    appState.korean.known.push(word);
  } else {
    appState.korean.toLearn.push(word);
  }
  
  saveUserData();
  renderPageContent();
}

function moveWord(idx, fromStatus, toStatus) {
  const word = appState.korean[fromStatus][idx];
  appState.korean[fromStatus].splice(idx, 1);
  appState.korean[toStatus].push(word);
  saveUserData();
  renderPageContent();
}

function uploadClassNotes() {
  const fileInput = document.getElementById('notes-file');
  const files = fileInput.files;
  
  if (files.length === 0) {
    alert('Please select at least one image');
    return;
  }
  
  let uploadedCount = 0;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      appState.korean.classNotes = appState.korean.classNotes || [];
      appState.korean.classNotes.push({
        fileName: file.name,
        data: e.target.result,
        uploadedDate: new Date().toLocaleDateString()
      });
      uploadedCount++;
      if (uploadedCount === files.length) {
        saveUserData();
        renderPageContent();
      }
    };
    reader.readAsDataURL(file);
  });
  
  alert('Notes uploading...');
}

function startFlashcards() {
  if (appState.korean.toLearn.length === 0) {
    alert('No words to study. Add words to your "To Learn" list first.');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>
      <h2 style="text-align: center; margin-bottom: 2rem;">🎴 Flashcard Study</h2>
      <div id="flashcard-container"></div>
      <div style="margin-top: 2rem; text-align: center;">
        <button onclick="nextFlashcard()" style="margin-right: 1rem;">Next ➡️</button>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: var(--error); color: white;">Done ✓</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  window.currentFlashcardIdx = 0;
  showFlashcard();
}

function showFlashcard() {
  const word = appState.korean.toLearn[window.currentFlashcardIdx];
  const container = document.getElementById('flashcard-container');
  
  container.innerHTML = `
    <div class="flashcard" onclick="toggleFlashcard()">
      <div class="flashcard-content" id="flashcard-content">
        <div class="flashcard-label">Korean</div>
        <div class="flashcard-text">${word.korean}</div>
      </div>
    </div>
    <p style="text-align: center; margin-top: 1.5rem; color: rgba(61, 44, 77, 0.7);">Card ${window.currentFlashcardIdx + 1} of ${appState.korean.toLearn.length}</p>
  `;
  
  window.flashcardFlipped = false;
}

function toggleFlashcard() {
  const word = appState.korean.toLearn[window.currentFlashcardIdx];
  const content = document.getElementById('flashcard-content');
  
  window.flashcardFlipped = !window.flashcardFlipped;
  
  if (window.flashcardFlipped) {
    content.innerHTML = `
      <div class="flashcard-label">English Translation</div>
      <div class="flashcard-text">${word.english}</div>
      ${word.notes ? `<div style="margin-top: 1rem; font-size: 0.9rem; color: rgba(61, 44, 77, 0.7);">Notes: ${word.notes}</div>` : ''}
    `;
  } else {
    content.innerHTML = `
      <div class="flashcard-label">Korean</div>
      <div class="flashcard-text">${word.korean}</div>
    `;
  }
}

function nextFlashcard() {
  window.currentFlashcardIdx++;
  if (window.currentFlashcardIdx >= appState.korean.toLearn.length) {
    window.currentFlashcardIdx = 0;
  }
  showFlashcard();
}

function startQuiz() {
  if (appState.korean.toLearn.length === 0) {
    alert('No words to quiz on. Add words to your "To Learn" list first.');
    return;
  }
  
  // Shuffle words for quiz
  const shuffled = [...appState.korean.toLearn].sort(() => Math.random() - 0.5).slice(0, Math.min(5, appState.korean.toLearn.length));
  
  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
      <span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>
      <h2 style="text-align: center; margin-bottom: 2rem;">🎯 Mini Quiz</h2>
      <div id="quiz-container"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  window.quizData = { words: shuffled, score: 0, currentQ: 0 };
  showQuizQuestion();
}

function showQuizQuestion() {
  if (window.quizData.currentQ >= window.quizData.words.length) {
    const container = document.getElementById('quiz-container');
    const percentage = Math.round((window.quizData.score / window.quizData.words.length) * 100);
    container.innerHTML = `
      <div style="text-align: center;">
        <h3 style="font-size: 2rem; margin-bottom: 1rem;">Quiz Complete! 🎉</h3>
        <p style="font-size: 1.5rem; margin-bottom: 1rem;">Your Score: ${window.quizData.score}/${window.quizData.words.length} (${percentage}%)</p>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="width: 100%;">Close</button>
      </div>
    `;
    return;
  }
  
  const word = window.quizData.words[window.quizData.currentQ];
  const options = [word.english, ...appState.korean.toLearn.filter(w => w !== word).map(w => w.english).sort(() => Math.random() - 0.5).slice(0, 2)].sort(() => Math.random() - 0.5);
  
  const container = document.getElementById('quiz-container');
  container.innerHTML = `
    <p style="text-align: center; margin-bottom: 1.5rem; color: rgba(61, 44, 77, 0.7);">Question ${window.quizData.currentQ + 1} of ${window.quizData.words.length}</p>
    <p style="font-size: 1.3rem; text-align: center; margin-bottom: 2rem; font-weight: 600;">What does this mean?</p>
    <p style="font-size: 1.8rem; text-align: center; margin-bottom: 2rem; background: linear-gradient(135deg, var(--accent) 0%, var(--tertiary) 100%); padding: 1rem; border-radius: 15px;">${word.korean}</p>
    <div style="display: grid; gap: 1rem;">
      ${options.map((opt, idx) => `
        <button onclick="checkAnswer('${opt}', '${word.english}')" style="text-align: left; padding: 1rem; background: var(--light); border: 2px solid var(--primary); border-radius: 10px; cursor: pointer; transition: all 0.3s ease; font-family: 'Fredoka', sans-serif; font-weight: 600;" onmouseover="this.style.background='var(--primary)'" onmouseout="this.style.background='var(--light)'">
          ${String.fromCharCode(65 + idx)}. ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    window.quizData.score++;
    alert('✅ Correct!');
  } else {
    alert(`❌ Wrong! The correct answer is: ${correct}`);
  }
  window.quizData.currentQ++;
  showQuizQuestion();
}

// Calendar Section
function renderCalendar(pageContent) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  let calendarHTML = `<div style="text-align: center; font-size: 1.3rem; font-weight: 600; margin-bottom: 1.5rem;">${monthName}</div>`;
  calendarHTML += `<div class="calendar-container">`;
  
  // Day headers
  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayHeaders.forEach(day => {
    calendarHTML += `<div style="font-weight: 700; text-align: center; padding: 0.5rem; border-bottom: 2px solid var(--primary);">${day}</div>`;
  });
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    calendarHTML += `<div class="calendar-day" style="background: rgba(255, 255, 255, 0.3);"></div>`;
  }
  
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasEvent = appState.calendar.some(e => e.date === dateStr);
    const dayEvents = appState.calendar.filter(e => e.date === dateStr);
    
    calendarHTML += `
      <div class="calendar-day ${hasEvent ? 'event' : ''}">
        <div style="font-weight: 700;">${day}</div>
        ${dayEvents.map(e => `<small style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.7rem;">${e.title}</small>`).join('')}
      </div>
    `;
  }
  
  calendarHTML += `</div>`;
  
  pageContent.innerHTML = `
    <div class="fade-in">
      <h1 style="margin-bottom: 2rem;">📅 Calendar & Schedule</h1>
      
      <div class="card">
        <h2>➕ Add Event</h2>
        <div class="form-group">
          <label>Date</label>
          <input type="date" id="event-date">
        </div>
        <div class="form-group">
          <label>Event Title</label>
          <input type="text" id="event-title" placeholder="e.g., School, Vacation, Birthday">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select id="event-category">
            <option>School</option>
            <option>Vacation</option>
            <option>Personal</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea id="event-desc" placeholder="Details about this event" rows="3"></textarea>
        </div>
        <button onclick="addEvent()" style="width: 100%;">Add Event</button>
      </div>
      
      <div class="card">
        <h2>📆 ${monthName}</h2>
        ${calendarHTML}
      </div>
      
      <div class="card">
        <h2>📋 All Events</h2>
        ${appState.calendar.length > 0 ? `
          <div style="display: grid; gap: 1rem;">
            ${appState.calendar.sort((a, b) => new Date(a.date) - new Date(b.date)).map((event, idx) => `
              <div class="list-item">
                <div>
                  <strong>${event.title}</strong><br>
                  <small>${event.date} • ${event.category}</small><br>
                  ${event.description ? `<small style="color: rgba(61, 44, 77, 0.7);">${event.description}</small>` : ''}
                </div>
                <button class="list-item-delete" onclick="deleteEvent(${idx})">Delete</button>
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align: center; color: rgba(61, 44, 77, 0.6);">No events scheduled</p>'}
      </div>
    </div>
  `;
  
  // Set today's date as default
  const today_str = new Date().toISOString().split('T')[0];
  document.getElementById('event-date').value = today_str;
}

function addEvent() {
  const date = document.getElementById('event-date').value;
  const title = document.getElementById('event-title').value;
  const category = document.getElementById('event-category').value;
  const description = document.getElementById('event-desc').value;
  
  if (!date || !title) {
    alert('Please fill in date and title');
    return;
  }
  
  appState.calendar.push({ date, title, category, description });
  saveUserData();
  renderPageContent();
}

function deleteEvent(idx) {
  if (confirm('Delete this event?')) {
    appState.calendar.splice(idx, 1);
    saveUserData();
    renderPageContent();
  }
}

// Data Management
async function loadUserData() {
  try {
    const docRef = db.collection('users').doc(appState.currentUser.uid);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      appState.finances = data.finances || appState.finances;
      appState.documents = data.documents || [];
      appState.korean = data.korean || appState.korean;
      appState.calendar = data.calendar || [];
    } else {
      await createUserDocument();
    }
  } catch (error) {
    console.log('Local storage fallback:', error);
    // Use localStorage as fallback
    const saved = localStorage.getItem('lifeHubData');
    if (saved) {
      const data = JSON.parse(saved);
      appState.finances = data.finances || appState.finances;
      appState.documents = data.documents || [];
      appState.korean = data.korean || appState.korean;
      appState.calendar = data.calendar || [];
    }
  }
}

async function createUserDocument() {
  try {
    const docRef = db.collection('users').doc(appState.currentUser.uid);
    await docRef.set({
      email: appState.currentUser.email,
      finances: appState.finances,
      documents: [],
      korean: appState.korean,
      calendar: [],
      createdAt: new Date()
    });
  } catch (error) {
    console.log('Fallback: saving to localStorage');
  }
}

async function saveUserData() {
  try {
    const docRef = db.collection('users').doc(appState.currentUser.uid);
    await docRef.update({
      finances: appState.finances,
      documents: appState.documents,
      korean: appState.korean,
      calendar: appState.calendar,
      updatedAt: new Date()
    });
  } catch (error) {
    console.log('Saving to localStorage');
    localStorage.setItem('lifeHubData', JSON.stringify({
      finances: appState.finances,
      documents: appState.documents,
      korean: appState.korean,
      calendar: appState.calendar
    }));
  }
}

// Download all data
function downloadAllData() {
  const dataToExport = {
    user: appState.currentUser.email,
    exportDate: new Date().toLocaleString(),
    finances: appState.finances,
    calendar: appState.calendar,
    korean: {
      known: appState.korean.known,
      toLearn: appState.korean.toLearn
    }
  };
  
  const json = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `life-hub-backup-${new Date().getTime()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
