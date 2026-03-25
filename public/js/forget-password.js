const inputElement = document.querySelector('.input-email')
const resetButton = document.querySelector('.reset-btn-js');
const popupText = document.querySelector('.popupText')

resetButton.addEventListener('click', () => {

const input = inputElement.value

if(!input.includes('@')) {
    popupText.innerHTML = `<span class="negative-span">Please enter a valid email address</span>`
    popupVanish()
} else {
  popupText.innerHTML = `<span class="positive-span">a link has been sent to your email</span>`
popupVanish()
}

function popupVanish() {
setTimeout(() => {
 popupText.innerHTML = ``;
}, 3000)
}

})