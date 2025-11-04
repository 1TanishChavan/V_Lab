TAKE References, Abstract, Introduction, Keywords FROM THE MAIN REPORT .

### Proposed Methodology

The development of the _Virtual Lab_ system followed a phased and modular methodology tailored to address the pedagogical needs of remote programming education. The primary objective was to create a responsive, secure, and scalable platform for students to write, run, and submit code online, and for faculty to manage practicals, test cases, and evaluations efficiently.

#### 1. Problem Identification and Requirements Gathering

The methodology began with a thorough problem identification process. Faculty and students were consulted to understand the limitations of traditional lab environments and existing virtual coding tools. Key challenges included lack of automation in evaluation, limited feedback to students, manual workload for instructors, and no unified system to manage courses, batches, and assessments. Based on this, functional and non-functional requirements were gathered, categorized by user roles, and validated by academic stakeholders.

#### 2. Planning and System Design

Once requirements were finalized, the system was broken down into modules based on user roles: students, faculty, HOD, and admin. Each module was designed with clearly defined inputs, outputs, and interactions. The student module would focus on code writing, submission, and feedback; the faculty module would allow for practical creation, test case management, and result evaluation; administrative modules would manage courses, users, departments, and batch assignments.

During this phase, RESTful API endpoints were mapped out to connect frontend components with backend services. The system also needed to incorporate secure and scalable remote code execution, which was addressed by planning for integration with Judge0, an open-source code execution engine.

#### 3. Interface Development and Frontend Engineering

The next phase involved frontend implementation using a component-driven approach. A modern JavaScript framework was chosen for building a responsive user interface. A sophisticated web-based code editor was integrated into the student environment to support real-time coding in multiple languages. Visual elements like breadcrumb navigation, test case cards, submission output displays, and interactive buttons were designed to streamline user actions.

Faculty interfaces were developed to support uploading practical descriptions, setting test cases (including marking them as public or private), assigning batches, and viewing student submissions. Form validations, toasts for success/error notifications, and visual feedback mechanisms were embedded to ensure a smooth experience across the platform.

#### 4. Backend Implementation and Integration

The backend was developed in parallel, with a focus on data integrity, role-based access control, and asynchronous task handling. REST APIs were built to handle student submissions, faculty practical management, and admin configurations. Rate-limiting mechanisms were implemented using Redis to prevent overuse of code execution endpoints.

The system architecture was planned to ensure separation of concerns—keeping the backend logic, database operations, and Judge0 communication modular. For batch code submissions, asynchronous polling was implemented to fetch execution results without blocking frontend threads. This allowed users to continue interacting with the system while their submissions were being processed.

#### 5. Database Design and Role Enforcement

A relational database schema was created using PostgreSQL, supporting the core entities such as users, departments, courses, practicals, test cases, batches, and submissions. The design emphasized normalization and referential integrity. Role-based access was enforced at both application and database levels to ensure users could only view or modify data appropriate to their role.

Submissions were linked with test case results and stored with status labels like “Pending,” “Accepted,” or “Rejected.” Practical data was associated with test case inputs/outputs, and batch access was controlled using deadlines and lock flags, allowing faculty to manage when and how students could submit work.

#### 6. Integration of Code Execution Engine (Judge0)

To handle dynamic code execution, the Judge0 engine was integrated as a containerized service. It was chosen for its flexibility in supporting multiple languages and its secure sandboxing capabilities. Code submitted by students was sent to Judge0 via RESTful API calls. For batch submissions, results were fetched asynchronously using polling mechanisms and evaluated against expected outputs to determine pass/fail status.

A caching mechanism using Redis was employed to store temporary results, ensuring faster retrieval of execution data and reducing repeated queries to the Judge0 API.

#### 7. Testing, Evaluation, and Deployment

Once the core modules were implemented, the system was subjected to unit testing and integration testing across all components. Manual testing with students and faculty was conducted to validate usability and performance under realistic conditions. Issues related to UI responsiveness, API delays, and Judge0 timeouts were identified and resolved.

The platform was containerized using Docker Compose, allowing all services—frontend, backend, Redis, PostgreSQL, and Judge0—to run in isolated and reproducible environments. This ensured smooth deployment across development and production systems.

### System Architecture

The Virtual Lab project is a comprehensive web-based platform designed to facilitate remote programming practice and assessment. It is architected with a modular, service-oriented approach to support scalability, maintainability, and security. The system consists of three major layers: the frontend interface, the backend API server, and the code execution engine, which collectively enable students to write, execute, and submit code seamlessly while allowing faculty to create, manage, and evaluate practical assignments.

#### 1. Requirement Analysis and System Design

