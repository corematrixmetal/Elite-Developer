// Initialize Lucide icons
lucide.createIcons();

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

function updateTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }
}

themeToggle.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        localStorage.theme = 'light';
    } else {
        localStorage.theme = 'dark';
    }
    updateTheme();
});

updateTheme();

// Scroll Progress
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height);
    document.getElementById('scroll-progress').style.transform = `scaleX(${scrolled})`;
});

// Reveal animations on scroll
const observerOptions = {
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Gallery Rendering
const galleryImages = [
    { src: 'static/images/copper-1.png', alt: 'Millberry Wire' },
    { src: 'static/images/copper-2.png', alt: 'Copper Pipes' },
    { src: 'static/images/copper-3.png', alt: 'Sorting Facility' },
    { src: 'static/images/copper-4.png', alt: 'Heavy Plate' },
    { src: 'static/images/copper-5.png', alt: 'Ready Bales' },
    { src: 'static/images/copper-6.png', alt: 'Quality Check' }
];

const galleryGrid = document.getElementById('gallery-grid');
galleryImages.forEach((img, idx) => {
    const div = document.createElement('div');
    div.className = `reveal delay-${(idx % 3) * 200} gallery-item overflow-hidden rounded-[2rem] border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900`;
    div.innerHTML = `<img src="${img.src}" alt="${img.alt}" class="w-full aspect-[4/3] object-cover">`;
    galleryGrid.appendChild(div);
    observer.observe(div);
});

// Contact Form WhatsApp Integration
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const message = formData.get('message');
    
    const whatsappText = `*New Quote Request - Core Matrix Metal*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Details:* ${message}`;
    const whatsappUrl = `https://wa.me/919113887257?text=${encodeURIComponent(whatsappText)}`;
    
    window.open(whatsappUrl, '_blank');
});
