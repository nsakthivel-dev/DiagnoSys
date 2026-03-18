# DiagnoSys: Blockchain-Secured Federated Learning (BSFL) System

DiagnoSys is a futuristic, decentralized healthcare platform designed to revolutionize rare disease diagnosis. Our system leverages **Blockchain-Secured Federated Learning (BSFL)** to allow medical institutions to collaboratively train diagnostic AI models without ever exposing sensitive patient data.

>**Note on Project Status:** This repository encapsulates the implemented **Doctor Dashboard (Demo UI)** frontend, which demonstrates how clinicians interact with the broader BSFL architecture. 

---

## 🏛️ System Architecture

Our BSFL system is built upon a tiered architecture designed for maximum privacy, security, and clinical utility:

### 1. Hospital Nodes (Local Data)
Multiple hospitals (e.g., Hospital A, B, and C) participate in the network. Each institution retains full sovereignty over their local, sensitive patient data. 

### 2. Federated Learning Layer
- **Local Training:** Each hospital trains the AI diagnostic model locally on their own private servers.
- **Privacy-Preserving:** Only aggregated mathematical model updates (weights) are shared with the global network. 
- **Zero Data Leakage:** No raw patient data *ever* leaves the hospital's secured premises.

### 3. Blockchain Layer (Audit Trail)
- **Smart Contract Verification:** Autonomous smart contracts verify and aggregate the distributed model updates.
- **Immutable Provenance:** The blockchain maintains an immutable, cryptographically secure record of all training rounds and AI model evolutions.
- **Incentivization:** (Optional) Token mechanisms dynamically reward participating hospitals for contributing their training compute and data insights to the network.

### 4. Doctor Dashboard (Frontend UI)
This repository contains the sleek, real-world frontend interface used by medical professionals. Its core features include:
- **Clinical Data Entry:** Doctors can input diverse patient symptoms securely.
- **AI Diagnostics:** Instantly evaluates clinical data to provide highly accurate rare disease risk predictions and generate comprehensive diagnosis reports.
- **Decentralized Case Matching:** Allows doctors to view matching or similar rare cases that exist elsewhere in the network entirely anonymously, helping effectively track difficult-to-diagnose conditions.

---

## 🚀 Getting Started (Doctor Dashboard Demo)

To run the frontend implementation locally and explore the Doctor Dashboard:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Navigate the UI:**
   - Head to the **Patient Input** interface to add mock symptoms.
   - Run the **Analyze with AI** feature to receive instantaneous clinical reports.
   - View the simulated **Case History** and **Blockchain Verification** cards on the main dashboard monitor.
