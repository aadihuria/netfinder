/*Home Page*/ 
document.addEventListener('DOMContentLoaded', () => {
  const learnMoreBtn = document.getElementById('learn-more-btn');
  learnMoreBtn.addEventListener('click', () => {
    alert('Explore our features to find and connect with players!');
  });
});



/*Slideshow script*/ 
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

function showSlide(index) {
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
}
nextBtn.addEventListener('click', () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
});
prevBtn.addEventListener('click', () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
});

// Learn More button links to courts.html and passes court name
document.querySelectorAll('.learn-more-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const courtName = btn.dataset.court;
    localStorage.setItem('courtToShow', courtName);
    window.location.href = 'courts.html';
  });
});
