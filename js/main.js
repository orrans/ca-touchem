'strict mode'

var gArr = []
var gCurrNum = 0
var gBoardSize
var gBestTimes = {
    easy: { 9: 0, 16: 0, 25: 0, 36: 0 },
    hard: { 9: 0, 16: 0, 25: 0, 36: 0 },
}
var gDifficulty

function init() {
    changeBoardSize(9)
    changeDifficulty(0)
    resetStopwatch()
}

function changeDifficulty(difficulty, el) {
    var elDifficulty = document.querySelectorAll('.difficulty button')

    if (difficulty !== gDifficulty) {
        gDifficulty = difficulty
        elDifficulty.forEach((element) => element.classList.remove('clicked'))
        if (!el) el = elDifficulty[0]
        el.classList.add('clicked')
    }

    restart()
}

function restart() {
    changeBoardSize(gBoardSize)
}

function resetGame() { // to init
    stopStopwatch()
    resetStopwatch()

    gCurrNum = 1

    const elNextNum = document.querySelector('.next-num')
    elNextNum.innerText = 1

    const elRestartBtn = document.querySelector('.restart')
    elRestartBtn.classList.add('hidden')
}

function changeBoardSize(boardSize, el) {
    const elBoardSizes = document.querySelectorAll('.board-size button')
    gBoardSize = +boardSize
    resetGame()
// insert to init
    gArr = []
    for (let i = 1; i <= gBoardSize; i++) gArr.push(i)
    shuffleArray(gArr)

    createBoard()
    loadBestTime()

    if (!el) {
        elBoardSizes.forEach(function (btn) {
            if (+btn.textContent === gBoardSize) {
                el = btn
            }
        })
    }
    elBoardSizes.forEach((element) => element.classList.remove('clicked'))
    if (el) el.classList.add('clicked')
}

function loadBestTime() {
    const difficultyKey = gDifficulty === 0 ? 'easy' : 'hard'
    const ms = gBestTimes[difficultyKey][gBoardSize]
    updateStopwatchDisplay(ms, true)
}

function createBoard() {//render board
    var table = document.querySelector('.numbers')
    var sqrt = Math.sqrt(gArr.length)
    var strTable = ''
    for (let i = 0; i < sqrt; i++) {
        strTable += '<tr>'
        for (let j = 0; j < sqrt; j++) {
            const idx = i * sqrt + j
            strTable += `<td onclick="isClicked(this)" data-idx="${idx}">${gArr[idx]}</td>`
        }
        strTable += '</tr>'
    }
    table.innerHTML = strTable
}

function isClicked(elNum) { //onclickXXXX
    const idx = +elNum.dataset.idx
    const elRestartBtn = document.querySelector('.restart')
    if (gArr[idx] === 1 && !elNum.classList.contains('clicked')) {
        resetStopwatch()
        startStopwatch()
        elRestartBtn.innerText = 'Restart'
        elRestartBtn.classList.remove('hidden')
    }
    checkRightNum(idx, elNum)
}

function checkRightNum(idx, elNum) {
    const clickedNum = gArr[idx]
    const elNextNum = document.querySelector('.next-num')

    if (clickedNum === gCurrNum) {
        gCurrNum++
        elNextNum.innerText = gCurrNum
        elNum.classList.add('clicked')
        if (gDifficulty === 1) {
            shuffleBoard()
        }
        if (gCurrNum > gArr.length) {
            onGameOver()
            elNextNum.innerText = '🏆'
        }
    } else {
        elNum.classList.add('wrong')
        setTimeout(() => {
            elNum.classList.remove('wrong')
        }, 300)
    }
}

function onGameOver() {
    stopStopwatch()
    setHighScore()

    const elNextNum = document.querySelector('.next-num')
    elNextNum.innerText = '🏆'

    const elRestartBtn = document.querySelector('.restart')
    elRestartBtn.innerText = 'Play Again'
    elRestartBtn.classList.remove('hidden')
}

function shuffleBoard() {
    var elTable = document.querySelector('.numbers')
    var elTableCells = Array.from(document.querySelectorAll('td'))

    shuffleArray(elTableCells)

    var strTable = ''
    var sqrt = Math.sqrt(elTableCells.length)

    for (let i = 0; i < sqrt; i++) {
        strTable += '<tr>'
        for (let j = 0; j < sqrt; j++) {
            const idx = i * sqrt + j
            strTable += elTableCells[idx].outerHTML
        }
        strTable += '</tr>'
    }
// add clicked class on all the number under the curr number
    elTable.innerHTML = strTable
}

