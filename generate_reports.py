import json
import os

diseases = [
{
  "id": "eds",
  "name": "Ehlers-Danlos Syndrome (EDS)",
  "classification": "Genetic / Connective Tissue",
  "symptoms": ["Hypermobile or unstable joints", "Skin stretches unusually far", "Easy bruising and slow wound healing", "Chronic widespread pain", "Fatigue and exercise intolerance", "Autonomic dysfunction (POTS)", "Digestive issues"],
  "diagnosis": ["Clinical Exam: Beighton Score to assess joint hypermobility", "Genetic Testing: Panel testing for COL5A1, COL3A1, TNXB", "Skin Biopsy: Electron microscopy", "Echocardiogram: To assess vascular EDS", "Differential Diagnosis: Rule out Marfan syndrome"],
  "treatment": "Physiotherapy, pain management (NSAIDs, low-dose naltrexone), joint bracing, psychological support. No cure. Vascular EDS requires annual imaging.",
  "prognosis": "Variable by subtype. Most have normal lifespan; vascular EDS has serious complications. Quality of life management is ongoing.",
  "case_example": "A 24-year-old woman presented with recurrent shoulder and knee dislocations since adolescence, along with unexplained fatigue and digestive issues. After visiting several specialists over 6 years without a diagnosis, a rheumatologist applied the Beighton Score (8/9) and arranged genetic testing confirming hEDS. She was referred to a multidisciplinary team including a physiotherapist and pain specialist. Over approximately 18 months of targeted physical therapy and pain management, her dislocation frequency decreased significantly and daily function improved."
},
{
  "id": "mg",
  "name": "Myasthenia Gravis (MG)",
  "classification": "Autoimmune / Neuromuscular",
  "symptoms": ["Ptosis (drooping eyelids)", "Diplopia (double vision)", "Difficulty swallowing or speaking", "Proximal limb weakness", "Respiratory muscle weakness", "Symptoms fluctuate and worsen with exertion", "Thymic abnormalities"],
  "diagnosis": ["Antibody Tests: AChR antibodies (85% sensitivity)", "Edrophonium Test: Temporary improvement confirms NMJ dysfunction", "Repetitive Nerve Stimulation: Decremental EMG response", "Single-Fiber EMG: Detects jitter", "CT Chest: Mandatory to rule out thymoma"],
  "treatment": "Acetylcholinesterase inhibitors (pyridostigmine), corticosteroids, azathioprine, rituximab for refractory cases. Thymectomy if thymoma present. IVIg or plasmapheresis for crises.",
  "prognosis": "With treatment, most achieve significant symptom control. Remission possible post-thymectomy. Crisis requires ICU care.",
  "case_example": "A 32-year-old woman noticed her left eyelid drooping and intermittent double vision, which worsened by evening. After initial misdiagnosis as migraine, a neurologist performed AChR antibody testing and single-fiber EMG confirming MG. CT scan revealed a small thymoma. She underwent thymectomy, and over approximately 14 months her ocular symptoms fully resolved."
},
{
  "id": "pbc",
  "name": "Primary Biliary Cholangitis (PBC)",
  "classification": "Autoimmune / Hepatic",
  "symptoms": ["Persistent fatigue", "Pruritus (intense itching)", "Jaundice in advanced disease", "Dry eyes and dry mouth (sicca)", "Hyperpigmentation of the skin", "Portal hypertension", "Xanthelasma"],
  "diagnosis": ["AMA Blood Test: Anti-mitochondrial antibodies positive in ~95%", "Liver Function Tests: Elevated ALP and GGT", "Liver Biopsy: Confirms staging", "Imaging (MRCP): Excludes primary sclerosing cholangitis", "ANA / Anti-sp100: For AMA-negative PBC"],
  "treatment": "Ursodeoxycholic acid (UDCA) first-line slows progression. Obeticholic acid (OCA) for non-responders. Cholestyramine for pruritus. Liver transplant in end-stage disease.",
  "prognosis": "Excellent if UDCA started early and liver function normalises. Late-stage patients risk cirrhosis. Transplant has high success rate.",
  "case_example": "A 47-year-old woman was referred for persistent unexplained itching and fatigue lasting two years, initially managed as eczema. Blood tests revealed elevated ALP, and AMA-M2 antibodies were positive. Liver biopsy confirmed early-stage PBC. She was started on UDCA, and after 12 months her liver enzymes normalised and the itching reduced substantially."
},
{
  "id": "gbs",
  "name": "Guillain-Barré Syndrome (GBS)",
  "classification": "Autoimmune / Acquired",
  "symptoms": ["Ascending weakness starting in feet", "Tingling, numbness, or burning pain", "Progressive limb paralysis", "Loss of deep tendon reflexes", "Autonomic instability", "Facial weakness", "Respiratory failure"],
  "diagnosis": ["Lumbar Puncture (CSF): Albuminocytologic dissociation", "Nerve Conduction Studies: Slowed conduction velocity", "Anti-ganglioside Antibodies: Anti-GQ1b, anti-GM1", "MRI Spine: May show nerve root enhancement", "Brighton Criteria: Standardised diagnostic criteria"],
  "treatment": "IVIg (0.4 g/kg/day × 5 days) or plasmapheresis — equivalent efficacy. Supportive care, physiotherapy, respiratory monitoring. No role for corticosteroids.",
  "prognosis": "Most recover over weeks to months. ~5% mortality. Residual weakness in ~20%. Relapses rare.",
  "case_example": "A 55-year-old man developed tingling in both feet after a respiratory infection, progressing to leg weakness over 5 days. He was hospitalised when walking became impossible. CSF showed elevated protein with no white cells. Nerve conduction confirmed AIDP. A 5-day course of IVIg was administered. Walking was regained at month 4; near-full recovery was documented at 11 months."
},
{
  "id": "cf",
  "name": "Cystic Fibrosis (CF)",
  "classification": "Genetic / Multi-system",
  "symptoms": ["Thick, sticky mucus in lungs", "Recurrent pulmonary infections", "Bronchiectasis", "Pancreatic insufficiency", "Poor weight gain", "Salty-tasting skin", "Male infertility"],
  "diagnosis": ["Newborn Screening: Immunoreactive trypsinogen (IRT)", "Sweat Chloride Test: Gold standard (≥60 mmol/L)", "Genetic Testing: CFTR mutation panel", "Lung Function (PFTs): FEV1 decline", "Sputum Microbiology: Regular cultures"],
  "treatment": "CFTR modulators (elexacaftor/tezacaftor/ivacaftor) for eligible mutations. Airway clearance physiotherapy, pancreatic enzymes, high-calorie diet, inhaled antibiotics.",
  "prognosis": "Transformed by CFTR modulators. Patients on Trikafta have dramatically improved lung function and life expectancy.",
  "case_example": "An infant was flagged on newborn screening with elevated IRT; sweat chloride and CFTR genetic testing confirmed CF. At age 12, she was commenced on elexacaftor/tezacaftor/ivacaftor (Trikafta). Within 4 months, her FEV1 improved by 18 percentage points and BMI normalised. She has had only one hospitalisation in 3 years."
},
{
  "id": "hh",
  "name": "Hereditary Hemochromatosis (HH)",
  "classification": "Genetic / Metabolic",
  "symptoms": ["Fatigue and chronic tiredness", "Joint pain", "Bronze or grey skin hyperpigmentation", "Liver fibrosis and cirrhosis", "Diabetes mellitus", "Cardiac arrhythmias", "Hypogonadism"],
  "diagnosis": ["Fasting Transferrin Saturation: >45% in women, >50% in men", "Serum Ferritin: Elevated (>300 ug/L)", "HFE Genetic Testing: C282Y homozygosity", "Liver Biopsy / MRI: Quantifies hepatic iron", "Family Screening: First-degree relatives"],
  "treatment": "Therapeutic phlebotomy (venesection) weekly until ferritin <50 ug/L, then maintenance every 3–4 months. Avoid vitamin C supplements.",
  "prognosis": "Excellent if treated before cirrhosis or diabetes. Normal life expectancy achievable. End-organ damage partially reversible.",
  "case_example": "A 42-year-old man was incidentally found to have elevated liver enzymes. Iron studies showed transferrin saturation of 78% and ferritin of 1,820 ug/L. HFE genotyping confirmed C282Y homozygosity. He underwent weekly phlebotomy; ferritin normalised to 45 ug/L after approximately 14 months. Liver enzymes normalised and joint pain improved."
},
{
  "id": "aatd",
  "name": "Alpha-1 Antitrypsin Deficiency (AATD)",
  "classification": "Genetic / Pulmonary & Hepatic",
  "symptoms": ["Progressive shortness of breath", "Wheezing, chronic cough", "Early-onset emphysema", "Liver disease (cirrhosis)", "Necrotising panniculitis", "Reduced exercise tolerance", "Symptoms worsen with smoking"],
  "diagnosis": ["Serum AAT Level: <11 umol/L suggests deficiency", "Phenotyping (IEF): Identifies Pi genotype", "Genotyping: Molecular testing for Z and S alleles", "Spirometry / PFTs: Obstructive pattern", "CT Thorax: Basilar-predominant panacinar emphysema"],
  "treatment": "Smoking cessation is critical. Standard COPD therapy. Augmentation therapy (IV AAT protein infusions) in eligible patients.",
  "prognosis": "Non-smokers with ZZ genotype have near-normal life expectancy. Smokers fare significantly worse. Liver disease managed by transplant.",
  "case_example": "A 38-year-old non-smoking woman was diagnosed with 'atypical asthma' and treated ineffectively for 6 years. A respiratory physician noticed basal-predominant emphysema on CT and ordered AAT serum levels, which returned at 4 umol/L. She was enrolled in an augmentation therapy programme. After 2 years, FEV1 decline slowed significantly."
},
{
  "id": "wilson",
  "name": "Wilson's Disease",
  "classification": "Genetic / Metabolic",
  "symptoms": ["Hepatic: jaundice, acute liver failure", "Tremors, dysarthria, bradykinesia", "Neuropsychiatric: mood swings, depression", "Kayser-Fleischer rings", "Haemolytic anaemia", "Renal tubular dysfunction", "Sunflower cataracts"],
  "diagnosis": ["Slit-Lamp Examination: Kayser-Fleischer rings", "Serum ceruloplasmin: <0.1 g/L", "24h Urine Copper: Elevated", "Liver Biopsy: Quantitative hepatic copper", "ATP7B Genetic Testing: Confirms diagnosis"],
  "treatment": "D-penicillamine or trientine (chelation therapy) to remove copper. Zinc acetate for maintenance. Liver transplant for fulminant hepatic failure.",
  "prognosis": "Excellent if diagnosed early before irreversible organ damage. Neurological symptoms may take 18–24 months to improve.",
  "case_example": "A 19-year-old male student presented to psychiatry with aggressive behaviour, personality change, and poor academic performance. A neurology referral was made and Kayser-Fleischer rings were found. Ceruloplasmin was low and 24-hour urine copper elevated. He was started on trientine chelation therapy. Psychiatric symptoms improved significantly over 18 months."
},
{
  "id": "fabry",
  "name": "Fabry Disease",
  "classification": "Genetic / Lysosomal Storage (X-linked)",
  "symptoms": ["Episodic severe burning pain in hands/feet", "Heat, cold, and exercise intolerance", "Gastrointestinal: abdominal pain, diarrhoea", "Angiokeratomas", "Cornea verticillata", "Progressive chronic kidney disease", "Hypertrophic cardiomyopathy", "Strokes and TIAs in young adults"],
  "diagnosis": ["Alpha-Gal A Enzyme Assay: Markedly reduced", "GLA Genetic Testing: Identifies pathogenic mutation", "Lyso-Gb3: Elevated biomarker", "Kidney Biopsy: Characteristic zebra bodies", "ECG / Echo: Cardiac screening at diagnosis"],
  "treatment": "Enzyme replacement therapy (ERT): agalsidase alfa or beta IV. Migalastat for amenable mutations. Pain managed with gabapentin.",
  "prognosis": "ERT slows progression but does not reverse established organ damage. Early treatment produces better outcomes.",
  "case_example": "A 28-year-old woman with a 12-year history of unexplained burning foot pain and heat intolerance had been evaluated by multiple specialists. After her brother was diagnosed, she underwent GLA genetic testing confirming the familial mutation. She commenced agalsidase alfa ERT. Over 3 years, her pain crises reduced and renal function stabilised."
},
{
  "id": "sps",
  "name": "Stiff Person Syndrome (SPS)",
  "classification": "Autoimmune / Neurological",
  "symptoms": ["Progressive muscle rigidity in trunk", "Painful, sudden muscle spasms", "Hyperlordosis", "Anxiety, agoraphobia", "Episodic falls", "Hyperekplexia", "Cerebellar involvement in some variants"],
  "diagnosis": ["Anti-GAD65 Antibodies: Elevated in >70%", "Anti-Amphiphysin Antibodies: Present in paraneoplastic SPS", "EMG: Continuous motor unit activity at rest", "Clonazepam Trial: Symptomatic improvement supports diagnosis", "MRI Brain & Spine: Usually normal"],
  "treatment": "Diazepam or baclofen for muscle rigidity. IVIg or plasmapheresis for acute exacerbations. Rituximab for severe refractory cases.",
  "prognosis": "Chronic, progressive condition. No cure but symptoms manageable. Falls and progressive disability are main concerns.",
  "case_example": "A 44-year-old female teacher developed progressive stiffness in her back and abdomen, with sudden muscle spasms triggered by loud noises. Neurological assessment found continuous EMG activity; anti-GAD65 antibodies were elevated. She was started on diazepam and referred for IVIg therapy. Over 18 months, spasm frequency halved, and she regained the ability to walk outdoors."
}
]

