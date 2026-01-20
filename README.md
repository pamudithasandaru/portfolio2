# Portfolio Website - MERN Stack

## Project Structure

```
portfolio2/
├── client/                 (React Frontend)
│   ├── src/
│   │   ├── components/    (React Components)
│   │   │   ├── Navbar.jsx
│   │   │   └── Hero.jsx
│   │   ├── styles/        (CSS Files)
│   │   │   ├── Navbar.css
│   │   │   └── Hero.css
│   │   ├── assets/
│   │   │   └── images/   (Images & logos)
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── server/                (Express Backend)
    ├── server.js
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Frontend Setup
```bash
cd client
npm install
npm start
```
The app will run on `http://localhost:3000`

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
The server will run on `http://localhost:5000`

## Current Components

### 1. Navbar
- Responsive navigation bar with email display
- Mobile hamburger menu
- Links to Home, About, Projects, Certifications & Skills
- Sticky positioning

### 2. Hero Section
- Greeting and title display
- "Hire me" button with toggle switch
- Social media icons (Facebook, LinkedIn, GitHub)
- Profile image section
- Fully responsive design with animations

## Next Steps

1. Add your profile image to `client/src/assets/images/profile.jpg`
2. Update social media links in the Hero component
3. Add more components (About, Projects, Skills sections)
4. Set up MongoDB connection
5. Create backend API routes
6. Add contact form functionality

## Dependencies

- React & React DOM
- react-icons (for social media icons)
- Express (backend)
- MongoDB (database)

## Notes

- Replace all placeholder links with your actual social media URLs
- Update the email address in the navbar if needed
- Customize colors and styling as needed
