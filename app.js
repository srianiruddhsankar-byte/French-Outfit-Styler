// Main App State & Logic
const app = {
  state: {
    currentPage: 'home',
    styleBlend: 70, // % French
    quizProgress: 0,
    answers: []
  },

  init() {
    this.setupQuiz();
    this.setupListeners();
    this.showPage('home');
  },

  // --- Navigation & Routing ---
  showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
    }
    
    this.state.currentPage = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (pageId === 'quiz') {
      this.resetQuiz();
    }
  },

  // --- Quiz Logic ---
  quizQuestions: [
    {
      question: "Which silhouette appeals to you the most?",
      options: [
        { text: "Structured & Tailored", value: 'french' },
        { text: "Flowy & Draped", value: 'indian' },
        { text: "Smart Casual", value: 'french' },
        { text: "Comfortable Elegance", value: 'indian' }
      ]
    },
    {
      question: "Select your go-to weekend vibe:",
      options: [
        { text: "A cafe in Paris", value: 'french' },
        { text: "An artistic heritage walk", value: 'indian' },
        { text: "Gallery hopping", value: 'french' },
        { text: "Festive family gathering", value: 'indian' }
      ]
    },
    {
      question: "Pick a fabric you love to touch:",
      options: [
        { text: "Crisp Linen", value: 'french' },
        { text: "Rich Silk/Chanderi", value: 'indian' },
        { text: "Soft Cotton Rib", value: 'french' },
        { text: "Block Printed Cotton", value: 'indian' }
      ]
    }
  ],

  setupQuiz() {
    this.renderQuizStep();
  },

  resetQuiz() {
    this.state.quizProgress = 0;
    this.state.answers = [];
    this.renderQuizStep();
  },

  renderQuizStep() {
    const qIndex = this.state.quizProgress;
    
    // Update Progress Bar
    const progressFill = document.getElementById('quiz-progress');
    progressFill.style.width = `${((qIndex) / this.quizQuestions.length) * 100}%`;
    
    // Check if Quiz is Done
    if (qIndex >= this.quizQuestions.length) {
      this.finishQuiz();
      return;
    }

    const currentQ = this.quizQuestions[qIndex];
    document.getElementById('quiz-question').innerText = currentQ.question;
    
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    currentQ.options.forEach((opt, idx) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerText = opt.text;
      card.onclick = () => this.handleQuizAnswer(opt.value, card);
      optionsContainer.appendChild(card);
    });
  },

  handleQuizAnswer(value, cardElement) {
    // Highlight selection
    document.querySelectorAll('.quiz-card').forEach(c => c.classList.remove('selected'));
    cardElement.classList.add('selected');
    
    this.state.answers.push(value);
    
    // Proceed to next step after brief delay
    setTimeout(() => {
      this.state.quizProgress++;
      this.renderQuizStep();
    }, 400);
  },

  finishQuiz() {
    // Calculate Style Formula based on answers
    const frenchCount = this.state.answers.filter(a => a === 'french').length;
    const frenchPercent = Math.round((frenchCount / this.quizQuestions.length) * 100);
    
    // Set Slider value
    const slider = document.getElementById('style-blend');
    slider.value = frenchPercent;
    this.updateSliderDisplay(frenchPercent);

    // Give a neat transition to Onboarding
    document.getElementById('quiz-question').innerHTML = `
      Style Matched! <br> 
      <span style="color: var(--color-accent-indian); font-size: 0.8em;">
        ${frenchPercent}% French / ${100 - frenchPercent}% Indian
      </span>
    `;
    document.getElementById('quiz-options').innerHTML = `
      <button class="btn btn-primary" style="margin: 2rem auto; grid-column: 1/-1;" onclick="app.showPage('onboarding')">
        Continue to Wardrobe Setup <span class="arrow">→</span>
      </button>
    `;
    document.getElementById('quiz-progress').style.width = '100%';
  },

  // --- Onboarding Logic ---
  nextOnboarding(step) {
    // Update tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${step}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${step}`).classList.add('active');
  },

  setupListeners() {
    // Setup Color Swatch Selection toggle
    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', function() {
        this.classList.toggle('selected');
      });
    });

    // Update Blend Slider text Live
    const slider = document.getElementById('style-blend');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.updateSliderDisplay(e.target.value);
      });
    }
  },

  updateSliderDisplay(val) {
    document.getElementById('blend-val-french').innerText = `${val}%`;
    document.getElementById('blend-val-indian').innerText = `${100 - val}%`;
  },

  // --- Final Generation ---
  generateCapsule() {
    const btn = document.querySelector('.cta-glow');
    btn.innerHTML = 'Analyzing Wardrobe... <span class="magic-wand">⏳</span>';
    btn.style.opacity = '0.8';
    
    setTimeout(() => {
      this.populateDashboard();
      this.showPage('dashboard');
      btn.innerHTML = 'Generate Capsule <span class="magic-wand">✨</span>';
      btn.style.opacity = '1';
    }, 1500); // Simulate API latency
  },

  populateDashboard() {
    // 1. Get Existing Items
    const checkedItems = Array.from(document.querySelectorAll('.wardrobe-picker input:checked'))
                              .map(el => el.nextElementSibling.innerText.trim());
    const otherClothesInput = document.getElementById('other-clothes');
    if (otherClothesInput && otherClothesInput.value.trim()) {
      checkedItems.push(...otherClothesInput.value.split(',').map(s => s.trim()));
    }
    const existingList = checkedItems.length > 0 ? checkedItems.join(', ') : 'No specific items selected';
    document.getElementById('analysis-existing').innerText = existingList;

    // 2. Identify Gaps based on Wardrobe + Blend/Budget
    const blendVal = parseInt(document.getElementById('style-blend').value, 10);
    const isFrenchHeavy = blendVal > 50;
    
    let gaps = [];
    const lowerItems = checkedItems.map(i => i.toLowerCase());
    
    if (!lowerItems.some(i => i.includes('blazer') || i.includes('trench') || i.includes('coat'))) {
      gaps.push('Missing structured outerwear for layering');
    }
    if (!lowerItems.some(i => i.includes('trousers') || i.includes('jeans') || i.includes('salwar'))) {
      gaps.push('Missing versatile, foundational bottoms');
    }
    if (!isFrenchHeavy && !lowerItems.some(i => i.includes('saree') || i.includes('dupatta'))) {
      gaps.push('Missing fluid draping elements for ethnic touch');
    }
    if (isFrenchHeavy && !lowerItems.some(i => i.includes('breton') || i.includes('shirt'))) {
      gaps.push('Missing classic minimalist foundational tops');
    }
    if (gaps.length === 0) {
      gaps.push('Wardrobe is solid! Need statement belts or scarves to elevate.');
    }
    
    document.getElementById('analysis-gaps').innerHTML = gaps.map(g => `<li>${g}</li>`).join('');

    // 3. Smart Additions (Colors + Gaps context)
    let selectedColors = Array.from(document.querySelectorAll('.color-swatch.selected')).map(el => el.title);
    if (selectedColors.length === 0) selectedColors = ['Neutral'];
    
    const budgetRaw = document.getElementById('budget').value;
    const budget = parseInt(budgetRaw, 10) || 8000;
    document.getElementById('budget-badge').innerText = `Under ₹${budget.toLocaleString()}`;
    
    let additionsHTML = '';
    const color = selectedColors[0].split(' ')[0]; // just grab the first word easily
    
    gaps.forEach((gap, index) => {
      if (index > 2) return; // max 3 recommendations
      let itemType = 'Accessory'; let icon = '🧣';
      if (gap.includes('outerwear')) { itemType = 'Tailored Blazer'; icon = '🧥'; }
      else if (gap.includes('bottoms')) { itemType = 'Straight Trousers'; icon = '👖'; }
      else if (gap.includes('draping')) { itemType = 'Silk Dupatta'; icon = '🧣'; }
      else if (gap.includes('tops')) { itemType = 'Breton Stripe Top'; icon = '👚'; }
      
      let price = Math.floor((budget / (Math.min(gaps.length, 3))) * 0.8 / 100) * 100 - 1; 
      if (price < 0) price = 999;

      additionsHTML += `
      <div class="shop-item">
        <div class="shop-icon">${icon}</div>
        <div class="shop-details">
          <h4>${color} ${itemType}</h4>
          <p>Perfectly closes your style gap</p>
        </div>
        <div class="shop-price">₹${price.toLocaleString()}</div>
      </div>`;
    });
    
    document.getElementById('shopping-list').innerHTML = additionsHTML;

    // 4. Outfits Grid dynamically built with diverse images and titles based on inputs
    
    // A small mapping dictionary to resolve high-quality images and chic names for pieces
    const stylesDb = {
      'kurta': { img: 'https://images.unsplash.com/photo-1583391733958-d15a883fa5e9?w=400&q=80', adjective: 'Ethnic', noun: 'Kurta' },
      'saree': { img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80', adjective: 'Draped', noun: 'Saree' },
      'dupatta': { img: 'https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=400&q=80', adjective: 'Flowy', noun: 'Dupatta Accent' },
      'salwar': { img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', adjective: 'Relaxed', noun: 'Salwar' },
      'blazer': { img: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&q=80', adjective: 'Tailored', noun: 'Blazer' },
      'trench': { img: 'https://images.unsplash.com/photo-1520975954732-57dd22299614?w=400&q=80', adjective: 'Structured', noun: 'Trench' },
      'breton': { img: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=400&q=80', adjective: 'Parisian', noun: 'Stripes' },
      'trousers': { img: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80', adjective: 'Chic', noun: 'Trousers' },
      'jeans': { img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80', adjective: 'Classic', noun: 'Denim' },
      'shirt': { img: 'https://images.unsplash.com/photo-1434389678222-7fccfe00be55?w=400&q=80', adjective: 'Crisp', noun: 'Button-down' },
      'default': { img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80', adjective: 'Minimal', noun: 'Base Component' }
    };

    // Grab up to 3 pieces the user actually owns, or fallback to sensible defaults
    let safeItems = [...lowerItems];
    if (safeItems.length === 0) safeItems.push('kurta', 'jeans', 'blazer');
    if (safeItems.length === 1) safeItems.push('jeans', 'shirt');
    if (safeItems.length === 2) safeItems.push('trench');

    // Shuffle the items for variety so they look different per click
    const shuffledItems = safeItems.sort(() => 0.5 - Math.random());
    const baseColor = selectedColors[Math.floor(Math.random() * selectedColors.length)] || 'Navy';

    let outfitsHTML = '';
    
    // Generate 3 Outfit Cards
    for (let i = 0; i < 3; i++) {
        // Pick an anchor item for this card
        const itemKey = shuffledItems[i % shuffledItems.length];
        
        // Find DB match or Default
        let dbMatch = stylesDb['default'];
        for (const [key, val] of Object.entries(stylesDb)) {
           if (itemKey.includes(key)) {
             dbMatch = val; 
             break;
           }
        }

        // Pick a secondary item for the description
        const secondaryKey = shuffledItems[(i + 1) % shuffledItems.length];
        let secondaryMatch = stylesDb['default'];
        for (const [key, val] of Object.entries(stylesDb)) {
           if (secondaryKey.includes(key)) {
             secondaryMatch = val; 
             break;
           }
        }

        const title = i === 1 ? `The ${baseColor} ${dbMatch.adjective}` : `The ${dbMatch.adjective} ${secondaryMatch.noun}`;
        
        let desc = '';
        if (i === 0) {
           desc = `A stunning blend featuring your ${dbMatch.noun} elevated by a ${baseColor} color palette and complementing ${secondaryMatch.noun}.`;
        } else if (i === 1) {
           desc = `Focusing entirely on the ${dbMatch.noun}, styled with clean lines for a bold ${isFrenchHeavy ? 'French' : 'Fusion'} silhouette.`;
        } else {
           desc = `Perfect harmony: ${dbMatch.noun} + ${secondaryMatch.noun} + sophisticated accents in ${baseColor}.`;
        }

        const exactBlend = i === 0 ? `${blendVal}% French / ${100 - blendVal}% Indian` : 
                           i === 1 ? (isFrenchHeavy ? `100% French` : `100% Indian`) : 
                           `Balanced Mix`;

        outfitsHTML += `
          <div class="outfit-card">
            <div class="outfit-img-placeholder" style="background-image: url('${dbMatch.img}'); background-color: #eee;"></div>
            <h4>${title}</h4>
            <p>${desc}</p>
            <span class="style-tag ${i===1 ? 'pure' : 'blend'}">${exactBlend}</span>
          </div>
        `;
    }
      
    document.getElementById('outfits-grid').innerHTML = outfitsHTML;
  }

};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
app.js
Displaying app.js.
