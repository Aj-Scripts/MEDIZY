Medizy Frontend-Backend Integration - Changes Applied
====================================================

What I added/changed:
1. src/utils/api.js
   - axios instance that points to the backend API.
   - automatically attaches JWT token from localStorage key 'medizy_user'

2. src/data/mockData.js
   - Replaced static mock data file with helper functions:
     - getDoctors()
     - getAppointments()
     - createAppointment({ doctorId, date, time, reason })
     - login({ email, password })
     - register({ name, email, password, role })

   This was done so your existing frontend which imports from data/mockData.js will continue to work with minimal edits.
   If your components currently do:
     import { doctors } from '../data/mockData';
   they'll still get an exported (empty) array, but to fetch live data you should call:
     import { getDoctors } from '../data/mockData';
     const docs = await getDoctors();

3. .env.example
   - You can set VITE_API_BASE to point to your deployed backend.

How to finish and run (quick):
1. Start MongoDB locally or set MONGO_URI in backend .env to your Atlas connection.
2. Backend:
   - cd backend
   - copy .env.sample to .env and edit MONGO_URI and JWT_SECRET
   - npm install
   - npm run seed   (creates sample users + appointment)
   - npm run dev
3. Frontend:
   - cd to the frontend project root (where package.json is)
   - npm install
   - npm run dev

Notes:
- I did not attempt to change every component file. Instead I provided api helpers and replaced mockData.js so your components can opt-in to call the backend functions.
- If you want, I can perform automated edits to component files to replace direct mock data usage with async calls. For now, this keeps changes minimal and low-risk.

--------------------------
Generated files are included in the zip.