The development process began with detailed requirement gathering through discussions with faculty and student groups. The primary needs identified included the ability to write and execute code online, submit assignments, receive immediate feedback, and manage submissions in a secure, organized manner. Faculty needed tools to create assignments, define test cases, assign practicals to specific student batches, and evaluate or override results manually if necessary.

Based on these insights, the architecture was designed using a client-server model with a RESTful API at the core. The system was structured into three main layers: a frontend interface for user interaction, a backend server for logic and data processing, and an external judge engine for code execution. Clear boundaries were maintained between components to ensure modularity and scalability.

#### 2. User Interface and Frontend Development

The frontend was developed using a modern JavaScript framework with TypeScript for type safety and maintainability. A dynamic web-based coding interface was created using an advanced code editor, enabling students to write code in multiple programming languages with syntax highlighting and formatting features. The interface also supported running and submitting code, displaying public test cases, and receiving real-time feedback including output, errors, and execution status.

The student dashboard included navigation tools to browse practicals by course, check deadlines, and view past submissions. Conditional rendering ensured different views for students and faculty. Faculty users accessed a dashboard to create and update practicals, define input/output test cases, assign practicals to batches, and manage access deadlines. Notification systems were integrated to confirm actions, display errors, and guide users through each process intuitively.

#### 3. Backend API and Service Logic

The backend server was built using a high-performance JavaScript runtime with Express.js for routing and middleware support. A robust authentication and authorization system was developed to support various user roles, including Admin, HOD, Faculty, and Students. Each role was given distinct privileges enforced via middleware at the API level.

To facilitate code execution, the backend connected to the Judge0 API. When a student submitted code, the backend first verified the action against a Redis-based rate-limiting mechanism to prevent overuse or abuse of system resources. The system implemented two distinct Redis instances—one for tracking code submissions and another for one-time code runs—to provide more granular control over user activity.

Once the rate limit check passed, the backend evaluated whether the student had a previously accepted submission for the same practical. If so, it bypassed redundant evaluation and immediately returned the stored result. Otherwise, it retrieved the relevant test cases from the database and sent the code and inputs to Judge0 via a batch submission request. An initial status of "Pending" was recorded in the database and cached in Redis for quick access.

#### 4. Asynchronous Polling and Result Evaluation

Given that code execution, especially in batch mode, can be time-consuming depending on the number of test cases, the system used an asynchronous processing model. Once the submission was sent to Judge0, the backend triggered a background task that polled the Judge0 API periodically—up to six times, with a five-second interval—to check for the final results.

Once all results were retrieved, the backend evaluated whether the output matched the expected results for all test cases. If all passed, the submission status was updated to “Accepted,” and the corresponding marks were awarded in the database. If any test case failed, the status was marked as “Rejected,” and partial or zero marks were assigned. The final status was updated in both the database and Redis. Redis keys were given an expiry of one hour to maintain short-term caching while ensuring consistency.

The frontend was then notified of the result update, allowing it to refresh the display in real time without requiring the user to manually reload the page. This design improved responsiveness and enhanced the user experience.

#### 5. One-Time Code Execution (Run) Handling

For situations where students only wished to run code and not submit it for grading, a simpler execution flow was implemented. The system again enforced a separate rate limit check and, if approved, forwarded the code and language data to Judge0 using a single-run endpoint. The output, errors, and execution status were processed and returned immediately. This path did not involve database writes or test case validation, thus ensuring faster turnaround.

#### 6. Database Schema and Role-Based Access Control

A normalized relational database schema was designed using PostgreSQL to manage users, departments, courses, practicals, submissions, test cases, and batch assignments. The database enforced foreign key constraints to ensure data integrity across related tables. Role-based access was implemented at both the backend and database levels to enforce permissions and ensure that users could only interact with data relevant to their roles.

Admins could create and manage departments, courses, and users. HODs could assign faculty to courses and manage departmental data. Faculty members had access to tools for creating and evaluating practicals, while students could only view and interact with practicals assigned to their batches.

The schema included dedicated tables for practical details, programming languages, test cases (with visibility flags for public/private), batch assignments, and student submissions. This design supported flexible practical assignment, batch-wise control, and accurate grading.

#### 7. Containerized Deployment and Integration

To ensure portability and ease of deployment, the system was fully containerized using Docker Compose. Services defined in the environment included the backend API server, frontend application, Judge0 execution engine, PostgreSQL database, and Redis instances. Judge0 workers were run in isolated containers with access to system resources for secure and efficient code execution.

The use of containerization allowed the development team to test and deploy the system consistently across various environments, from local development setups to cloud-hosted infrastructure. The modular service structure also laid the groundwork for future scaling, such as load balancing for high-traffic scenarios or parallel Judge0 worker instances for faster processing.

