# Steel Tooling Calculator

A high-precision slitter setup tooling calculator built with **React**, **TypeScript**, and **Vite**. This tool automates the complex task of calculating optimal tooling stacks for steel slitting operations, ensuring physical stability and adherence to tight tolerances.

## 🚀 Live Demo
The latest version is deployed to GitHub Pages:  
[**https://cspraggett.github.io/ToolingTs**](https://cspraggett.github.io/ToolingTs)

---

## ✨ Key Features

### 1. Single Mode
Quickly calculate a single tooling stack for any target width.

### 2. Station Calculator (Make Cut)
Handles "Dual Setup" optimization where both Male and Female tooling are calculated for a specific strip width. It automatically finds the best setup within your allowed tolerance window.

### 3. Full Setup (New 🛠️)
A comprehensive mode for professional slitter operators:
- **Order Management**: Track Order #, Company, Coil Weight, and Gauge.
- **Auto-Centering**: Calculates 4 specific shoulder points (Opening/Closing on Top/Bottom arbors) to perfectly center the setup.
- **Knife Clearance**: Automatically adjusts clearance based on machine-specific knife profiles (e.g., Slitter 3 vs. Slitter 4).
- **Print-Ready Sheets**: Generate a compact, professional setup sheet directly from your browser.

---

## 🧠 Core Technical Logic

### Hybrid Solver
The application uses a hybrid approach for maximum efficiency:
- **Greedy Strategy**: Quickly fills the bulk of the width using the largest available tools.
- **Dynamic Programming (DP)**: Solves the final precision gap (last 6.000") to find the mathematically optimal stack using the fewest total tools.

### Dual Optimization
When calculating strip stations, the optimizer iterates through **0.001" increments** within the user's tolerance window. It prioritizes:
1.  **Minimum Tool Count**: Reduces setup time and physical error.
2.  **Nominal Accuracy**: If multiple setups use the same number of tools, it selects the one closest to the target width.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Styling**: Vanilla CSS Modules (Optimized for both Screen and Print)

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/cspraggett/ToolingTs.git
    cd ToolingTs
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development
Start the development server:
```bash
npm run dev
```

### Testing
Run the suite of unit tests for the core solver and optimizer:
```bash
npm test
```

### Deployment
The project is configured for GitHub Pages. To deploy:
```bash
npm run deploy
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
