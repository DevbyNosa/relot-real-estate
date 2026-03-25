const messagePop = document.querySelector(".messages");

if (messagePop) {
    setTimeout(() => {
        messagePop.style.display = "none";
        
        
        const url = new URL(window.location);
        url.searchParams.delete('message'); 
        window.history.replaceState({}, document.title, url);
        
    }, 3000);
}
