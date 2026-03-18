const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Mock Data
const stats = {
  totalPatients: 1284,
  aiAnalyses: 342,
  verifiedTxs: 89,
  accuracyRate: 97.3
};

const similarCases = [
  { id: 1, name: "Patient #2847", match: 92, avatarClass: "ca-1" },
  { id: 2, name: "Patient #1563", match: 85, avatarClass: "ca-2" },
  { id: 3, name: "Patient #3691", match: 71, avatarClass: "ca-3" }
];

const analyticsData = {
  lineChart: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'AI Analyses',
        data: [32, 45, 38, 52, 48, 60, 55],
      },
      {
        label: 'Verified Cases',
        data: [18, 28, 22, 35, 30, 42, 38],
      }
    ]
  },
  pieChart: [
    { label: 'Myopathy', value: 35, color: '#0ea5e9' },
    { label: 'Neuropathy', value: 25, color: '#14b8a6' },
    { label: 'Muscular Dystrophy', value: 18, color: '#8b5cf6' },
    { label: 'Metabolic', value: 12, color: '#f59e0b' },
    { label: 'Other', value: 10, color: '#e2e8f0' }
  ]
};

// Routes
app.get('/api/stats', (req, res) => {
  res.json(stats);
});

app.get('/api/cases', (req, res) => {
  res.json(similarCases);
});

app.get('/api/analytics', (req, res) => {
  res.json(analyticsData);
});

app.post('/api/analyze', (req, res) => {
  const { age, gender, symptoms, familyHistory } = req.body;
  
  console.log('Analyzing patient data:', { age, gender, symptoms, familyHistory });

  const userSymptomsOriginal = symptoms ? symptoms.map(s => s.toLowerCase().trim()) : [];
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
    userSymptoms.forEach(us => {
      if (d.symptoms.some(ds => ds.includes(us) || us.includes(ds))) {
        matches++;
      }
    });
    userSymptomsOriginal.forEach(us => {
       if (d.symptoms.some(ds => ds === us)) matches += 2;
    });

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = d;
    }
  });

  let matchPercentage = 0;
  let diseaseName = "No Record Found";
  let diseaseDescription = "There is no record matching these symptoms in our rare disease database. Please consult a specialist.";
  let riskLevel = "Unknown";
  let confidenceScore = 0;
  let reportLink = "";

  if (maxMatches > 0) {
    diseaseName = bestMatch.name;
    diseaseDescription = bestMatch.description;
    reportLink = "report-" + bestMatch.id + ".html";
    matchPercentage = Math.min(100, 60 + (maxMatches * 10));
    riskLevel = "High Risk";
    confidenceScore = Math.min(99, 70 + (maxMatches * 5));
  }

  setTimeout(() => {
    res.json({
      matchPercentage,
      diseaseName,
      diseaseDescription,
      riskLevel,
      confidenceScore,
      reportLink,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      analysisTime: "1.2s",
      txHash: "0xA34F" + Math.random().toString(16).substring(2, 6).toUpperCase() + "..." + Math.random().toString(16).substring(2, 6).toUpperCase()
    });
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
