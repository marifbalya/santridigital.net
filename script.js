document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Login Modal
    const loginButtons = document.querySelectorAll('.btn-login');
    const modal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    
    loginButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simulate login (no actual backend)
            alert(`Login simulasi berhasil!\nEmail: ${email}\nPassword: ${password.replace(/./g, '*')}`);
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            loginForm.reset();
        });
    }
    
    // Scroll Animation
    const animateOnScroll = function() {
        const blocks = document.querySelectorAll('.block');
        
        blocks.forEach(block => {
            const blockPosition = block.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (blockPosition < screenPosition) {
                block.classList.add('fade-in');
            }
        });
    };
    
    // Initial check on load
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Product "Beli Sekarang" buttons
    const buyButtons = document.querySelectorAll('.btn-beli');
    buyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Fitur pembelian akan mengarahkan ke halaman checkout setelah login.');
        });
    });
    
    // Free App "Akses Sekarang" buttons
    const accessButtons = document.querySelectorAll('.gratis-card .btn-primary');
    accessButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const appName = this.closest('.gratis-card').querySelector('h3').textContent;
            alert(`Anda dapat mengakses aplikasi "${appName}" secara gratis tanpa login.`);
        });
    });
    
    // Premium App buttons
    const premiumButtons = document.querySelectorAll('.btn-premium');
    premiumButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const appName = this.closest('.premium-card').querySelector('h3').textContent;
            alert(`Untuk berlangganan "${appName}", silakan login terlebih dahulu.`);
        });
    });
});