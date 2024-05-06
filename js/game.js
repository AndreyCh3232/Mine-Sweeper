'use strict'


const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️'
const EMPTY = ''

var gBoard
var gLevel
var gGame
var mines = []
var lives = 3
var gIntervalId

gBoard = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: true
}

gLevel = {

    SIZE: 4,
    MINES: 2,
    4: { SIZE: 4, MINES: 2 },
    8: { SIZE: 8, MINES: 14 },
    12: { SIZE: 12, MINES: 32 }
}

function onInit() {

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        specsPassed: 0
    }
    gBoard = buildBoard()
    renderBoard(gBoard)
    placeMines(gBoard)
    setMinesNegsCount(gBoard)
    document.querySelector('.minutes').innerHTML = `00`
    document.querySelector('.seconds').innerHTML = `00`
    endTimer()

}

function restartGame() {

    onInit()
}

function onSetLevel(level) {
    gLevel.SIZE = level
    onInit()
}


function placeMines(board) {

    const SIZE = gLevel[board.length].SIZE
    const MINES = gLevel[board.length].MINES
    var minesPlaced = 0
    while (minesPlaced < MINES) {
        const row = Math.floor(Math.random() * SIZE)
        const col = Math.floor(Math.random() * SIZE)
        if (!board[row][col].isMine) {
            board[row][col].isMine = true
            minesPlaced++
        }
    }
}


function buildBoard() {

    createLives()

    const SIZE = gLevel.SIZE
    const board = []

    for (var i = 0; i < SIZE; i++) {
        board.push([])
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    return board
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var count = 1
            if (!board[i][j].isMine) {
                for (var x = Math.max(0, i - 1); x <= Math.min(board.length - 1, i + 1); x++) {
                    for (var y = Math.max(0, j - 1); y <= Math.min(board[0].length - 1, j + 1); y++) {
                        if (board[x][y].isMine) {
                            count++;
                        }
                    }
                }
                board[i][j].minesNegsCount = count
            }
        }
    }
}

function renderBoard(board) {

    checkGameOver()

    var strHtml = ''

    for (var i = 0; i < board.length; i++) {
        strHtml += '\n<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            strHtml += `\n\t<td onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this)">`
            if (cell.isShown) {
                if (cell.isMine) {
                    strHtml += MINE
                } else {
                    strHtml += cell.minesNegsCount
                }
            } else {
                strHtml += ''
            }
            strHtml += '</td>'
        }
        strHtml += '</tr>'
    }
    const elBorad = document.querySelector('.board')
    elBorad.innerHTML = strHtml

}

function onCellClicked(elCell, i, j) {

    var currCell = gBoard[i][j]

    if (!currCell.isShown) {
        if (currCell.isMine) {
            elCell.innerText = MINE
        } else {
            var minesAroundCount = countMinesAroundCell(i, j)
            elCell.innerText = minesAroundCount
        }
        currCell.isShown = true
        gGame.shownCount++

        if (currCell.isMine) {
            elCell.style.background = 'red'
            checkGameOver()

        } else {
            if (currCell === gLevel.MINES) {
                lives--
                createLives()
            } else {
                for (var x = 0; x < mines.length; x++) {
                    mines[x].isShown = true
                }
                checkGameOver(true)
            }
            renderBoard(gBoard)
        }
        if (currCell.isShown) {
            starTime()
        } else {
            endTimer()
        }
    }
}


function countMinesAroundCell(row, col) {

    var count = 0

    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < gBoard.length && j >= 0 && j < gBoard[0].length) {
                if (gBoard[i][j].isMine) {
                    count++
                }
            }
        }
    }
    return count
}

function onCellMarked(elCell) {

    event.preventDefault()
    if (elCell.classList.contains('revealed')) {
        return
    }
    elCell.classList.toggle('marked')
    if (elCell.classList.contains('marked')) {
        elCell.textContent = FLAG
    } else {
        elCell.textContent = ''

        checkGameOver()
    }

}

function checkGameOver() {

    if (lives === 0) {
        gGame.isOn = false
        alert('You Lose!!!')
    } else if (lives > 0 && gGame.ShownCount === (gLevel.SIZE * gLevel.SIZE)) {
        gGame.isOn = false
        alert('You Win!!!')
    }
}

function expandShown(board, elCell, row, col) {

    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || (i === row && j === col)) {
                continue
            }
            if (!board[i][j].isShown && !board[i][j].isMarked) {
                board[i][j].isShown = true
                gGame.shownCount++
                if (board[i][j].minesAroundCount === 0) {
                    expandShown(board, elCell, i, j)
                }
            }
        }
    }
}

function createLives() {
    var elLive = ''
    for (var i = 0; i < lives; i++) {
        elLive += LIFE
    }
    var elContainer = document.querySelector('.lives-container')
    elContainer.innerHTML = elLive
}

function starTime() {

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

