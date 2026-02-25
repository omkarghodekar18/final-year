sequenceDiagram
actor User
participant System as Platform
participant ResumeParser as Resume Parser
participant JobAPI as Job Platforms API
participant AIInterview as AI Interview Engine
participant Upskill as Upskilling Module

    User->>System: Create Profile & Upload Resume
    System->>ResumeParser: Send Resume for Preprocessing
    ResumeParser-->>System: Extracted Skills (S)

    System->>JobAPI: Fetch Top Job Descriptions based on S
    JobAPI-->>System: Return Ranked JD List
    System-->>User: Display Top JD List

    User->>System: Select Job Description (JD_selected)
    System->>AIInterview: Generate Role-based Questions
    AIInterview-->>System: Questions Generated

    System->>User: Start AI Avatar Interview
    User->>AIInterview: Answer Interview Questions
    AIInterview-->>System: Evaluation Score (R)

    System->>Upskill: Analyze Score & Identify Skill Gaps
    Upskill-->>System: Generate Personalized Learning Path (P)
    System-->>User: Show Feedback, Score & Upskilling Path
