
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if(window.scrollY > 50) {  // cuando scroll > 50px
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