########################
########################
BELOW IS ANOTHE System Architecture TAKE WHICH IS BETTER
########################
########################

### System Architecture

The Virtual Lab project is a comprehensive web-based platform designed to facilitate remote programming practice and assessment. It is architected with a modular, service-oriented approach to support scalability, maintainability, and security. The system consists of three major layers: the frontend interface, the backend API server, and the code execution engine, which collectively enable students to write, execute, and submit code seamlessly while allowing faculty to create, manage, and evaluate practical assignments.

#### 1. Frontend Interface and User Interaction

The _Virtual Lab_ project is a comprehensive web-based platform designed to facilitate remote programming practice and assessment. It is architected with a modular, service-oriented approach to support scalability, maintainability, and security. The system consists of three major layers: the frontend interface, the backend API server, and the code execution engine, which collectively enable students to write, execute, and submit code seamlessly while allowing faculty to create, manage, and evaluate practical assignments.

#### 2. Student Environment and Faculty Tools

The frontend of the platform is developed using React and TypeScript, with a strong emphasis on usability and responsiveness. At the core of the user interface is the `CodeEnv1.tsx` component, which integrates the Monaco editor to support writing code in multiple programming languages. Students can run or submit their code through this interface, with real-time feedback displayed for errors, outputs, and execution status. The system employs breadcrumb navigation, card-based layouts for public test cases, and a dynamic UI to enhance the user experience. Faculty interaction is primarily facilitated through components such as `PracticalCreation.tsx`, which allows the creation of programming assignments with detailed metadata, and `PracticalSubmission.tsx`, which enables the review and grading of student submissions.

#### 3. Backend Services and Code Processing Logic

The backend is built using Node.js and Express, orchestrating the business logic and handling communication with both the frontend and the Judge0 code execution API. It is responsible for authenticating users, managing submissions, and ensuring the integrity of the application’s workflows. A key feature of the backend is its rate-limiting mechanism, implemented using Redis, to prevent abuse of the code execution service. Separate Redis instances are used for limiting code submissions and code runs. When a student submits or runs code, the system first verifies the action against these rate limits. If allowed, the backend either retrieves previously accepted submissions to avoid redundant processing or fetches relevant test cases from the database.

#### 4. Submission Flow and Asynchronous Evaluation

For code submissions, the backend sends both the user’s code and the test cases to the Judge0 API using a batch submission endpoint. Initial execution results are stored temporarily in Redis and marked as “Pending” in the database. To avoid blocking the frontend, the system uses asynchronous polling to periodically check Judge0 for final execution results. This polling process makes up to six attempts at five-second intervals. Once results are available, the system evaluates the test case outputs to determine whether the submission should be accepted or rejected. It then updates both the database and Redis with the final status and notifies the frontend, which updates the user interface accordingly.

#### 5. On-Demand Code Execution (Run) Flow

The backend also supports single code runs, which are processed through a similar flow but using a single-run endpoint from Judge0. In this case, there is no need to evaluate against test cases or store persistent records. The output, execution status, and errors are returned immediately to the frontend for display.

#### 6. Data Management and Relational Schema

The relational database, implemented with PostgreSQL, supports robust data management for users, submissions, practicals, courses, and institutional entities like departments and batches. Tables such as `Practicals`, `Prac IO`, and `Submissions` enable faculty to store programming tasks and students to submit and track their work. Relationships are enforced using foreign keys, ensuring consistency and data integrity throughout operations like test case evaluation and submission tracking.

#### 7. Containerization and Service Deployment

Containerization is achieved using Docker Compose, which defines services for the backend, frontend, Judge0 execution engine, Redis instances, and PostgreSQL database. The Judge0 workers run in isolated environments to securely execute untrusted code in a variety of programming languages. This separation of services promotes scalability, fault tolerance, and ease of deployment, ensuring that the system can efficiently handle a large number of concurrent users.

#### 8. Summary

In conclusion, the Virtual Lab architecture effectively integrates modern frontend technologies, a robust backend with asynchronous processing, and secure remote code execution to deliver a rich, responsive educational environment for both students and faculty.

### Implementation and Evaluation

Implementation and Evaluation details the technologies used, the architectural choices made during development, and the steps taken to ensure a robust and scalable platform. Additionally, it highlights how the system was tested and evaluated for functionality, reliability, and user experience in real-world academic scenarios.

#### 1. Frontend and Backend Implementation

The implementation of the _Virtual Lab_ system followed a full-stack approach with an emphasis on modular design and scalability. The frontend was developed using **React** and **TypeScript**, with **Zustand** for state management and **Tailwind CSS** along with **Radix UI** for a clean, responsive user interface. The Monaco Editor was integrated to deliver a rich in-browser code writing experience supporting multiple programming languages. On the backend, **Node.js** and **Express** were used to build a RESTful API that handled authentication, practical management, and code submission workflows. The backend also included middleware for logging, validation, and security enforcement.

