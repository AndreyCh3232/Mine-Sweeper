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

