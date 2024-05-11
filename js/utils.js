'use strict'


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(val) {

    var valString = val + ''
    if (valString.length < 2) {
        return '0' + valString
    } else {
        return valString
    }
}

function startTime() {

    var elMinuteContainer = document.querySelector('.minutes')
    var elSecondsContainer = document.querySelector('.seconds')
    var starTime = Date.now()
    gIntervalId = setInterval(function () {

        var elapsed = Math.floor((Date.now() - starTime) / 1000)
        var minutes = Math.floor(elapsed / 60)
        var seconds = elapsed % 60

        elSecondsContainer.innerText = pad(seconds)
        elMinuteContainer.innerText = pad(minutes)
    }, 100)
}

function endTimer() {
    clearInterval(gIntervalId)
}


