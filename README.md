# 📊 TrackPulse — DSA Expense Tracker & Analytics Engine

> A modern, personal expense tracking web application built for a **Data Structures & Algorithms (DSA)** academic project. Features real-time visual inspection of custom **Hash Map**, **Dynamic Array**, and **Binary Max-Heap** data structures.

---

## 🌟 Key Features

- 💸 **Personal Expense Tracker**: Add, edit, delete, tag, and organize expenses with LocalStorage persistence.
- 📊 **Category Breakdown (Hash Map)**: Real-time $O(1)$ category expense aggregation using custom string hashing (DJB2) and separate chaining collision resolution.
- 👑 **Top Expenses Priority Queue (Binary Max-Heap)**: Instantly extracts top 3, top 5, or top 10 largest expenses using binary tree sift-up and sift-down routines.
- 📜 **Sequential Stream (Dynamic Array)**: Continuous buffer memory allocation with $O(1)$ amortized push operations and automatic $2\times$ capacity expansion logging.
- 🔬 **Interactive DSA Inspector Panel**: Live Canvas rendering of Binary Heap Trees, Hash Bucket load factors, and dynamic array buffer memory slots.
- 🪄 **Pre-loaded Demo Profiles**: Load datasets for CS Student Life, Tech Freelancer, or Japan Vacation.
- 📁 **CSV Export & Search**: Filter by tags/categories and export full transaction history to CSV format.
- 🌙 **Dark/Light Theme**: Built with responsive glassmorphism aesthetic and micro-animations.

---

## 🧠 Data Structures & Complexity Overview

| Feature | Data Structure Used | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| Category Summary | Custom Hash Map | $O(1)$ Avg Lookup/Insert | $O(K)$ Keys |
| Transaction Stream | Dynamic Resizable Array | $O(1)$ Amortized Push | $O(N)$ Buffer |
| Top $K$ Expenses | Binary Max-Heap | $O(\log N)$ Insert / $O(N \log K)$ Top $K$ | $O(N)$ Tree |

---

## 🚀 How to Run Locally

1. Open a terminal inside the project directory:
   ```bash
   cd dsa-expense-tracker
   ```
2. Start the local server:
   ```bash
   npx serve -s . -l 3000
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 🌐 How to Push to GitHub & Host Live

### Option 1: GitHub Pages (Free Hosting)
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of DSA Expense Tracker"
   ```
2. Create a repository on GitHub (e.g. `dsa-expense-tracker`) and push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/dsa-expense-tracker.git
   git branch -M main
   git push -u origin main
   ```
3. Enable GitHub Pages in Repository Settings $\rightarrow$ Pages $\rightarrow$ Select `main` branch $\rightarrow$ Save.

### Option 2: Vercel / Netlify (Instant 1-Click Deploy)
- Connect your GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) for automatic SSL-enabled hosting.
