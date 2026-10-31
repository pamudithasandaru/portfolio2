// Built-in text for the editable parts of the site. The admin panel stores only the
// values you change; everything else falls back to what is written here.
export const siteDefaults = {
  navbar: {
    logoText: 'Pamuditha Sandaru',
    email: 'pamudithasandaru2002@gmail.com',
  },
  hero: {
    greeting: 'Hi!',
    name: "I'M SANDARU GUNASENA",
    subtitle: 'AI/ML Enthusiast & Developer',
    roleText: 'Software Engineering Intern at Creative Software',
    // Empty image fields use the pictures bundled with the site
    companyLogo: '',
    profileImage: '',
    profileAlt: 'Sandaru Gunasena',
    hireLabel: 'Hire me',
  },
  about: {
    title: 'About Me',
    greeting: "Hello! I'm",
    name: 'Sandaru Gunasena',
    intro:
      ', a passionate AI/ML enthusiast and developer dedicated to creating innovative solutions that make a difference.',
    paragraphs: [
      'With a strong foundation in machine learning, deep learning, and software development, I enjoy tackling complex problems and turning ideas into reality. My journey in technology has been driven by curiosity and a desire to continuously learn and grow.',
      "I specialize in building intelligent applications, developing predictive models, and creating user-friendly interfaces. When I'm not coding, you'll find me exploring the latest trends in AI research or contributing to open-source projects.",
    ],
    stats: [
      { number: '2+', label: 'Years Experience' },
      { number: '10+', label: 'Projects Completed' },
      { number: '5+', label: 'Technologies' },
    ],
    educationTitle: 'Education',
    education: [
      {
        year: '2023 May - Present',
        role: 'BSc in Computer Engineering',
        meta: 'Faculty of Engineering, University of Ruhuna',
      },
      { year: '2022 April - 2022 July', role: 'Diploma in English', meta: 'British Way English Academy' },
      {
        year: '2018 Dec - 2019 June',
        role: 'Diploma in Information Technology',
        meta: 'Visiontec International, Anuradhapura',
      },
      {
        year: '2018 Dec - 2019 June',
        role: 'Diploma in Graphic Design',
        meta: 'Visiontec International, Anuradhapura',
      },
    ],
    contactHeading: 'Discuss New Projects',
    contactIntro:
      'Have an idea, feedback, or collaboration opportunity? Send me a quick message and I will reply by email.',
  },
  footer: {
    brand: 'Sandaru Gunasena',
    subtitle: 'AI/ML Enthusiast & Developer',
    description:
      'Building practical and human-centered digital experiences with a focus on machine learning, software engineering, and continuous growth.',
    email: 'pamudithasandaru2002@gmail.com',
    phone: '+94 71 0395 435',
    copyrightName: 'Sandaru Gunasena',
  },
  socials: [
    { platform: 'facebook', url: 'https://www.facebook.com/pamuditha.sandaru', inHero: true, inFooter: false },
    {
      platform: 'linkedin',
      url: 'https://www.linkedin.com/in/pamuditha-sandaru-4561ab280',
      inHero: true,
      inFooter: true,
    },
    { platform: 'github', url: 'https://github.com/pamudithasandaru', inHero: true, inFooter: true },
  ],
};

// Stored values win over defaults, one section at a time
export const mergeSiteContent = (stored) => {
  const source = stored && typeof stored === 'object' ? stored : {};
  const merged = {};

  for (const [key, fallback] of Object.entries(siteDefaults)) {
    const value = source[key];
    merged[key] = Array.isArray(fallback)
      ? (Array.isArray(value) ? value : fallback)
      : { ...fallback, ...(value && typeof value === 'object' ? value : {}) };
  }

  return merged;
};
