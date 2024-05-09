'use strict'


const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️'
const EMPTY = ''
const HINT = '💡'

var gBoard
var gLevel
var gGame
var lives
var gIntervalId
var hints
var hintCells = []
var hintMode = false

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

gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    specsPassed: 0
}

function onInit() {

    lives = 3
    hints = 3
    gBoard = buildBoard()
    renderBoard(gBoard)
    placeMines(gBoard)
    setMinesNegsCount(gBoard)
    document.querySelector('.minutes').innerHTML = `00`
    document.querySelector('.seconds').innerHTML = `00`
    document.querySelector('.emoji-btn').innerHTML = '🙂'
    endTimer()


}

function restartGame() {

    onInit()
    endTimer()
    starTime()

}

function onSetLevel(level) {
    gLevel.SIZE = level
    onInit()
    endTimer()
    starTime()
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

            if (lCell.isShown && !lCell.isMarked) {
                if (lCell.isMine) {
                    cellView = MINE
                } else {
                    cellView = numOfMinesAroundCell === 0 ? '' : numOfMinesAroundCell
                    isShownCell = lCell.isShown ? "is-shown-cell" : ''
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

    if (!currCell.isShown) {
        elCell.style.backgroundColor = 'gray'
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
        setMinesNegsCount(gBoard)
        createHint()
        var hitElement = document.querySelector('.hint')
        if (!hitElement) hitElement.remove()

        if (hintMode) {
            hintClicked(i, j)
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
        endTimer()
        document.querySelector('.emoji-btn').innerHTML = '🤯'
        alert('You Lose!!!')
    } else if (lives > 0 && gGame.ShownCount === (gLevel.SIZE * gLevel.SIZE - gLevel.MINES)) {
        gGame.isOn = false
        endTimer()
        document.querySelector('.emoji-btn').innerHTML = '😎'
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

function createHint() {

    var elHint = ''
    for (var i = 0; i < hints; i++) {

        elHint += `<div class="hint" onclick="activeHintMode(this)">${HINT}</div>`
    }
    var elHintsContainer = document.querySelector('.hints-container')
    elHintsContainer.innerHTML = elHint
}

function activeHintMode(lHint) {
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
}

