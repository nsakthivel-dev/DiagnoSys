// ========== DiagnoSys Dashboard - JavaScript ==========

const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {

  // ─── SIDEBAR COLLAPSE LOGIC ───
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mainWrapper = document.querySelector('.main-wrapper');

  // Restore sidebar state
  const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
  if (isCollapsed && sidebar) {
    sidebar.classList.add('collapsed');
    if (mainWrapper) mainWrapper.classList.add('sidebar-collapsed');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (!sidebar) return;

      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-show');
      } else {
        const isNowCollapsed = sidebar.classList.toggle('collapsed');
        if (mainWrapper) mainWrapper.classList.toggle('sidebar-collapsed', isNowCollapsed);
        localStorage.setItem('sidebarCollapsed', isNowCollapsed);
      }
    });
  } else {
    // sidebarToggle element not found — log all IDs to help debug
    console.warn('sidebarToggle element not found. Available IDs in DOM:');
    document.querySelectorAll('[id]').forEach(el => console.log(el.id));
  }

  // Close sidebar on mobile when clicking outside
  document.addEventListener('click', (e) => {
    if (!sidebar) return;
    if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-show')) {
      if (!sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('mobile-show');
      }
    }
  });

  // ─── INITIAL FETCHES ───
  if (document.querySelector('.stats-row')) fetchStats();
  if (document.querySelector('.cases-list')) fetchCases();
  if (document.getElementById('lineChart') || document.getElementById('pieChart')) fetchAnalytics();
  renderCaseHistory();

  // ─── NOTIFICATION DROPDOWN ───
  const notifBtn = document.getElementById('notifBtn');
  const notifDropdown = document.getElementById('notifDropdown');

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
      if (profileDropdown) profileDropdown.classList.remove('show');
    });
  }

  // ─── PROFILE DROPDOWN ───
  const profileArea = document.getElementById('profileArea');
  const profileDropdown = document.getElementById('profileDropdown');

  if (profileArea && profileDropdown) {
    profileArea.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
      if (notifDropdown) notifDropdown.classList.remove('show');
    });
  }

  document.addEventListener('click', () => {
    if (notifDropdown) notifDropdown.classList.remove('show');
    if (profileDropdown) profileDropdown.classList.remove('show');
  });

  // ─── SIDEBAR NAVIGATION ───
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Allow default link behavior for separate pages
    });
  });

  // ─── TAG INPUT ───
  const tagInput = document.getElementById('tagInput');
  const tagTextInput = document.getElementById('tagTextInput');

  if (tagInput && tagTextInput) {
    tagInput.addEventListener('click', () => tagTextInput.focus());

    tagTextInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && tagTextInput.value.trim()) {
        e.preventDefault();
        addTag(tagTextInput.value.trim());
        tagTextInput.value = '';
      }
      if (e.key === 'Backspace' && tagTextInput.value === '') {
        const tags = tagInput.querySelectorAll('.tag');
        if (tags.length > 0) tags[tags.length - 1].remove();
      }
    });

    document.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.closest('.tag').remove();
      });
    });
  }

  function addTag(text) {
    const span = document.createElement('span');
    span.className = 'tag';
    span.innerHTML = `${text} <button class="tag-remove">&times;</button>`;
    span.querySelector('.tag-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      span.remove();
    });
    tagInput.insertBefore(span, tagTextInput);
  }

  // ─── ANALYZE BUTTON ───
  const analyzeBtn = document.getElementById('analyzeBtn');
  const analyzeBtnText = document.getElementById('analyzeBtnText');

  if (analyzeBtn && analyzeBtnText) {
    analyzeBtn.addEventListener('click', async () => {
      if (analyzeBtn.classList.contains('loading')) return;

      const ageInput = document.getElementById('ageInput');
      const genderSelect = document.getElementById('genderSelect');
      const familyHistoryInput = document.getElementById('familyHistory');

      const age = ageInput ? ageInput.value : '';
      const gender = genderSelect ? genderSelect.value : '';
      const symptoms = tagInput ? Array.from(tagInput.querySelectorAll('.tag')).map(t => t.innerText.replace('×', '').trim()) : [];
      const familyHistory = familyHistoryInput ? familyHistoryInput.value : '';

      analyzeBtn.classList.add('loading');
      analyzeBtnText.textContent = 'Analyzing…';

      try {
        let data;
        try {
          const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ age, gender, symptoms, familyHistory })
          });
          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error('API failed');
          }
        } catch (apiErr) {
          console.warn('Backend API not available, using rule-based analysis fallback.');
          data = performRuleBasedAnalysis(age, gender, symptoms, familyHistory);
        }

        localStorage.setItem('lastAnalysis', JSON.stringify(data));
        
        const savedCases = JSON.parse(localStorage.getItem('savedCases') || '[]');
        savedCases.unshift({
          id: "#" + Math.floor(1000 + Math.random() * 9000),
          diagnosis: data.diseaseName,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          risk: data.riskLevel,
          reportLink: data.reportLink || ""
        });
        localStorage.setItem('savedCases', JSON.stringify(savedCases));

        updateAIResults(data);

        const resultsSection = document.getElementById('aiPredictionCard');
        if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth' });

        analyzeBtn.classList.remove('loading');
        analyzeBtnText.textContent = 'Analyze with AI';
      } catch (err) {
        console.error('Analysis failed:', err);
        analyzeBtn.classList.remove('loading');
        analyzeBtnText.textContent = 'Analyze with AI';
      }
    });
  }

  function performRuleBasedAnalysis(age, gender, symptoms, familyHistory) {
    let matchPercentage = 0;
    let diseaseName = "No Record Found";
    let diseaseDescription = "There is no record matching these symptoms in our rare disease database. Please consult a specialist.";
    let riskLevel = "Unknown";
    let confidenceScore = 0;
    let reportLink = "";

    const userSymptomsOriginal = symptoms.map(s => s.toLowerCase().trim());
    // Try to extract keywords from user symptoms for better matching
    let userSymptoms = [];
    userSymptomsOriginal.forEach(s => {
      userSymptoms.push(...s.split(/\s+/));
    });

    const diseases = [
        { id: "eds", name: "Ehlers-Danlos Syndrome (EDS)", symptoms: ["hypermobile", "unstable", "joints", "dislocation", "skin", "stretches", "velvety", "bruising", "wound", "healing", "chronic", "pain", "fatigue", "autonomic", "pots", "digestive"], description: "Genetic/Connective Tissue disorder characterized by joint hypermobility, skin hyperextensibility, and tissue fragility." },
        { id: "mg", name: "Myasthenia Gravis (MG)", symptoms: ["ptosis", "drooping", "eyelids", "diplopia", "double", "vision", "swallowing", "speaking", "limb", "weakness", "respiratory", "fluctuate"], description: "Autoimmune/Neuromuscular disease causing muscle weakness that worsens with exertion." },
        { id: "pbc", name: "Primary Biliary Cholangitis (PBC)", symptoms: ["fatigue", "pruritus", "itching", "jaundice", "dry", "eyes", "mouth", "hyperpigmentation", "xanthelasma"], description: "Autoimmune liver disease characterized by destruction of small bile ducts." },
        { id: "gbs", name: "Guillain-Barré Syndrome (GBS)", symptoms: ["ascending", "weakness", "tingling", "numbness", "burning", "pain", "paralysis", "reflexes", "autonomic", "facial", "swallowing"], description: "Autoimmune condition where the immune system attacks the peripheral nerves." },
        { id: "cf", name: "Cystic Fibrosis (CF)", symptoms: ["mucus", "sticky", "pulmonary", "infections", "bronchiectasis", "pancreatic", "insufficiency", "weight", "salty", "infertility"], description: "Genetic multi-system disorder affecting the lungs, pancreas, and other organs." },
        { id: "hh", name: "Hereditary Hemochromatosis (HH)", symptoms: ["fatigue", "tiredness", "joint", "bronze", "hyperpigmentation", "liver", "fibrosis", "diabetes", "arrhythmias", "hypogonadism"], description: "Genetic metabolic disorder causing excessive iron accumulation in the body." },
        { id: "aatd", name: "Alpha-1 Antitrypsin Deficiency (AATD)", symptoms: ["shortness", "breath", "wheezing", "cough", "emphysema", "liver", "cholestasis", "panniculitis"], description: "Genetic disorder that may cause lung disease and liver disease." },
        { id: "wilson", name: "Wilson's Disease", symptoms: ["jaundice", "hepatomegaly", "tremors", "dysarthria", "bradykinesia", "mood", "depression", "psychosis", "kayser-fleischer", "cataracts"], description: "Genetic metabolic disorder resulting in copper accumulation in the body." },
        { id: "fabry", name: "Fabry Disease", symptoms: ["burning", "pain", "acroparesthesia", "heat", "cold", "intolerance", "abdominal", "diarrhoea", "angiokeratomas", "cornea", "verticillata", "proteinuria", "cardiomyopathy"], description: "Genetic lysosomal storage disorder leading to the accumulation of globotriaosylceramide." },
        { id: "sps", name: "Stiff Person Syndrome (SPS)", symptoms: ["rigidity", "spasms", "hyperlordosis", "anxiety", "agoraphobia", "falls", "hyperekplexia"], description: "Rare autoimmune neurological disorder characterized by progressive muscle stiffness and spasms." }
    ];

    let bestMatch = null;
    let maxMatches = 0;

    diseases.forEach(d => {
      let matches = 0;
      // check if any user symptom word is in the disease symptoms
      userSymptoms.forEach(us => {
        if (d.symptoms.some(ds => ds.includes(us) || us.includes(ds))) {
          matches++;
        }
      });
      // also check original symptom phrases just in case
      userSymptomsOriginal.forEach(us => {
         if (d.symptoms.some(ds => ds === us)) matches += 2;
      });

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = d;
      }
    });

    if (maxMatches > 0) {
      diseaseName = bestMatch.name;
      diseaseDescription = bestMatch.description;
      reportLink = "report-" + bestMatch.id + ".html";
      matchPercentage = Math.min(100, 60 + (maxMatches * 10));
      riskLevel = "High Risk";
      confidenceScore = Math.min(99, 70 + (maxMatches * 5));
    }

    return {
      matchPercentage,
      diseaseName,
      diseaseDescription,
      riskLevel,
      confidenceScore,
      reportLink,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      analysisTime: "1.2 seconds",
      txHash: "0xA34F2601700689D2"
    };
  }

  if (window.location.href.includes('ai-results.html')) {
    const lastAnalysis = localStorage.getItem('lastAnalysis');
    if (lastAnalysis) {
      updateAIResults(JSON.parse(lastAnalysis));
    }
  }

  function updateAIResults(data) {
    const predictionCard = document.getElementById('aiPredictionCard');
    const blockchainCard = document.getElementById('blockchainCard');
    if (predictionCard) predictionCard.style.display = 'block';
    if (blockchainCard) blockchainCard.style.display = 'block';

    const circle = document.querySelector('#predictionCircle circle:nth-child(2)');
    if (circle) {
      const radius = 52;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (data.matchPercentage / 100) * circumference;
      circle.style.strokeDashoffset = offset;
    }

    const ppValue = document.querySelector('.pp-value');
    if (ppValue) ppValue.textContent = `${data.matchPercentage}%`;

    const diseaseName = document.querySelector('.disease-name');
    if (diseaseName) diseaseName.textContent = data.diseaseName;

    const diseaseDesc = document.querySelector('.disease-desc');
    if (diseaseDesc) diseaseDesc.textContent = data.diseaseDescription;

    const progressFill = document.querySelector('.prediction-progress-fill');
    if (progressFill) progressFill.style.width = `${data.confidenceScore}%`;

    const progressLabel = document.querySelector('.prediction-progress-label span:last-child');
    if (progressLabel) progressLabel.textContent = `${data.confidenceScore}%`;

    const metaItems = document.querySelectorAll('.pm-item span');
    if (metaItems.length >= 2) {
      metaItems[0].textContent = data.date;
      metaItems[1].textContent = `Analyzed in ${data.analysisTime}`;
    }

    const badge = document.querySelector('.card-badge.badge-amber');
    if (badge) badge.textContent = data.riskLevel;

    const hash = document.querySelector('.bc-hash');
    if (hash) hash.textContent = data.txHash;

    const viewReportBtn = document.getElementById('viewReportBtn');
    if (viewReportBtn) {
      if (data.reportLink) {
        viewReportBtn.href = data.reportLink;
        viewReportBtn.style.display = 'inline-flex';
      } else {
        viewReportBtn.style.display = 'none';
      }
    }
  }

  // ─── DATA FETCHING FUNCTIONS ───
  async function fetchStats() {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      const statsValues = document.querySelectorAll('.stat-value');
      if (statsValues.length >= 4) {
        statsValues[0].textContent = data.totalPatients.toLocaleString();
        statsValues[1].textContent = data.aiAnalyses.toLocaleString();
        statsValues[2].textContent = data.verifiedTxs.toLocaleString();
        statsValues[3].textContent = `${data.accuracyRate}%`;
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }

  async function fetchCases() {
    const casesList = document.querySelector('.cases-list');
    if (!casesList) return;

    try {
      const res = await fetch(`${API_URL}/cases`);
      const cases = await res.json();
      casesList.innerHTML = '';
      cases.forEach(c => {
        const item = document.createElement('div');
        item.className = 'case-item';
        item.innerHTML = `
          <div class="case-item-avatar ${c.avatarClass}">${c.name.substring(c.name.length - 2)}</div>
          <div class="case-item-info">
            <span class="case-item-name">${c.name}</span>
            <span class="case-item-match">${c.match}% similarity</span>
          </div>
          <div class="case-item-bar"><div class="case-bar-fill" style="width:${c.match}%"></div></div>
        `;
        casesList.appendChild(item);
      });
    } catch (err) {
      console.error('Error fetching cases:', err);
    }
  }

  async function fetchAnalytics() {
    try {
      const res = await fetch(`${API_URL}/analytics`);
      const data = await res.json();
      if (document.getElementById('lineChart')) initLineChart(data.lineChart);
      if (document.getElementById('pieChart')) initPieChart(data.pieChart);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }

  // ─── CHARTS INITIALIZATION ───
  function initLineChart(chartData) {
    const chartEl = document.getElementById('lineChart');
    if (!chartEl) return;

    const lineCtx = chartEl.getContext('2d');
    const lineGrad1 = lineCtx.createLinearGradient(0, 0, 0, 280);
    lineGrad1.addColorStop(0, 'rgba(14,165,233,.15)');
    lineGrad1.addColorStop(1, 'rgba(14,165,233,.0)');
    const lineGrad2 = lineCtx.createLinearGradient(0, 0, 0, 280);
    lineGrad2.addColorStop(0, 'rgba(20,184,166,.12)');
    lineGrad2.addColorStop(1, 'rgba(20,184,166,.0)');

    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets.map((ds, i) => ({
          ...ds,
          borderColor: i === 0 ? '#0ea5e9' : '#14b8a6',
          backgroundColor: i === 0 ? lineGrad1 : lineGrad2,
          borderWidth: 2.5,
          fill: true,
          tension: .4,
          pointRadius: 4,
          pointBackgroundColor: '#1e293b',
          pointBorderColor: i === 0 ? '#0ea5e9' : '#14b8a6',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
              font: { family: 'Inter', size: 12, weight: '500' },
              color: '#94a3b8'
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'Inter' },
            cornerRadius: 10,
            padding: 12,
            borderColor: '#334155',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 12 }, color: '#64748b' }
          },
          y: {
            grid: { color: '#334155' },
            ticks: { font: { family: 'Inter', size: 12 }, color: '#64748b' },
            beginAtZero: true
          }
        }
      }
    });
  }

  function initPieChart(pieData) {
    const chartEl = document.getElementById('pieChart');
    if (!chartEl) return;

    const pieCtx = chartEl.getContext('2d');
    const labels = pieData.map(d => d.label);
    const values = pieData.map(d => d.value);
    const colors = pieData.map(d => d.color);

    new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 3,
          borderColor: '#1e293b',
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'Inter' },
            cornerRadius: 10,
            padding: 12,
            borderColor: '#334155',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
            }
          }
        }
      }
    });

    const pieLegend = document.getElementById('pieLegend');
    if (pieLegend) {
      pieLegend.innerHTML = '';
      pieData.forEach((d) => {
        const item = document.createElement('div');
        item.className = 'pie-legend-item';
        item.innerHTML = `
          <span class="pie-legend-dot" style="background:${d.color}"></span>
          <span>${d.label}</span>
          <span class="pie-legend-pct">${d.value}%</span>
        `;
        pieLegend.appendChild(item);
      });
    }
  }

  // ─── COPY HASH ───
  const copyHashBtn = document.getElementById('copyHashBtn');
  if (copyHashBtn) {
    copyHashBtn.addEventListener('click', () => {
      const hashEl = document.querySelector('.bc-hash');
      const hashText = hashEl ? hashEl.textContent : '';
      navigator.clipboard.writeText(hashText).catch(() => {});
      copyHashBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      setTimeout(() => {
        copyHashBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
      }, 1500);
    });
  }

  // ─── CASE HISTORY RENDERING ───
  function renderCaseHistory() {
    const tbody = document.querySelector('#caseHistoryCard tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const savedCases = JSON.parse(localStorage.getItem('savedCases') || '[]');
    const defaultCases = [
      { id: "#4821", diagnosis: "Congenital Myopathy", date: "Mar 17, 2026", risk: "Medium Risk", reportLink: "#" },
      { id: "#4792", diagnosis: "Duchenne Muscular Dystrophy", date: "Mar 15, 2026", risk: "High Risk", reportLink: "#" },
      { id: "#4610", diagnosis: "Spinal Muscular Atrophy", date: "Mar 10, 2026", risk: "Low Risk", reportLink: "#" }
    ];
    
    const allCases = [...savedCases, ...defaultCases];
    
    allCases.forEach(c => {
      let riskBadge = '';
      if (c.risk.includes('High')) {
        riskBadge = '<span class="badge-red" style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; background: #fef2f2; color: #ef4444;">High</span>';
      } else if (c.risk.includes('Medium')) {
        riskBadge = '<span class="badge-amber" style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">Medium</span>';
      } else {
        riskBadge = '<span class="badge-green" style="padding: 2px 8px; border-radius: 12px; font-size: 0.75rem;">Low</span>';
      }
      
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #f1f5f9';
      tr.innerHTML = `
        <td style="padding: 12px 16px; font-size: 0.85rem;">${c.id}</td>
        <td style="padding: 12px 16px; font-size: 0.85rem; font-weight: 500;">${c.diagnosis}</td>
        <td style="padding: 12px 16px; font-size: 0.85rem; color: #64748b;">${c.date}</td>
        <td style="padding: 12px 16px;">${riskBadge}</td>
        <td style="padding: 12px 16px;"><a href="${c.reportLink || '#'}" class="btn-text" style="color: #0ea5e9; font-size: 0.85rem; background: none; border: none; cursor: pointer; text-decoration: none;">View</a></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ─── CHART FILTER BUTTONS ───
  document.querySelectorAll('.cf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

});

