/**
 * AIPlayer - Искусственный интеллект для игры Гомоку
 */
class AIPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.player = 2; // ИИ играет белыми фишками
        this.opponent = 1; // Игрок играет черными
        
        // Настройки для разных уровней сложности
        this.settings = {
            easy: { depth: 2, randomness: 0.3 },
            medium: { depth: 3, randomness: 0.1 },
            hard: { depth: 4, randomness: 0.05 }
        };
        
        this.currentSettings = this.settings[difficulty];
    }

    /**
     * Установка уровня сложности
     * @param {string} difficulty - Уровень сложности
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.currentSettings = this.settings[difficulty];
    }

    /**
     * Получение лучшего хода для ИИ
     * @param {GameModel} gameModel - Модель игры
     * @returns {Object} Координаты хода {row, col}
     */
    getBestMove(gameModel) {
        const board = gameModel.getBoardCopy();
        const boardSize = gameModel.boardSize;
        
        // 1. Проверить возможность немедленной победы
        const winMove = this.findWinningMove(board, boardSize, this.player);
        if (winMove) {
            return this.addRandomness(winMove, [winMove]);
        }
        
        // 2. Заблокировать победу противника
        const blockMove = this.findWinningMove(board, boardSize, this.opponent);
        if (blockMove) {
            return this.addRandomness(blockMove, [blockMove]);
        }
        
        // 3. Найти лучший ход с помощью минимакса
        const bestMove = this.minimax(gameModel, this.currentSettings.depth, true, -Infinity, Infinity).move;
        
        if (bestMove) {
            const relevantMoves = gameModel.getRelevantEmptyCells(2);
            return this.addRandomness(bestMove, relevantMoves);
        }
        
        // 4. Fallback: случайный ход в центральной области
        return this.getRandomCenterMove(gameModel);
    }

    /**
     * Поиск выигрышного хода
     * @param {Array} board - Игровое поле
     * @param {number} boardSize - Размер поля
     * @param {number} player - Игрок
     * @returns {Object|null} Координаты хода или null
     */
    findWinningMove(board, boardSize, player) {
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (board[row][col] === 0) {
                    // Временно поставить фишку
                    board[row][col] = player;
                    
                    if (this.checkWin(board, boardSize, row, col, player)) {
                        board[row][col] = 0; // Убрать временную фишку
                        return { row, col };
                    }
                    
                    board[row][col] = 0; // Убрать временную фишку
                }
            }
        }
        return null;
    }

    /**
     * Проверка победы
     * @param {Array} board - Игровое поле
     * @param {number} boardSize - Размер поля
     * @param {number} row - Строка
     * @param {number} col - Столбец
     * @param {number} player - Игрок
     * @returns {boolean}
     */
    checkWin(board, boardSize, row, col, player) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dRow, dCol] of directions) {
            let count = 1;
            
            // Проверяем в положительном направлении
            let r = row + dRow;
            let c = col + dCol;
            while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
                count++;
                r += dRow;
                c += dCol;
            }
            
            // Проверяем в отрицательном направлении
            r = row - dRow;
            c = col - dCol;
            while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
                count++;
                r -= dRow;
                c -= dCol;
            }
            
            if (count >= 5) {
                return true;
            }
        }
        return false;
    }

    /**
     * Алгоритм минимакс с альфа-бета отсечением
     * @param {GameModel} gameModel - Модель игры
     * @param {number} depth - Глубина поиска
     * @param {boolean} maximizing - Максимизирующий игрок
     * @param {number} alpha - Альфа значение
     * @param {number} beta - Бета значение
     * @returns {Object} Оценка и лучший ход
     */
    minimax(gameModel, depth, maximizing, alpha, beta) {
        if (depth === 0 || gameModel.gameStatus !== 'playing') {
            return { score: this.evaluatePosition(gameModel), move: null };
        }

        const relevantMoves = gameModel.getRelevantEmptyCells(2);
        let bestMove = null;

        if (maximizing) {
            let maxScore = -Infinity;
            
            for (let {row, col} of relevantMoves) {
                // Сделать ход
                const originalPlayer = gameModel.currentPlayer;
                gameModel.currentPlayer = this.player;
                gameModel.makeMove(row, col);
                
                const result = this.minimax(gameModel, depth - 1, false, alpha, beta);
                
                // Отменить ход
                gameModel.undoMove();
                gameModel.currentPlayer = originalPlayer;
                
                if (result.score > maxScore) {
                    maxScore = result.score;
                    bestMove = { row, col };
                }
                
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) {
                    break; // Альфа-бета отсечение
                }
            }
            
            return { score: maxScore, move: bestMove };
        } else {
            let minScore = Infinity;
            
            for (let {row, col} of relevantMoves) {
                // Сделать ход
                const originalPlayer = gameModel.currentPlayer;
                gameModel.currentPlayer = this.opponent;
                gameModel.makeMove(row, col);
                
                const result = this.minimax(gameModel, depth - 1, true, alpha, beta);
                
                // Отменить ход
                gameModel.undoMove();
                gameModel.currentPlayer = originalPlayer;
                
                if (result.score < minScore) {
                    minScore = result.score;
                    bestMove = { row, col };
                }
                
                beta = Math.min(beta, result.score);
                if (beta <= alpha) {
                    break; // Альфа-бета отсечение
                }
            }
            
            return { score: minScore, move: bestMove };
        }
    }

    /**
     * Оценка позиции на доске
     * @param {GameModel} gameModel - Модель игры
     * @returns {number} Оценка позиции
     */
    evaluatePosition(gameModel) {
        if (gameModel.gameStatus === 'won') {
            return gameModel.winner === this.player ? 10000 : -10000;
        }
        
        if (gameModel.gameStatus === 'draw') {
            return 0;
        }
        
        let score = 0;
        const board = gameModel.board;
        const boardSize = gameModel.boardSize;
        
        // Оценить все возможные линии
        score += this.evaluateAllLines(board, boardSize, this.player);
        score -= this.evaluateAllLines(board, boardSize, this.opponent);
        
        return score;
    }

    /**
     * Оценка всех линий для игрока
     * @param {Array} board - Игровое поле
     * @param {number} boardSize - Размер поля
     * @param {number} player - Игрок
     * @returns {number} Оценка
     */
    evaluateAllLines(board, boardSize, player) {
        let totalScore = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                for (let [dRow, dCol] of directions) {
                    totalScore += this.evaluateLine(board, boardSize, row, col, dRow, dCol, player);
                }
            }
        }
        
        return totalScore;
    }

    /**
     * Оценка одной линии
     * @param {Array} board - Игровое поле
     * @param {number} boardSize - Размер поля
     * @param {number} row - Начальная строка
     * @param {number} col - Начальный столбец
     * @param {number} dRow - Направление по строкам
     * @param {number} dCol - Направление по столбцам
     * @param {number} player - Игрок
     * @returns {number} Оценка линии
     */
    evaluateLine(board, boardSize, row, col, dRow, dCol, player) {
        let count = 0;
        let blocks = 0;
        let empty = 0;
        
        // Проверить 5 клеток в указанном направлении
        for (let i = 0; i < 5; i++) {
            const r = row + i * dRow;
            const c = col + i * dCol;
            
            if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) {
                blocks++;
            } else if (board[r][c] === player) {
                count++;
            } else if (board[r][c] === 0) {
                empty++;
            } else {
                blocks++;
            }
        }
        
        // Не учитывать заблокированные линии
        if (blocks >= 2) {
            return 0;
        }
        
        // Оценки для разных ситуаций
        switch (count) {
            case 5: return 10000;
            case 4: return blocks === 0 ? 5000 : 1000;
            case 3: return blocks === 0 ? 500 : 100;
            case 2: return blocks === 0 ? 50 : 10;
            case 1: return blocks === 0 ? 5 : 1;
            default: return 0;
        }
    }

    /**
     * Добавление случайности к ходу
     * @param {Object} bestMove - Лучший ход
     * @param {Array} alternativeMoves - Альтернативные ходы
     * @returns {Object} Ход с учетом случайности
     */
    addRandomness(bestMove, alternativeMoves) {
        if (Math.random() < this.currentSettings.randomness && alternativeMoves.length > 1) {
            const randomIndex = Math.floor(Math.random() * Math.min(3, alternativeMoves.length));
            return alternativeMoves[randomIndex];
        }
        return bestMove;
    }

    /**
     * Получение случайного хода в центральной области
     * @param {GameModel} gameModel - Модель игры
     * @returns {Object} Случайный ход
     */
    getRandomCenterMove(gameModel) {
        const center = Math.floor(gameModel.boardSize / 2);
        const radius = 3;
        const moves = [];
        
        for (let row = Math.max(0, center - radius); row <= Math.min(gameModel.boardSize - 1, center + radius); row++) {
            for (let col = Math.max(0, center - radius); col <= Math.min(gameModel.boardSize - 1, center + radius); col++) {
                if (gameModel.getCell(row, col) === 0) {
                    moves.push({ row, col });
                }
            }
        }
        
        if (moves.length === 0) {
            // Если центр занят, взять любую пустую клетку
            const emptyCells = gameModel.getEmptyCells();
            if (emptyCells.length > 0) {
                return emptyCells[Math.floor(Math.random() * emptyCells.length)];
            }
        }
        
        return moves[Math.floor(Math.random() * moves.length)];
    }

    /**
     * Получение подсказки для игрока
     * @param {GameModel} gameModel - Модель игры
     * @returns {Object|null} Подсказка хода
     */
    getHint(gameModel) {
        // Временно поменять игроков для получения хода для человека
        const originalPlayer = this.player;
        const originalOpponent = this.opponent;
        
        this.player = gameModel.currentPlayer;
        this.opponent = gameModel.currentPlayer === 1 ? 2 : 1;
        
        const hint = this.getBestMove(gameModel);
        
        // Восстановить исходные настройки
        this.player = originalPlayer;
        this.opponent = originalOpponent;
        
        return hint;
    }

    /**
     * Анализ текущей позиции
     * @param {GameModel} gameModel - Модель игры
     * @returns {Object} Анализ позиции
     */
    analyzePosition(gameModel) {
        const score = this.evaluatePosition(gameModel);
        const threat = this.findWinningMove(gameModel.board, gameModel.boardSize, gameModel.currentPlayer);
        const counterThreat = this.findWinningMove(gameModel.board, gameModel.boardSize, gameModel.currentPlayer === 1 ? 2 : 1);
        
        return {
            score,
            evaluation: score > 100 ? 'advantage' : score < -100 ? 'disadvantage' : 'equal',
            immediateWin: threat !== null,
            needsDefense: counterThreat !== null,
            recommendation: threat || counterThreat || this.getBestMove(gameModel)
        };
    }

    /**
     * Получение объяснения хода
     * @param {Object} move - Ход
     * @param {GameModel} gameModel - Модель игры
     * @returns {string} Объяснение
     */
    explainMove(move, gameModel) {
        if (!move) return 'Нет доступных ходов';
        
        const board = gameModel.getBoardCopy();
        const { row, col } = move;
        
        // Проверить, является ли ход выигрышным
        board[row][col] = this.player;
        if (this.checkWin(board, gameModel.boardSize, row, col, this.player)) {
            return 'Выигрышный ход!';
        }
        
        // Проверить, блокирует ли ход победу противника
        board[row][col] = this.opponent;
        if (this.checkWin(board, gameModel.boardSize, row, col, this.opponent)) {
            return 'Блокировка угрозы противника';
        }
        
        // Проверить силу позиции
        board[row][col] = this.player;
        const score = this.evaluateLine(board, gameModel.boardSize, row, col, 0, 1, this.player) +
                     this.evaluateLine(board, gameModel.boardSize, row, col, 1, 0, this.player) +
                     this.evaluateLine(board, gameModel.boardSize, row, col, 1, 1, this.player) +
                     this.evaluateLine(board, gameModel.boardSize, row, col, 1, -1, this.player);
        
        if (score > 1000) return 'Создание сильной угрозы';
        if (score > 100) return 'Развитие атаки';
        if (score > 10) return 'Улучшение позиции';
        
        return 'Стратегический ход';
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPlayer;
} else if (typeof window !== 'undefined') {
    window.AIPlayer = AIPlayer;
}