template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{name} - Diagnosis Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <style>
    .report-container {{ max-width: 1400px; width: 95%; margin: 40px auto; padding: 0 20px; }}
    .back-nav {{ margin-bottom: 24px; }}
    .back-nav a {{ display: inline-flex; align-items: center; gap: 8px; color: #0ea5e9; text-decoration: none; font-weight: 500; transition: color 0.2s; }}
    .back-nav a:hover {{ color: #38bdf8; }}
    
    .report-header {{ display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 32px; }}
    .report-title-group h1 {{ margin: 0 0 10px 0; font-size: 32px; color: #f8fafc; }}
    .report-title-group .classification {{ font-size: 15px; color: #94a3b8; font-weight: 500; display:flex; align-items:center; gap: 8px; }}
    
    .grid-layout {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
    }}

    /* Left column */
    .left-col {{ display: flex; flex-direction: column; gap: 40px; }}
    .right-col {{ display: flex; flex-direction: column; gap: 40px; }}

    .section-title {{ font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; border-bottom: 1px solid #334155; padding-bottom: 8px; margin-bottom: 16px; margin-top: 0; }}
    
    .tags-grid {{ display: flex; flex-wrap: wrap; gap: 10px; }}
    .report-tag {{ background: rgba(14, 165, 233, 0.1); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.2); padding: 8px 14px; border-radius: 6px; font-size: 14px; font-weight: 500; }}

    .pathway-list {{ list-style: none; padding: 0; margin: 0; }}
    .pathway-item {{ background: #0f172a; border-left: 3px solid #14b8a6; padding: 16px 20px; margin-bottom: 12px; border-radius: 6px; }}
    .pathway-item strong {{ color: #f8fafc; display: block; margin-bottom: 6px; font-size: 15px; }}
    .pathway-item span {{ color: #cbd5e1; font-size: 14px; display: block; line-height: 1.5; }}

    .management-grid {{
      display: grid; grid-template-columns: 1fr; gap: 20px;
    }}
    .info-box {{ background: #1e293b; padding: 24px; border-radius: 10px; color: #e2e8f0; line-height: 1.6; font-size: 15px; }}
    .info-box.tx {{ border-left: 4px solid #f59e0b; }}
    .info-box.prog {{ border-left: 4px solid #8b5cf6; }}
    
    .case-example {{ background: linear-gradient(135deg, rgba(14,165,233,0.1), rgba(20,184,166,0.1)); border: 1px solid rgba(14,165,233,0.2); padding: 28px; border-radius: 12px; }}
    .case-example h3 {{ margin: 0 0 16px 0; color: #f8fafc; display: flex; align-items: center; gap: 8px; font-size: 18px; }}
    .case-example p {{ color: #cbd5e1; line-height: 1.7; margin: 0; font-style: italic; font-size: 15px; }}
    
    @media (max-width: 992px) {{
      .grid-layout {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>
  
  <div class="report-container">
    <div class="back-nav">
      <a href="patient-input.html">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Patient Input
      </a>
    </div>
    
    <div class="card" style="padding: 40px;">
      <div class="report-header">
        <div class="report-title-group">
          <h1>{name}</h1>
          <div class="classification">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            Classification: {classification}
          </div>
        </div>
        <span class="card-badge badge-blue" style="font-size:14px; padding: 6px 16px;">Detailed Clinical Report</span>
      </div>

      <div class="grid-layout">
        <!-- Left Column -->
        <div class="left-col">
          <div>
            <div class="section-title">Key Symptoms</div>
            <div class="tags-grid">
              {symptoms_html}
            </div>
          </div>

          <div>
            <div class="section-title">Diagnosis Pathway</div>
            <ul class="pathway-list">
              {diagnosis_html}
            </ul>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-col">
          <div>
            <div class="section-title">Management & Outcomes</div>
            <div class="management-grid">
              <div class="info-box tx">
                <strong style="color: #f8fafc; display: block; margin-bottom: 8px;">Treatment Overview</strong>
                {treatment}
              </div>
              <div class="info-box prog">
                <strong style="color: #f8fafc; display: block; margin-bottom: 8px;">Prognosis</strong>
                {prognosis}
              </div>
            </div>
          </div>

          <div class="case-example">
            <h3>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Clinical Case Example
            </h3>
            <p>"{case_example}"</p>
          </div>
        </div>
      </div>
      
    </div>
  </div>

</body>
</html>"""

for d in diseases:
    symptoms_html = "".join([f'<span class="report-tag">{s}</span>' for s in d["symptoms"]])
    
    diag_html = ""
    for steps in d["diagnosis"]:
        parts = steps.split(": ", 1)
        if len(parts) == 2:
            diag_html += f'<li class="pathway-item"><strong>{parts[0]}</strong><span>{parts[1]}</span></li>'
        else:
            diag_html += f'<li class="pathway-item"><strong>{parts[0]}</strong></li>'

    with open(f"report-{d['id']}.html", "w", encoding='utf-8') as f:
        f.write(template.format(
            name=d["name"],
            classification=d["classification"],
            symptoms_html=symptoms_html,
            diagnosis_html=diag_html,
            treatment=d["treatment"],
            prognosis=d["prognosis"],
            case_example=d["case_example"]
        ))

print("Generated beautifully redesigned grid-layout report pages.")
