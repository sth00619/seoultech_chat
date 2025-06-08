# 🚀 School-Regulations-GPT  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)  
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/your-org/your-repo/ci.yml?branch=main)

> **An 💡 Intelligent Assistant** for SeoulTech’s academic & administrative regulations

---

## 📋 Table of Contents
1. [About](#about)  
2. [Features](#features)  
3. [Folder Structure](#folder-structure)  
4. [Usage](#usage)  
5. [Configuration](#configuration)  
6. [Contributing](#contributing)  
7. [Developer License](#developer-license)  
8. [License](#license)  

---

## 1. About
**School-Regulations-GPT** is your go-to chatbot for Seoul National University of Science and Technology academic policies.  
Ask anything about courses, committees, academic calendar, leave of absence, registration—and get **official**, **cited** answers based solely on the uploaded regulations documents.

---

## 2. Features
- 📑 **Document-Based Answers**  
  - Relies **only** on uploaded regulation, bylaw, or guideline files  
- 🔖 **Citation-First**  
  - Every response includes **Document Name** & **Article Number**  
- ⚖️ **Active vs. Repealed Rules**  
  - Prefers **active** rules; if only repealed ones exist, marks with `[REPEALED]`  
- 🔍 **Fallback Search**  
  - If no rule found, says “Not found” and auto-searches dept. phone via browser.search  

> **Example**  
> > “현재 시행 중인 규정에서는 해당 내용을 확인할 수 없습니다.  
> > 다만, 폐지된 ‘교무회의 규정’ 제5조에 따르면 …  
> > 📘 Source: [REPEALED] 교무회의 규정 제5조(회의)”

---

## 3. Folder Structure
```text
📦 project-root
 ┣ 📂 .github
 ┃ ┗ 📂 workflows           # CI/CD configs (GitHub Actions)
 ┣ 📂 client                # Frontend React/Vue app
 ┣ 📂 server                # Node.js/Express API
 ┣ 📂 data                  # Regulation & guideline JSON/CSV
 ┣ 📂 node_modules          # Dependencies
 ┣ 📜 .env                  # Environment variables
 ┣ 📜 app.js                # Entry point for server
 ┣ 📜 README.md             # This file
 ┣ 📜 package.json          # NPM scripts & deps
 ┣ 📜 package-lock.json     # Locked dependency tree
 ┗ 📜 LICENSE               # MIT License
