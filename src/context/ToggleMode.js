const darkmode = document.getElementsByClassName('darkmode')

darkmode.addEventListener('click',()=>{
    document.body.classList.toggle('dark-mode-variables');
    darkmode.querySelector('span:nth-child(1)').classList.toggle('active');
    darkmode.querySelector('span:nth-child(2)').classList.toggle('active');
});