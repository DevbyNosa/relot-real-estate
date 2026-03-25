
const navIcon = document.querySelector('.small-nav-icon');
const sidebarMenu = document.querySelector('.sm-nav'); 
const closeIcon = document.querySelector('.sm-close-icon');


function toggleMenu(event) {
    if (event) event.stopPropagation(); 
    sidebarMenu.classList.toggle('open');
    navIcon.classList.toggle('active'); 
}


navIcon.addEventListener('click', toggleMenu);


if (closeIcon) {
    closeIcon.addEventListener('click', toggleMenu);
}


document.addEventListener('click', (e) => {
    const isClickInsideMenu = sidebarMenu.contains(e.target);
    const isClickOnHamburger = navIcon.contains(e.target);
   
    if (sidebarMenu.classList.contains('open') && !isClickInsideMenu && !isClickOnHamburger) {
        toggleMenu();
    }
});




const aboutSection = document.querySelectorAll('.reveal')
const observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if(entry.isIntersecting){
        entry.target.classList.add("about-show")
         observer.unobserve(entry.target); 
    } else {
        entry.target.classList.remove("about-show")
    }
   })
}, {
    threshold: 0.2,
}) 


aboutSection.forEach(aboutSections => observer.observe(aboutSections))


const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  
  question.addEventListener('click', () => {
   
    
    faqItems.forEach(otherItem => {
      if (otherItem !== item) otherItem.classList.remove('active');
    });
    
   
    item.classList.toggle('active');
  });
});


