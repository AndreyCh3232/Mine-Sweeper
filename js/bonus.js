'use strict'

const HINT = '💡'

var hints
var hintCells = []
var hintMode = false
var gameStateHistory = []
var gSafeClicks = 3
var isDarkMode = false
var isMegaHintMode = false
var megaHintFirstCell = null
var megaHintSecondCell = null
var hasUsedMegaHint = false

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
    if (hintMode) {
        deactivateHintMode()
        return
    }
    hintMode = true
    lHint.classList.add('hint-active')
}

function deactivateHintMode() {
    hintMode = false
    const activeHintElement = document.querySelector('.hint-active')
    if (activeHintElement) {
        activeHintElement.classList.remove('hint-active')
    }
}

function hintExpendShow(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i >= 0 && i < gBoard.length && j >= 0 && j < gBoard[0].length) {
                const currCell = gBoard[i][j]
                if (currCell.isMarked || currCell.isShown) continue
                hintCells.push(currCell)
                currCell.isShown = true
            }
        }
    }
    renderBoard(gBoard)
    return hintCells
}

function hintClicked(i, j) {

    const clickedCell = gBoard[i][j]

    if (hints > 0 && hintMode) {
        hintCells = []
        hintExpendShow(i, j)
        if (!clickedCell.isMarked) {
            clickedCell.isShown = false
        }
        deactivateHintMode()
        hints--

        setTimeout(() => {
            for (var x = 0; x < hintCells.length; x++) {
                var cell = hintCells[x]
                cell.isShown = false
            }
            hintCells = []
            renderBoard(gBoard)
            createHint()
        }, 1000)
    }
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

function safeClick() {
    if (!gGame.isOn) return

    if (gSafeClicks > 0) {
        const randomCell = findSafeCell()
        if (randomCell) {
            randomCell.classList.add('safe')
            setTimeout(() => {
                randomCell.classList.remove('safe')
            }, 2000)
            gSafeClicks--
            updateSafeClicksDisplay()
        }
    }
}

function findSafeCell() {

    const cells = document.querySelectorAll('.cell')
    if (cells.length === 0) return null
    const randomIndex = Math.floor(Math.random() * cells.length)
    return cells[randomIndex]
}

function updateSafeClicksDisplay() {
    document.getElementById('safe-clicks-display').textContent = gSafeClicks;
}

function toggleDarkMode() {

    var elBtn = document.querySelector('.toggle-btn')
    var body = document.querySelector('body');

    if (isDarkMode) {
        elBtn.innerText = 'Dark Mode'
        body.classList.remove('dark-mode')
        isDarkMode = false
    } else {
        elBtn.innerText = 'Normal Mode'
        body.classList.add('dark-mode')
        isDarkMode = true
    }
}

function onMegaHintClick() {
    if (hasUsedMegaHint) return
    isMegaHintMode = true
    document.querySelector('.mega-hint-btn').disabled = true
}

function handleMegaHint(i, j) {
    if (!megaHintFirstCell) {
        megaHintFirstCell = { i, j }
    } else {
        megaHintSecondCell = { i, j }
        revealMegaHintArea()
        setTimeout(hideMegaHintArea, 2000)
        isMegaHintMode = false
        hasUsedMegaHint = true
    }
}

function revealMegaHintArea() {
    var startRow = Math.min(megaHintFirstCell.i, megaHintSecondCell.i)
    var endRow = Math.max(megaHintFirstCell.i, megaHintSecondCell.i)
    var startCol = Math.min(megaHintFirstCell.j, megaHintSecondCell.j)
    var endCol = Math.max(megaHintFirstCell.j, megaHintSecondCell.j)

    for (var i = startRow; i <= endRow; i++) {
        for (var j = startCol; j <= endCol; j++) {
            var cell = gBoard[i][j]
            cell.isShown = true
            renderCell(i, j)
        }
    }
}

function hideMegaHintArea() {
    var startRow = Math.min(megaHintFirstCell.i, megaHintSecondCell.i)
    var endRow = Math.max(megaHintFirstCell.i, megaHintSecondCell.i)
    var startCol = Math.min(megaHintFirstCell.j, megaHintSecondCell.j)
    var endCol = Math.max(megaHintFirstCell.j, megaHintSecondCell.j)

    for (var i = startRow; i <= endRow; i++) {
        for (var j = startCol; j <= endCol; j++) {
            var cell = gBoard[i][j]
            cell.isShown = false
            renderCell(i, j)
        }
    }
    megaHintFirstCell = null
    megaHintSecondCell = null
}