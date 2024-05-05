'use strict'


const MINE = '💣'
const FLAG = '🚩'
const LIFE = '❤️'
const EMPTY = ''

const LEVEL = [4, 8, 12]
const MINES = [2, 14, 32]

var gBoard
var gLevel
var gGame
var gDiff = 0

gBoard = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: true
}

gLevel = {
    SIZE: 4,
    MINES: 2
}

gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    specsPassed: 0
}

function onInit() {

    gBoard = buildBoard()
    renderBoard(gBoard)
    placeMines(gBoard)
    setMinesNegsCount(gBoard)
    onCellMarked(gBoard)

}

function onSetLevel(level) {
    gLevel.SIZE = level
    onInit()
}


function placeMines(board) {

    const SIZE = gLevel.SIZE
    var minesPlaced = 0
    while (minesPlaced < 2) {

        const row = Math.floor(Math.random() * SIZE)
        const col = Math.floor(Math.random() * SIZE)
        if (!board[row][col].isMine) {
            board[row][col].isMine = true
            minesPlaced++
        }
    }

}


function buildBoard() {
    const SIZE = gLevel.SIZE
    const board = []

    for (var i = 0; i < SIZE; i++) {
        board.push([])
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = {
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
                board[i][j].minesNegsCount = count
            }
        }
    }
    console.log(board)
}


function renderBoard(board) {

    var strHtml = ''

    for (var i = 0; i < board.length; i++) {
        strHtml += '\n<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            strHtml += `\n\t<td onclick="onCellClicked(this, ${i}, ${j})">`

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
            // elCell.innerText = EMPTY
            var minesAroundCount = countMinesAroundCell(i, j)
            elCell.innerText = minesAroundCount
        }
        currCell.isShown = true
    }
}

function countMinesAroundCell(row, col) {

    var count = 1

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

    document.addEventListener("contextmenu", function (event) {
        event.preventDefault()
    })

    if (elCell.classList.contains(FLAG)) {
        elCell.classList.remove(FLAG)

    } else {
        elCell.classList.add(FLAG)
    }
    return false
}

function checkGameOver() {

}

function expandShown(board, elCell, i, j) {

}
