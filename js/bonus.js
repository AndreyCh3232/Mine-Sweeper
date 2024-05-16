'use strict'

const HINT = '💡'

var hints
var hintCells = []
var hintMode = false
var gameStateHistory = []

function createHint() {

    var elHint = ''
    for (var i = 0; i < hints; i++) {

        elHint += `<div class="hint" onclick="activeHintMode(this)">${HINT}</div>`
    }
    var elHintsContainer = document.querySelector('.hints-container')
    elHintsContainer.innerHTML = elHint
}

function activeHintMode(lHint) {
    if (gameOver) {
        return
    }
    hintMode = true
    lHint.classList.add('hint-active')
}

function hintExpendShow(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i >= 0 && i < gBoard.length && j >= 0 && j < gBoard[0].length) {
                const currCell = gBoard[i][j]
                if (currCell.isMarked || currCell.isShown) continue
                hintCells.push(currCell)
                currCell.isShown = true
                gGame.shownCount++
                hintCells.push(currCell)
            }
        }
    }
    renderBoard(gBoard)
}

function hintClicked(i, j) {

    if (hints > 0) {
        var currHint = { i, j }
        if (!currHint.isShown && !currHint.isMarked) {
            currHint.isShown = true
            gGame.shownCount++
            hintCells.push(currHint)
            hintExpendShow(i, j)
            hintMode = false
            hints--
        }
    }
    setTimeout(() => {
        for (var x = 0; x < hintCells.length; x++) {
            var cell = hintCells[x]
            cell.isShown = false
            gGame.shownCount--
        }
        hintCells = []
        renderBoard(gBoard)
    }, 1000)
    createHint()
}


function updateGameState() {
    var gameState = {
        gBoard: JSON.parse(JSON.stringify(gBoard)),
        gGame: JSON.parse(JSON.stringify(gGame)),
        lives: lives,
        hints: hints

    }
    gameStateHistory.push(gameState)
}

function undo() {
    if (gameStateHistory.length > 1) {
        gameStateHistory.pop()
        var prevState = gameStateHistory.pop()
        gBoard = prevState.gBoard
        gGame = prevState.gGame
        lives = prevState.lives
        hints = prevState.hints

        if (gameOver) {
            return
        }

        renderBoard(gBoard)
        updateGameState()
    }
}