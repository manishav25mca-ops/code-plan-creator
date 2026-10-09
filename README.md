# Project Plan Genius

Project Planning Agent – Complete Web Application Development

Act as an expert full-stack developer and AI application engineer. Develop a complete, functional, and responsive web application called Project Planning Agent that converts a student's software project idea into a detailed, organized, and practical project plan using Generative AI.

Do not just provide instructions or a UI prototype. Create the actual project files, implement the frontend and backend, integrate the AI API, and test the application.

1. Application Objectives

The application must allow students to enter a software project idea and automatically generate a complete project plan containing:

Project objectives.

Main modules and their functions.

Required technologies and development tools.

Development tasks divided into smaller activities.

Task sequence and dependencies.

Milestones and estimated completion times.

Testing plan for each module.

Possible challenges and suggested solutions.

2. Technology Stack

Use the following technologies:

Frontend: React.js with Vite.

Styling: CSS with a modern, responsive design.

Backend: Python with FastAPI.

AI Integration: Google Gemini API using the official google-genai Python SDK.

Configuration: Environment variables stored in a .env file.

Use compatible, currently supported package versions and AI model names. Do not hardcode the API key in source code. Do not require a database unless it is genuinely needed for the requested functionality.

3. Frontend Requirements

Create an attractive dashboard with the following features:

A. Home Page

Application name: Project Planning Agent.

Short description explaining its purpose.

A prominent section to enter a project idea.

A button labelled "Generate Project Plan".

A few example project ideas students can select.

B. Project Input Form

Provide the following fields:

Project title or idea.

Project description.

Project type: Web Application, Mobile Application, AI/ML Project, or Other.

Preferred technology stack, if any.

Team size.

Estimated project duration.

Experience level: Beginner, Intermediate, or Advanced.

Allow the user to submit partial optional details while requiring a project idea.

C. Project Plan Dashboard

Display the generated plan in separate, clearly organized sections:

Project Overview and Objectives.

Modules and Functions.

Technology Stack.

Development Task Breakdown.

Task Dependencies and Sequence.

Milestones and Timeline.

Testing Plan.

Risks and Solutions.

Use cards, tables, progress indicators, numbered steps, and readable headings where appropriate.

D. Additional Features

Copy the generated project plan to the clipboard.

Download the plan as a Markdown or text file.

Provide a "Regenerate Plan" option.

Include loading indicators while the AI generates the plan.

Show friendly error messages when generation fails.

Allow the student to edit the project details and generate a revised plan.

Make the application responsive on desktop, tablet, and mobile screens.

4. Backend and AI Integration

Create a FastAPI backend that communicates with the Gemini API.

Implement the following endpoint:

POST /api/generate-plan

It must accept the project details as JSON, validate the input, construct an effective prompt, call the AI model, and return the generated plan.

Use the following AI system prompt:

"You are an intelligent Project Planning Agent for student software projects. Analyze the project idea and develop a complete, practical project plan.

Perform the following tasks:

Identify the project objectives.

Divide the project into suitable modules and describe their functions.

Identify the required technologies, frameworks, libraries, and tools.

Break development into small, manageable tasks.

Arrange the tasks in the correct order and identify dependencies.

Define milestones and realistic estimated completion times based on the available duration, team size, and experience level.

Prepare a testing plan with test cases, expected results, and relevant modules.

Identify possible technical, scheduling, and implementation challenges and suggest practical solutions.

Adapt the recommendations to the project details provided by the user. Avoid unnecessary technologies and unrealistic timelines. Clearly distinguish estimates from fixed deadlines. Do not invent completed work or claim that tests have been executed.

Return a well-organized project plan with clear headings, tables, numbered lists, and actionable development steps."

The backend must:

Read the API key securely from the .env file.

Validate user inputs.

Handle API failures and invalid responses gracefully.

Return a clear error if the API key is missing.

Keep the API key exclusively on the backend.

Return a structured response that the frontend can render reliably.

Configure CORS for the local frontend development server.

Avoid exposing sensitive configuration in error messages.

5. Project Plan Output Structure

The AI-generated result should contain:

Section 1: Project Overview

Project title.

Problem statement.

Project objectives.

Expected outcome.

Section 2: Module Breakdown

Create a table with:

Module name.

Main functions.

Tasks involved.

Section 3: Technology Requirements

Create a table with:

Technology or tool.

Purpose.

Where it is used.

Section 4: Development Tasks

Create a table with:

Task ID.

Task description.

Estimated duration.

Dependency.

Priority.

Section 5: Task Sequence

Explain the correct development order and identify tasks that can be performed in parallel.

Section 6: Milestones and Timeline

Provide milestone names, deliverables, and estimated completion times. Ensure that the schedule is consistent with the user's specified duration.

Section 7: Testing Plan

Create test cases with:

Test case ID.

Module.

Test scenario.

Expected result.

Section 8: Risks and Solutions

Identify possible challenges, their impact, and suitable preventive or corrective actions.

Section 9: Final Development Roadmap

Provide a concise, ordered checklist of the major implementation stages.

6. Sample Project

Use the following sample project idea to test the application:

"Student Attendance Management System that allows faculty members to mark student attendance, students to view their attendance percentage, and administrators to manage student and faculty records."

The application should generate a project-specific plan instead of returning the same generic plan for every input.

7. Code Quality and Security

Organize frontend and backend code into suitable files and folders.

Use reusable React components.

Keep API logic separate from UI components.

Use appropriate input validation.

Store credentials in .env.

Provide a .env.example file containing placeholder values only.

Add .env to .gitignore.

Never expose the Gemini API key in frontend code.

Include helpful comments where necessary.

Avoid hardcoded sample responses in place of actual AI generation.

8. Required Project Structure

Create a clean structure similar to:

project-planning-agent/

frontend/

src/

package.json

index.html

backend/

main.py

requirements.txt

.env.example

.gitignore

README.md

start instructions or startup scripts, where appropriate.

You may add other files if required for a clean implementation.

9. Testing and Execution

After implementation:

Install the required backend dependencies.

Install the frontend dependencies.

Verify that the frontend builds successfully.

Test the FastAPI health endpoint.

Test the project-plan generation endpoint using a sample project.

Verify that the generated plan is displayed correctly in the frontend.

Test missing API keys and API errors.

Fix any implementation errors discovered during testing.

Verify that the project can be started using clear commands or startup scripts.

Do not claim that a test passed unless you actually ran it.

10. Final Deliverables

Provide:

Complete frontend source code.

Complete backend source code.

Gemini API integration.

Environment configuration template.

Dependency files.

README with setup and execution instructions.

Sample project input.

Working project-plan generation interface.

Test results and any remaining limitations.

Begin by creating the project files and implementing the application. Continue through integration and testing rather than stopping after generating a plan or explaining the architecture.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/093eda3a-9378-5852-a2b4-e41e17aa0ac9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
