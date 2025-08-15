/**
 * GameModel - Модель данных и основная логика игры Гомоку
 */
class GameModel {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 1; // 1 - черные (первый игрок), 2 - белые (второй игрок)
        this.gameStatus = 'playing'; // 'playing', 'won', 'draw'
        this.winner = null;
        this.winLine = [];
        this.moveHistory = [];
        this.moveCount = 0;
        this.startTime = null;
        
        this.initializeBoard();
    }

    /**
     * Инициализация игрового поля
     */
    initializeBoard() {
        this.board = [];
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = 0; // 0 - пустая клетка
            }
        }
    }

    /**
     * Установка размера игрового поля
     * @param {number} size - Размер поля (15 или 19)
     */
    setBoardSize(size) {
        if (size === 15 || size === 19) {
            this.boardSize = size;
            this.initializeBoard();
        }
    }

    /**
     * Получение состояния клетки
     * @param {number} row - Строка
     * @param {number} col - Столбец
     * @returns {number} 0-пусто, 1-черный, 2-белый
     */
    getCell(row, col) {
        if (this.isValidPosition(row, col)) {
            return this.board[row][col];
        }
        return -1; // Недопустимая позиция
    }

    /**
     * Проверка валидности позиции
     * @param {number} row - Строка
     * @param {number} col - Столбец
     * @returns {boolean}
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    /**
     * Проверка возможности хода
     * @param {number} row - Строка
     * @param {number} col - Столбец
     * @returns {boolean}
     */
    isValidMove(row, col) {
        return this.isValidPosition(row, col) && 
               this.board[row][col] === 0 && 
               this.gameStatus === 'playing';
    }

    /**
     * Выполнение хода
     * @param {number} row - Строка
     * @param {number} col - Столбец
     * @returns {boolean} Успешность хода
     */
    makeMove(row, col) {
        if (!this.isValidMove(row, col)) {
            return false;
        }

        // Сохранить ход в историю
        this.moveHistory.push({
            row,
            col,
            player: this.currentPlayer,
            timestamp: Date.now()
        });

        // Разместить фишку
        this.board[row][col] = this.currentPlayer;
        this.moveCount++;

        // Запустить таймер при первом ходе
        if (this.moveCount === 1) {
            this.startTime = Date.now();
        }

        // Проверить победу
        if (this.checkWin(row, col)) {
            this.gameStatus = 'won';
            this.winner = this.currentPlayer;
            return true;
        }

        // Проверить ничью (поле заполнено)
        if (this.moveCount === this.boardSize * this.boardSize) {
            this.gameStatus = 'draw';
            return true;
        }

        // Переключить игрока
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        return true;
    }

    /**
     * Проверка победы
     * @param {number} row - Строка последнего хода
     * @param {number} col - Столбец последнего хода
     * @returns {boolean}
     */
    checkWin(row, col) {
        const directions = [
            [0, 1],   // горизонталь
            [1, 0],   // вертикаль
            [1, 1],   // диагональ \
            [1, -1]   // диагональ /
        ];

        const player = this.board[row][col];

        for (let [dRow, dCol] of directions) {
            let count = 1; // Считаем текущую фишку
            const line = [{row, col}];

            // Проверяем в положительном направлении
            let r = row + dRow;
            let c = col + dCol;
            while (this.isValidPosition(r, c) && this.board[r][c] === player) {
                line.push({row: r, col: c});
                count++;
                r += dRow;
                c += dCol;
            }

            // Проверяем в отрицательном направлении
            r = row - dRow;
            c = col - dCol;
            while (this.isValidPosition(r, c) && this.board[r][c] === player) {
                line.unshift({row: r, col: c});
                count++;
                r -= dRow;
                c -= dCol;
            }

            // Если найдено 5 или более фишек подряд
            if (count >= 5) {
                this.winLine = line.slice(0, 5); // Берем только первые 5
                return true;
            }
        }

        return false;
    }

    /**
     * Отмена последнего хода
     * @returns {boolean} Успешность отмены
     */
    undoMove() {
        if (this.moveHistory.length === 0) {
            return false;
        }

        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = 0;
        this.moveCount--;
        
        // Восстановить предыдущего игрока
        this.currentPlayer = lastMove.player;
        
        // Сбросить статус игры
        if (this.gameStatus !== 'playing') {
            this.gameStatus = 'playing';
            this.winner = null;
            this.winLine = [];
        }

        return true;
    }

    /**
     * Сброс игры
     */
    reset() {
        this.initializeBoard();
        this.currentPlayer = 1;
        this.gameStatus = 'playing';
        this.winner = null;
        this.winLine = [];
        this.moveHistory = [];
        this.moveCount = 0;
        this.startTime = null;
    }

    /**
     * Получение времени игры в секундах
     * @returns {number}
     */
    getGameTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    /**
     * Форматирование времени игры
     * @returns {string} Время в формате MM:SS
     */
    getFormattedGameTime() {
        const seconds = this.getGameTime();
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Получение копии игрового поля
     * @returns {Array} Двумерный массив
     */
    getBoardCopy() {
        return this.board.map(row => [...row]);
    }

    /**
     * Получение всех пустых клеток
     * @returns {Array} Массив объектов {row, col}
     */
    getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({row, col});
                }
            }
        }
        return emptyCells;
    }

    /**
     * Получение клеток в области вокруг занятых клеток
     * Используется для оптимизации ИИ
     * @param {number} radius - Радиус области (по умолчанию 2)
     * @returns {Array} Массив уникальных пустых клеток
     */
    getRelevantEmptyCells(radius = 2) {
        const relevantCells = new Set();
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== 0) {
                    // Добавить клетки в радиусе вокруг занятой клетки
                    for (let r = Math.max(0, row - radius); r <= Math.min(this.boardSize - 1, row + radius); r++) {
                        for (let c = Math.max(0, col - radius); c <= Math.min(this.boardSize - 1, col + radius); c++) {
                            if (this.board[r][c] === 0) {
                                relevantCells.add(`${r},${c}`);
                            }
                        }
                    }
                }
            }
        }

        // Если нет занятых клеток, возвращаем центральные клетки
        if (relevantCells.size === 0) {
            const center = Math.floor(this.boardSize / 2);
            for (let r = center - 1; r <= center + 1; r++) {
                for (let c = center - 1; c <= center + 1; c++) {
                    if (this.isValidPosition(r, c) && this.board[r][c] === 0) {
                        relevantCells.add(`${r},${c}`);
                    }
                }
            }
        }

        return Array.from(relevantCells).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return {row, col};
        });
    }

    /**
     * Проверка наличия линии определенной длины для игрока
     * @param {number} player - Номер игрока (1 или 2)
     * @param {number} length - Длина линии
     * @returns {Array} Массив найденных линий
     */
    findLines(player, length) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        const lines = [];

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === player) {
                    for (let [dRow, dCol] of directions) {
                        const line = [{row, col}];
                        let r = row + dRow;
                        let c = col + dCol;
                        
                        while (this.isValidPosition(r, c) && this.board[r][c] === player) {
                            line.push({row: r, col: c});
                            r += dRow;
                            c += dCol;
                        }

                        if (line.length >= length) {
                            lines.push(line);
                        }
                    }
                }
            }
        }

        return lines;
    }

    /**
     * Получение состояния игры для сохранения
     * @returns {Object}
     */
    getGameState() {
        return {
            boardSize: this.boardSize,
            board: this.getBoardCopy(),
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            winner: this.winner,
            winLine: [...this.winLine],
            moveHistory: [...this.moveHistory],
            moveCount: this.moveCount,
            startTime: this.startTime
        };
    }

    /**
     * Загрузка состояния игры
     * @param {Object} state - Состояние игры
     */
    loadGameState(state) {
        this.boardSize = state.boardSize;
        this.board = state.board.map(row => [...row]);
        this.currentPlayer = state.currentPlayer;
        this.gameStatus = state.gameStatus;
        this.winner = state.winner;
        this.winLine = [...state.winLine];
        this.moveHistory = [...state.moveHistory];
        this.moveCount = state.moveCount;
        this.startTime = state.startTime;
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameModel;
} else if (typeof window !== 'undefined') {
    window.GameModel = GameModel;
}