function shuffleArray(arr) {
    var temp
    for (let i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
        // {
        //     ;[arr[i], arr[j]] = [arr[j], arr[i]]
        // }
    }
}

// #region Stopwatch Functions

// Current live timer elements
const elStopwatchMin = document.querySelector('.timer .minute')
const elStopwatchSec = document.querySelector('.timer .seconds')
const elStopwatchMs = document.querySelector('.timer .milliseconds')

// Best-time (high score) timer elements
const elHighScoreMin = document.querySelector('.highscore .minute')
const elHighScoreSec = document.querySelector('.highscore .seconds')
const elHighScoreMs = document.querySelector('.highscore .milliseconds')

// Stopwatch state variables
let stopwatchStartTime = 0
let stopwatchAcc = 0
let stopwatchRafId = null
let isStopwatchRunning = false
let stopwatchHighScore = Infinity

// Update either the live timer or the high-score timer
function updateStopwatchDisplay(ms, isHighScore = false) {
    const totalMs = Math.floor(ms)
    const totalSeconds = Math.floor(totalMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const centiseconds = Math.floor((totalMs % 1000) / 10)

    const mm = String(minutes).padStart(2, '0')
    const ss = String(seconds).padStart(2, '0')
    const cs = String(centiseconds).padStart(2, '0')

    if (isHighScore) {
        formatHighScoreTime(hours, mm, ss, cs)
    } else {
        formatStopwatchTime(hours, mm, ss, cs)
    }
}

// Format current stopwatch display
function formatStopwatchTime(hours, mm, ss, cs) {
    if (hours > 0) {
        const hh = String(hours).padStart(2, '0')
        elStopwatchMin.textContent = `${hh}:${mm}`
    } else {
        elStopwatchMin.textContent = mm
    }
    elStopwatchSec.textContent = ss
    elStopwatchMs.textContent = cs
}

// Format high score display
function formatHighScoreTime(hours, mm, ss, cs) {
    if (hours > 0) {
        const hh = String(hours).padStart(2, '0')
        elHighScoreMin.textContent = `${hh}:${mm}`
    } else {
        elHighScoreMin.textContent = mm
    }
    elHighScoreSec.textContent = ss
    elHighScoreMs.textContent = cs
}

// Stopwatch animation loop
function stopwatchLoop() {
    if (!isStopwatchRunning) return
    const now = performance.now()
    const elapsed = stopwatchAcc + (now - stopwatchStartTime)
    updateStopwatchDisplay(elapsed)
    stopwatchRafId = requestAnimationFrame(stopwatchLoop)
}

// Start stopwatch
function startStopwatch() {
    if (isStopwatchRunning) return
    isStopwatchRunning = true
    stopwatchStartTime = performance.now()
    stopwatchRafId = requestAnimationFrame(stopwatchLoop)
}

// Stop stopwatch
function stopStopwatch() {
    if (!isStopwatchRunning) return
    stopwatchAcc += performance.now() - stopwatchStartTime
    isStopwatchRunning = false
    if (stopwatchRafId) cancelAnimationFrame(stopwatchRafId)
    stopwatchRafId = null
    updateStopwatchDisplay(stopwatchAcc)
}

// Reset stopwatch display
function resetStopwatch() {
    isStopwatchRunning = false
    stopwatchAcc = 0
    if (stopwatchRafId) cancelAnimationFrame(stopwatchRafId)
    stopwatchRafId = null
    elStopwatchMin.textContent = '00'
    elStopwatchSec.textContent = '00'
    elStopwatchMs.textContent = '00'
}

// Check and save high score
function setHighScore() {
    const difficultyKey = gDifficulty === 0 ? 'easy' : 'hard'
    const currentBest = gBestTimes[difficultyKey][gBoardSize]

    if (currentBest === 0 || stopwatchAcc < currentBest) {
        gBestTimes[difficultyKey][gBoardSize] = stopwatchAcc
        updateStopwatchDisplay(stopwatchAcc, true)
    }
}

// #endregion
