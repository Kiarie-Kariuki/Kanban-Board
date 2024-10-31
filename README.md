## Kanban Board Application

Welcome to the Kanban Board application! This project is a simple and intuitive tool for managing tasks and projects, inspired by the Kanban method of workflow visualization. Below, you’ll find instructions for setting up the application, a list of technologies used, design decisions made, and an estimate of the time spent on the project.

# Table of Contents

    Features
    Technologies Used
    Installation Instructions
    Running the App Locally
    Design Decisions
    Time Spent on the Project

# Features

    User authentication with sign-up and sign-in capabilities.
    A visually appealing Kanban board to manage tasks in different states: Backlog, TODO, In Progress, and Complete.
    Drag-and-drop functionality for easy task management.
    Responsive design for usability across devices.

# Technologies Used

    React: For building the user interface.
    React Router: For managing navigation between different views.
    Material-UI: For styling and UI components.
    Styled Components: For scoped and dynamic styling of components.
    Context API: For managing user authentication state.

# Installation Instructions

To set up this project locally, follow these steps:

Clone the repository:


git clone https://github.com/Kiarie-Kariuki/Kanban-Board.git
cd kanban-board

Install dependencies: Make sure you have Node.js installed. Then, run:


npm install

Set up environment variables (if applicable): If your application requires environment variables (e.g., API keys), create a .env file in the root of the project and add the necessary variables.

Start the development server: Run the following command to start the application:


    npm start

    Open your browser: Navigate to http://localhost:3000 to see the application in action.

# Running the App Locally

After following the installation instructions, you can run the app locally using the command:


npm start

This will start the development server, and you can view the application in your web browser.
Design Decisions

    User Interface: The application uses Material-UI for a modern look and feel, making it user-friendly and visually appealing.
    State Management: The Context API is utilized for user authentication state management, allowing easy access across components without prop drilling.
    Responsiveness: CSS Flexbox and Styled Components are used to ensure the application is responsive and looks good on all devices.
    Drag-and-Drop: Implementing drag-and-drop functionality enhances the user experience, making it easy to move tasks between columns.

# Time Spent on the Project

Approximately 25 hours were spent on this project, including:

    Planning and designing the UI.
    Implementing user authentication.
    Building the Kanban board with drag-and-drop features.
    Testing and debugging.