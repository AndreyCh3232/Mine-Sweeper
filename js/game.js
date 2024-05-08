'use strict'


const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️'
const EMPTY = ''

var gBoard
var gLevel
var gGame
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
    4: { SIZE: 4, MINES: 3 },
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
    createLives()
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
            var count = 0
            if (!board[i][j].isMine) {
                for (var x = Math.max(0, i - 1); x <= Math.min(board.length - 1, i + 1); x++) {
                    for (var y = Math.max(0, j - 1); y <= Math.min(board[0].length - 1, j + 1); y++) {
                        if (board[x][y].isMine) {
                            count++;
                        }
                    }
                }
                board[i][j].minesAroundCount = count
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
            var numOfMinesAroundCell = cell.minesAroundCount
            const className = `lCell lCell=${i}-${j}`
            var isShownCell = ''
            var cellView = ''

            if (cell.isShown && !cell.isMarked) {
                if (cell.isMine) {
                    cellView = MINE
                } else {
                    cellView = numOfMinesAroundCell === 0 ? '' : numOfMinesAroundCell
                    isShownCell = cell.isShown ? "is-shown-lCell" : ''
                }
            }
            strHtml += `\n\t<td class="${className} ${isShownCell}"
             onclick="onCellClicked(this, ${i}, ${j})" 
             oncontextmenu="onCellMarked(event, this, ${i},${j})">
             ${cellView}</td>`
        }
        strHtml += '</tr>'
    }
    const elBorad = document.querySelector('.board')
    elBorad.innerHTML = strHtml
}

function onCellClicked(elCell, i, j) {

    var currCell = gBoard[i][j]
    elCell.style.backgroundColor = 'gray'
    if (!currCell.isShown) {
        if (currCell.isMine) {
            elCell.innerText = MINE
            elCell.style.backgroundColor = 'red'
            lives--
            createLives()
            checkGameOver()
        } else {
            var minesAroundCount = countMinesAroundCell(i, j)
            elCell.innerText = minesAroundCount
            if (minesAroundCount === 0) {
                expandShown(gBoard, elCell, i, j)

            }
        }

        currCell.isShown = true
        gGame.shownCount++

        if (gGame.shownCount === 1) {
            starTime()
        } else if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
            endTimer()
            renderBoard(gBoard)
        }
    }
}

function countMinesAroundCell(row, col) {

    var count = 0

    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i >= 0 && i < gBoard.length && j >= 0 && j < gBoard[0].length && !(i === row && j === col)) {
                if (gBoard[i][j].isMine) {
                    count++
                }
            }
        }
    }
    return count
}

function onCellMarked(event, elCell, i, j) {

    event.preventDefault()
    if (elCell.classList.contains('revealed')) {
        return
    }
    elCell.classList.toggle('marked')
    if (elCell.classList.contains('marked')) {
        elCell.textContent = FLAG
        gGame.markedCount++
    } else {
        elCell.textContent = ''
        gGame.markedCount--
        checkGameOver()
    }

}

function checkGameOver() {

    if (lives === 0) {
        gGame.isOn = false
        alert('You Lose!!!')
        endTimer()
    } else if (lives > 0 && gGame.ShownCount === (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)) {
        gGame.isOn = false
        alert('You Win!!!')
        endTimer()
    }
}

function expandShown(board, elCell, row, col) {



    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || (i === row && j === col)) {
                continue
            }
            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMarked) {
                currCell.isShown = true
                gGame.shownCount++
            }
        }
    }
    renderBoard(gBoard)
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

