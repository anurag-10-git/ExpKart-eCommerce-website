const loginBtn = document.querySelector('.login');
const signUpBox = document.querySelector('.signup-box');
const header = document.querySelector('.header');

if(loginBtn || signUpBox){

loginBtn.addEventListener('mouseenter',()=>{
    signUpBox.style.display = 'block';
})

header.addEventListener('mouseleave',()=>{
    signUpBox.style.display = 'none';
})

}