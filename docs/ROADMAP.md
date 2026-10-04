# What to build next

1. **Accounts and saved progress**: registration/login (bcrypt + secure sessions or JWT); tables `users`, `user_progress`, `applications`; move localStorage state to the database.
2. **Content in the database**: tables `degrees`, `subjects`, `skills`, `skill_prereqs`, `careers`, `roadmaps`, `projects`, `resources`, `platforms`; seed from the data object in `frontend/index.html`; authenticated admin CRUD.
3. **Global search** across careers, skills, subjects, tools, platforms and projects.
4. **Job-description analyzer** ("Understand this job") using the AI layer, compared with the student's profile.
5. **Frontend migration** to React/Next.js + TypeScript with a bundler; then remove `'unsafe-inline'` from the CSP.
6. **More disciplines** (business, engineering, health, sciences, creative) through the content tables above.
7. **Quality**: automated tests (API + UI), a screen-reader accessibility audit, a Lighthouse pass, real-device mobile testing.
8. **Resources**: add vetted external links with clear source labels (no unverified links are included in v1.0).
