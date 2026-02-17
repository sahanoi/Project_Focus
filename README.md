# Project Focus (Habit Tracker)

A modern, feature-rich habit tracking application built with React, TypeScript, and Vite. Designed to help users track their daily habits, visualize progress, and maintain consistency through gamification elements.

## 🚀 Features

-   **Habit Tracking**: Create, edit, and delete daily habits.
-   **Progress Visualization**: view your progress with interactive charts using Recharts.
-   **Gamification**: Earn levels and badges as you complete habits.
-   **Responsive Design**: Fully responsive interface built with Tailwind CSS.
-   **Local Storage**: Data is persisted locally using Zustand.

## 🛠 Tech Stack

-   **Frontend Framework**: [React](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sahanoi/Project_Focus.git
    cd Project_Focus
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🧪 Running Tests

To run the test suite:

```bash
npm run test:run
```

## 📂 Project Structure

```
src/
├── components/   # Reusable UI components
├── store/        # Global state management (Zustand)
├── utils/        # Helper functions and gamification logic
├── App.tsx       # Main application component
└── main.tsx      # Entry point
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
