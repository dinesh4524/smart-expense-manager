# AI Rules for Smart Home Expense Manager

This document outlines the technical stack and specific library usage guidelines for the Smart Home Expense Manager application.

## Tech Stack Overview

*   **React**: The core JavaScript library for building the user interface.
*   **TypeScript**: Used for type safety across the entire codebase, enhancing maintainability and reducing errors.
*   **Tailwind CSS**: A utility-first CSS framework for styling, ensuring a consistent and responsive design.
*   **Vite**: The build tool and development server, chosen for its speed and efficiency.
*   **Lucide React**: A collection of beautiful and customizable open-source icons.
*   **Recharts**: A charting library for React, used for creating interactive data visualizations in reports and dashboards.
*   **jsPDF & jspdf-autotable**: Libraries for generating and exporting data into PDF documents.
*   **xlsx**: A comprehensive library for reading and writing spreadsheet files (like Excel).
*   **React Context API**: Employed for efficient global state management across the application.
*   **Local Storage (Mock API)**: Used for client-side data persistence and simulating API interactions.

## Library Usage Rules

To maintain consistency and best practices, please adhere to the following guidelines when developing or modifying the application:

*   **UI Components**: For new UI elements, leverage the existing custom components found in `src/components/ui` (e.g., `Button`, `Card`, `Modal`). If a specific component from `shadcn/ui` is required and not available in our custom set, it can be introduced.
*   **Icons**: Always use icons from the `lucide-react` library.
*   **Charting & Data Visualization**: All charts and graphs should be implemented using `recharts`.
*   **Data Export**:
    *   For exporting data to Excel (e.g., `.xlsx` files), use the `xlsx` library.
    *   For exporting data to PDF documents, use `jspdf` in conjunction with `jspdf-autotable`.
*   **State Management**:
    *   For application-wide state that needs to be accessible by multiple components, use React's Context API.
    *   For component-specific local state, use React's `useState` or `useReducer` hooks.
*   **Styling**: All styling must be done using Tailwind CSS utility classes. Avoid inline styles or separate CSS files unless absolutely necessary for a very specific, isolated case.
*   **Routing**: The application currently manages views through a custom state-based system in `App.tsx`. Do not introduce `react-router-dom` or similar routing libraries unless explicitly instructed.
*   **Data Persistence**: Continue to use the `localStorage`-based mock API (`services/mockApi.ts`) for all data operations unless a backend integration (e.g., Supabase) is added.