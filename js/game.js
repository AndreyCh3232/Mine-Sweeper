'use strict'

const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️'
const EMPTY = ''

var gBoard = []
var gLevel
var gGame
var lives
var gIntervalId
var gameOver = false

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

    lives = 3
    hints = 3
    gSafeClicks = 3
    gameOver = false
    hintMode = false
    hintCells = []
    gameStateHistory = []
    gBoard = buildBoard()
    renderBoard(gBoard)
    placeMines(gBoard)
    setMinesNegsCount(gBoard)
    document.querySelector('.minutes').innerHTML = `00`
    document.querySelector('.seconds').innerHTML = `00`
    document.querySelector('.emoji-btn').innerHTML = '🙂'
    clearInterval(gIntervalId)
    endTimer()
    updateSafeClicksDisplay()

}

function restartGame() {
    onInit()
}

function onSetLevel(level) {
    gLevel.SIZE = gLevel[level].SIZE
    gLevel.MINES = gLevel[level].MINES
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
    createHint()

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

    var strHtml = ''

    for (var i = 0; i < board.length; i++) {
        strHtml += '\n<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const lCell = board[i][j]
            var numOfMinesAroundCell = lCell.minesAroundCount
            const className = `cell cell=${i}-${j}`
            var isShownCell = ''
            var cellView = ''
            var bgColor = ''

            if (lCell.isShown && !lCell.isMarked) {
                if (lCell.isMine) {
                    cellView = MINE
                    bgColor = 'red'
                    isShownCell = lCell.isShown ? "is-shown-cell" : ''
                } else {
                    cellView = numOfMinesAroundCell === 0 ? '' : numOfMinesAroundCell
                    isShownCell = lCell.isShown ? "is-shown-cell" : ''
                }
            } else if (lCell.isMarked) {
                cellView = FLAG
            }

            strHtml += `\n\t<td class="${className} ${isShownCell}"
             style="background-color: ${bgColor}"
             onclick="onCellClicked(this, ${i}, ${j})" 
             oncontextmenu="onCellMarked(event, this, ${i},${j})">
             ${cellView}</td>`
        }
        strHtml += '</tr>'
    }
    const elBorad = document.querySelector('.board')
    elBorad.innerHTML = strHtml
}

function renderCell(i, j) {
    const cell = gBoard[i][j]
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    var cellView = ''
    if (cell.isMine) {
        cellView = MINE
    } else if (cell.isMarked) {
        cellView = FLAG
    } else {
        cellView = cell.minesAroundCount === 0 ? '' : cell.minesAroundCount
    }
    elCell.innerHTML = cellView
    elCell.style.backgroundColor = cell.isShown ? 'gray' : ''
}

function onCellClicked(elCell, i, j) {

    if (gameOver || !gGame.isOn) return

    if (isMegaHintMode) {
        handleMegaHint(i, j)
        return
    }

    var currCell = gBoard[i][j]

    if (!currCell.isShown && !currCell.isMarked) {
        if (gGame.shownCount === 0) {
            startTime()
        }

        if (currCell.isMine) {
            elCell.innerText = MINE
            lives--
            createLives()
            checkGameOver(false)
        } else {
            elCell.style.backgroundColor = 'gray'
            var minesAroundCount = countMinesAroundCell(i, j)
            elCell.innerText = minesAroundCount || ''
            if (minesAroundCount === 0) {
                expandShown(gBoard, i, j)
            }
        }

        setMinesNegsCount(gBoard)
        createHint()

        currCell.isShown = true
        gGame.shownCount++

        if (hintMode) {
            hintClicked(i, j)
            return
        }

        if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES) {
            endTimer()
            checkGameOver(true)
        }
        updateGameState()
        renderBoard(gBoard)
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

    if (gameOver || gBoard[i][j].isShown) return

    var currCell = gBoard[i][j]

    if (currCell.isMarked) {
        elCell.textContent = '';
        currCell.isMarked = false;
        gGame.markedCount--;
    } else {
        elCell.textContent = FLAG;
        currCell.isMarked = true;
        gGame.markedCount++;
    }
    checkGameOver()
}

function checkGameOver(isWin) {

    if (lives === 0 || isWin) {
        gameOver = true
        clearInterval(gIntervalId)
        document.querySelector('.emoji-btn').innerHTML = isWin ? '😎' : '🤯'
        alert(isWin ? 'You Win!!!' : 'You Lose!!!')
        gGame.isOn = false

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                if (gBoard[i][j].isMine) {
                    gBoard[i][j].isShown = true
                }
            }
        }
        renderBoard(gBoard)
    }
}

function expandShown(board, row, col) {

    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || (i === row && j === col)) {
                continue
            }
            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMarked) {
                currCell.isShown = true
                gGame.shownCount++
                if (currCell.minesAround === 0) {
                    expandShown(board, i, j)
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
