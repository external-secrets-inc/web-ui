---
name: User Story
about: New User Story
title: ''
labels: 'feature'
assignees: ''
why: [reason for the story]

---

# Description

Give a good description of the problem and what it solves in the business context.

```markdown
1. The goal is to enable Async Secret Rotation in the Kubernetes cluster by listening for secret rotation notifications from various secret providers.
  1. […]
```
# Definition Of Done
List specific, measurable criteria that must be met for the issue to be considered complete:

- Criterion 1: [Specific requirement]
- Criterion 2: [Specific requirement]
- Criterion 3: [Specific requirement]

Example:

- User can access the "Forgot Password" link from the login page
- User receives a password reset email within 5 minutes of request
- New password must meet security requirements (8+ characters, 1 uppercase, 1 number, 1 special character)
- Complete subtasks, even infra, if needed.

# Test Cases
Outline test cases to verify the functionality:

- Test Case 1: [Description of test scenario]
    - Steps to reproduce
    - Expected outcome
- Test Case 2: [Description of test scenario]
- Example:
    
    Test Case: Successful Password Reset
    
    - Steps:
        1. Click "Forgot Password" link
        2. Enter registered email
        3. Check email and click reset link
        4. Enter new password meeting requirements
        5. Submit new password
    - Expected outcome: User can log in with the new password

# Additional Information
Include any relevant details such as:

- Screenshots or screen recordings
- Error messages
- System specifications (if relevant)
- Links to related issues or documentation