#### 2. Technology Stack

The core technologies used in this project include **React**, **TypeScript**, **Monaco Editor**, and **Tailwind CSS** on the frontend, while the backend leverages **Node.js**, **Express**, **PostgreSQL**, and **Redis**. Code execution is powered by **Judge0**, an open-source engine that safely runs code inside isolated containers. **Docker Compose** is used for containerizing all services, including Judge0, Redis, PostgreSQL, frontend, and backend. **Axios** handles HTTP communication between frontend and backend, while **Drizzle ORM** is used for type-safe interactions with the relational database.

#### 3. Evaluation and Performance

System evaluation was conducted through unit tests, integration tests, and live testing with real students and faculty in a classroom setting. The platform successfully executed code in real-time across various programming languages and responded accurately to both runs and submissions. The rate-limiting mechanism using dual Redis instances efficiently controlled high-traffic usage, preventing overload. Faculty members could create practicals, assign them to specific batches, and view submissions with feedback and grading tools. The asynchronous result processing ensured minimal frontend delays, even during bulk submissions.

### Results and Discussion

This section presents the outcomes observed during the deployment and testing of the _Virtual Lab_ system in a real-world academic environment. The discussion highlights student and faculty interactions with the platform, performance under load, and the overall effectiveness of its features in achieving the project’s educational goals.

#### 1. Student Interaction and Code Execution Experience

From the student perspective, the platform provided a smooth and efficient coding environment. The Monaco Editor embedded in the frontend allowed students to write and execute code directly within the browser. Code execution feedback, including outputs, errors, and runtime information, was delivered quickly due to the system's asynchronous backend design and Redis caching. The Judge0 integration successfully supported multiple programming languages and consistently returned accurate results based on public and private test cases. Rate limiting was enforced effectively without affecting normal usage patterns, maintaining both system integrity and user satisfaction.

#### 2. Faculty Workflow and Evaluation Efficiency

Faculty users interacted with the system through dedicated modules for creating practicals, assigning them to batches, and evaluating submissions. The dashboard enabled real-time tracking of submission statuses and provided grading tools, including manual overrides for marks and status updates. Automated evaluation based on test case results significantly reduced the manual workload on instructors while still allowing human oversight. The system's batch access and deadline management features helped ensure controlled and fair evaluation across student groups.

#### 3. System Performance and Scalability

The system demonstrated strong performance under concurrent usage, maintaining responsiveness and accuracy even during high-load periods. Dockerized service deployment, especially for Judge0 workers, ensured efficient resource allocation and isolation. Occasional latency in batch evaluations was observed but handled gracefully through background polling and temporary result caching, ensuring a responsive user interface.

### Conclusion

The _Virtual Lab_ system presents an effective and scalable solution for remote programming education and assessment. By integrating a modern frontend interface with a robust backend and secure code execution via Judge0, the platform bridges the gap between learning and evaluation in an online environment. Its asynchronous architecture, combined with intelligent caching and rate-limiting mechanisms, ensures responsiveness and stability even under heavy usage.

Students benefit from an intuitive, browser-based coding environment with real-time feedback, while faculty members are equipped with tools to efficiently create, assign, and evaluate practical tasks. The modular design, containerized deployment, and role-based access controls make the system adaptable for various academic scenarios and institutions.

Overall, the Virtual Lab successfully addresses key challenges in conducting practical programming exercises online, demonstrating both technical robustness and pedagogical value. It lays a strong foundation for future enhancements, such as AI-assisted grading, analytics-based feedback, and support for collaborative coding environments.

### Acknowledgment

The authors would like to express their sincere gratitude to the Department of Artificial Intelligence and Data Science, Vasantdada Patil Pratishthan’s College of Engineering, Mumbai, for providing the academic environment, technical resources, and infrastructure that made the successful development of the _Virtual Lab_ project possible.

We extend our heartfelt thanks to our faculty mentors and evaluators for their constant support, constructive feedback, and valuable guidance throughout all phases of the project. Their insights were instrumental in shaping the system’s design, functionality, and educational impact.

We also wish to thank the students and faculty members who actively participated in the testing and feedback sessions during the pilot rollout. Their real-world use and observations helped us validate the system’s performance and usability, and informed several key improvements.

Finally, we gratefully acknowledge the developers and maintainers of the open-source technologies that powered our system, including Judge0, Docker, Redis, PostgreSQL, and the broader React and Node.js ecosystems. Their contributions were vital in bringing the _Virtual Lab_ to life.

FLOW CHART:
