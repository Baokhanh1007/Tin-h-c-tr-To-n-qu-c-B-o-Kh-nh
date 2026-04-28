// NAVBAR SCROLL
window.addEventListener("scroll", function(){
  const navbar = document.querySelector(".navbar");

  if(window.scrollY > 50){
    navbar.classList.add("scrolled");
  }else{
    navbar.classList.remove("scrolled");
  }

  reveal();
});

// REVEAL ANIMATION
function reveal(){

  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((el)=>{

    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;

    if(elementTop < windowHeight - 100){
      el.classList.add("active");
    }

  });

}

reveal();