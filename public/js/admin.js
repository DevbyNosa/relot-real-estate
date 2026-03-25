setTimeout(() => {
    const msg = document.querySelector('.success-msg');
    if (msg) {
        msg.style.transition = 'opacity 0.5s ease';
        msg.style.opacity = '0';
        setTimeout(() => msg.remove(), 500);
    }

      
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
}, 3000); 
