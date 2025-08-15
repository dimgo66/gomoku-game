/**
 * GameController - Главный контроллер игры Гомоку
 */
class GameController {
    constructor() {
        this.gameModel = new GameModel();
        this.gameView = new GameView();
        this.aiPlayer = new AIPlayer();
        this.configManager = new ConfigManager();
        
        this.isGameRunning = false;
        this.isAIThinking = false;
        
        this.initialize();
    }

    /**
     * Инициализация игры
     */
    initialize() {
        this.setupEventListeners();
        this.gameView.setupModalHandlers();
        
        // Применить сохраненные настройки
        this.configManager.applySettingsToUI();
        this.applySettings();
        
        // Создать игровое поле
        this.startNewGame();
        
        // Обновить статистику
        this.updateStatisticsDisplay();
        
        console.log('Игра Гомоку инициализирована!');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Клики по игровому полю
        this.gameView.onCellClick((row, col) => {
            this.handleCellClick(row, col);
        });

        // Кнопка новой игры
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.startNewGame();
        });

        // Кнопка отмены хода
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoLastMove();
        });

        // Кнопка подсказки
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });

        // Кнопка настроек
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.gameView.showSettingsModal();
        });

        // Сохранение настроек
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Новая игра из модального окна
        document.getElementById('modalNewGameBtn').addEventListener('click', () => {
            this.gameView.hideGameEndModal();
            this.startNewGame();
        });

        // Сброс статистики
        document.getElementById('resetStatsBtn').addEventListener('click', () => {
            this.resetStatistics();
        });

        // Изменение настроек в реальном времени
        document.getElementById('boardSize').addEventListener('change', (event) => {
            if (!this.isGameRunning || confirm('Начать новую игру с новым размером поля?')) {
                this.gameModel.setBoardSize(parseInt(event.target.value));
                this.startNewGame();
            } else {
                event.target.value = this.gameModel.boardSize;
            }
        });

        document.getElementById('gameMode').addEventListener('change', (event) => {
            if (this.isGameRunning) {
                const isAIMode = event.target.value === 'ai';
                if (isAIMode && this.gameModel.currentPlayer === 2) {
                    // Если переключились на ИИ и сейчас ход ИИ
                    this.makeAIMove();
                }
            }
        });

        document.getElementById('aiDifficulty').addEventListener('change', (event) => {
            this.aiPlayer.setDifficulty(event.target.value);
        });

        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.gameView.adaptForMobile();
        });

        // Автосохранение при закрытии страницы
        window.addEventListener('beforeunload', () => {
            if (this.isGameRunning) {
                this.configManager.saveGameState(this.gameModel.getGameState());
            }
        });
    }

    /**
     * Обработка клика по клетке
     * @param {number} row - Строка
     * @param {number} col - Столбец
     */
    handleCellClick(row, col) {
        if (!this.isGameRunning || this.isAIThinking) {
            return;
        }

        // Проверить, является ли ход ИИ в режиме против компьютера
        const gameMode = document.getElementById('gameMode').value;
        if (gameMode === 'ai' && this.gameModel.currentPlayer === 2) {
            return; // Не позволять игроку ходить за ИИ
        }

        this.makeMove(row, col);
    }

    /**
     * Выполнение хода
     * @param {number} row - Строка
     * @param {number} col - Столбец
     * @returns {boolean} Успешность хода
     */
    makeMove(row, col) {
        if (!this.gameModel.makeMove(row, col)) {
            this.gameView.showNotification('Недопустимый ход!', 'error');
            return false;
        }

        // Обновить визуальное представление
        this.gameView.placeStone(row, col, this.gameModel.currentPlayer === 1 ? 2 : 1);
        this.updateGameDisplay();

        // Проверить завершение игры
        if (this.gameModel.gameStatus === 'won') {
            this.handleGameEnd();
            return true;
        }

        if (this.gameModel.gameStatus === 'draw') {
            this.handleGameEnd();
            return true;
        }

        // Если играем против ИИ и сейчас ход ИИ
        const gameMode = document.getElementById('gameMode').value;
        if (gameMode === 'ai' && this.gameModel.currentPlayer === 2) {
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }

        return true;
    }

    /**
     * Выполнение хода ИИ
     */
    async makeAIMove() {
        if (!this.isGameRunning || this.gameModel.currentPlayer !== 2) {
            return;
        }

        this.isAIThinking = true;
        this.gameView.showLoadingIndicator();
        this.gameView.setBoardEnabled(false);

        try {
            // Небольшая задержка для реалистичности
            await new Promise(resolve => setTimeout(resolve, 800));

            const aiMove = this.aiPlayer.getBestMove(this.gameModel);
            
            if (aiMove) {
                this.makeMove(aiMove.row, aiMove.col);
            }
        } catch (error) {
            console.error('Ошибка ИИ:', error);
            this.gameView.showNotification('Ошибка ИИ', 'error');
        } finally {
            this.isAIThinking = false;
            this.gameView.hideLoadingIndicator();
            this.gameView.setBoardEnabled(true);
        }
    }

    /**
     * Начать новую игру
     */
    startNewGame() {
        // Сохранить текущие настройки
        this.configManager.collectSettingsFromUI();
        this.applySettings();

        // Сбросить модель игры
        this.gameModel.reset();
        this.gameModel.setBoardSize(this.configManager.getSetting('boardSize'));

        // Обновить представление
        this.gameView.createBoard(this.gameModel.boardSize);
        this.gameView.clearBoard();
        this.updateGameDisplay();

        // Запустить игру
        this.isGameRunning = true;
        this.gameView.startGameTimer(() => this.gameModel.getGameTime());

        // Обновить состояние кнопок
        this.gameView.setButtonEnabled('undoBtn', false);
        this.gameView.setButtonEnabled('hintBtn', true);

        this.gameView.showNotification('Новая игра началась!', 'success');
    }

    /**
     * Отмена последнего хода
     */
    undoLastMove() {
        if (!this.isGameRunning || this.gameModel.moveHistory.length === 0) {
            return;
        }

        // В режиме ИИ отменяем два хода (игрока и ИИ)
        const gameMode = document.getElementById('gameMode').value;
        const undoCount = gameMode === 'ai' && this.gameModel.moveHistory.length >= 2 ? 2 : 1;

        for (let i = 0; i < undoCount; i++) {
            const lastMove = this.gameModel.moveHistory[this.gameModel.moveHistory.length - 1];
            if (lastMove && this.gameModel.undoMove()) {
                this.gameView.removeStone(lastMove.row, lastMove.col);
            }
        }

        this.updateGameDisplay();
        
        // Обновить состояние кнопок
        this.gameView.setButtonEnabled('undoBtn', this.gameModel.moveHistory.length > 0);
    }

    /**
     * Показать подсказку
     */
    showHint() {
        if (!this.isGameRunning || this.isAIThinking) {
            return;
        }

        const hint = this.aiPlayer.getHint(this.gameModel);
        if (hint) {
            this.gameView.showHint(hint.row, hint.col);
            const explanation = this.aiPlayer.explainMove(hint, this.gameModel);
            this.gameView.showNotification(`Подсказка: ${explanation}`, 'info');
        } else {
            this.gameView.showNotification('Нет доступных подсказок', 'warning');
        }
    }

    /**
     * Обработка завершения игры
     */
    handleGameEnd() {
        this.isGameRunning = false;
        this.gameView.stopGameTimer();

        let title, message, result;
        
        if (this.gameModel.gameStatus === 'won') {
            this.gameView.highlightWinLine(this.gameModel.winLine);
            
            const winner = this.gameModel.winner;
            const gameMode = document.getElementById('gameMode').value;
            
            if (gameMode === 'ai') {
                if (winner === 1) {
                    title = '🎉 Победа!';
                    message = 'Поздравляем! Вы победили компьютер!';
                    result = 'player1';
                } else {
                    title = '😔 Поражение';
                    message = 'Компьютер победил. Попробуйте еще раз!';
                    result = 'player2';
                }
            } else {
                title = '🎉 Победа!';
                message = `Игрок ${winner} (${winner === 1 ? 'Черный' : 'Белый'}) победил!`;
                result = winner === 1 ? 'player1' : 'player2';
            }
        } else {
            title = '🤝 Ничья';
            message = 'Игра закончилась ничьей. Все клетки заняты!';
            result = 'draw';
        }

        // Обновить статистику
        this.configManager.updateStatistics(result, this.gameModel.getGameTime());
        this.updateStatisticsDisplay();

        // Добавить в историю
        this.configManager.addToGameHistory({
            result,
            moves: this.gameModel.moveCount,
            time: this.gameModel.getFormattedGameTime(),
            boardSize: this.gameModel.boardSize,
            gameMode: document.getElementById('gameMode').value
        });

        // Показать модальное окно
        this.gameView.showGameEndModal(
            title,
            message,
            this.gameModel.moveCount,
            this.gameModel.getFormattedGameTime()
        );

        // Обновить состояние кнопок
        this.gameView.setButtonEnabled('undoBtn', false);
        this.gameView.setButtonEnabled('hintBtn', false);

        // Очистить сохраненную игру
        this.configManager.clearSavedGame();
    }

    /**
     * Обновление отображения игры
     */
    updateGameDisplay() {
        this.gameView.updateCurrentPlayer(this.gameModel.currentPlayer);
        this.gameView.updateMoveCount(this.gameModel.moveCount);
        
        // Обновить состояние кнопки отмены
        this.gameView.setButtonEnabled('undoBtn', this.gameModel.moveHistory.length > 0);
    }

    /**
     * Обновление отображения статистики
     */
    updateStatisticsDisplay() {
        const stats = this.configManager.getStatistics();
        this.gameView.updateStatistics(stats);
    }

    /**
     * Сохранение настроек
     */
    saveSettings() {
        this.configManager.collectSettingsFromUI();
        this.applySettings();
        this.gameView.hideSettingsModal();
        this.gameView.showNotification('Настройки сохранены!', 'success');
    }

    /**
     * Применение настроек
     */
    applySettings() {
        // Применить настройку сложности ИИ
        const difficulty = this.configManager.getSetting('aiDifficulty');
        this.aiPlayer.setDifficulty(difficulty);

        // Применить настройки анимации
        this.configManager.applyAnimationSpeed();

        // Применить настройки координат
        this.configManager.applyCoordinatesDisplay();

        // Адаптировать интерфейс для мобильных устройств
        this.gameView.adaptForMobile();
    }

    /**
     * Сброс статистики
     */
    resetStatistics() {
        if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
            this.configManager.resetStatistics();
            this.updateStatisticsDisplay();
            this.gameView.showNotification('Статистика сброшена!', 'success');
        }
    }

    /**
     * Пауза игры
     */
    pauseGame() {
        if (this.isGameRunning) {
            this.gameView.stopGameTimer();
            this.gameView.setBoardEnabled(false);
            this.gameView.showNotification('Игра на паузе', 'info');
        }
    }

    /**
     * Возобновление игры
     */
    resumeGame() {
        if (this.isGameRunning) {
            this.gameView.startGameTimer(() => this.gameModel.getGameTime());
            this.gameView.setBoardEnabled(true);
            this.gameView.showNotification('Игра возобновлена', 'success');
        }
    }

    /**
     * Загрузка сохраненной игры
     */
    loadSavedGame() {
        const savedState = this.configManager.loadGameState();
        if (savedState) {
            this.gameModel.loadGameState(savedState);
            this.gameView.createBoard(this.gameModel.boardSize);
            this.gameView.clearBoard();

            // Воссоздать позицию на доске
            for (let row = 0; row < this.gameModel.boardSize; row++) {
                for (let col = 0; col < this.gameModel.boardSize; col++) {
                    const cell = this.gameModel.getCell(row, col);
                    if (cell !== 0) {
                        this.gameView.placeStone(row, col, cell);
                    }
                }
            }

            // Подсветить победную линию, если есть
            if (this.gameModel.winLine.length > 0) {
                this.gameView.highlightWinLine(this.gameModel.winLine);
            }

            this.updateGameDisplay();
            this.isGameRunning = this.gameModel.gameStatus === 'playing';

            if (this.isGameRunning) {
                this.gameView.startGameTimer(() => this.gameModel.getGameTime());
            }

            return true;
        }
        return false;
    }

    /**
     * Анализ текущей позиции
     */
    analyzePosition() {
        if (!this.isGameRunning) {
            return;
        }

        const analysis = this.aiPlayer.analyzePosition(this.gameModel);
        let message = `Оценка позиции: ${analysis.evaluation}\n`;
        
        if (analysis.immediateWin) {
            message += 'У вас есть выигрышный ход!\n';
        } else if (analysis.needsDefense) {
            message += 'Необходимо защищаться!\n';
        }

        this.gameView.showNotification(message, 'info');
        console.log('Анализ позиции:', analysis);
    }

    /**
     * Получение информации об игре
     * @returns {Object} Информация об игре
     */
    getGameInfo() {
        return {
            isRunning: this.isGameRunning,
            currentPlayer: this.gameModel.currentPlayer,
            moveCount: this.gameModel.moveCount,
            gameTime: this.gameModel.getFormattedGameTime(),
            boardSize: this.gameModel.boardSize,
            gameStatus: this.gameModel.gameStatus
        };
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.gameController = new GameController();
        
        // Попытаться загрузить сохраненную игру
        if (window.gameController.loadSavedGame()) {
            console.log('Сохраненная игра загружена');
        }
    } catch (error) {
        console.error('Ошибка инициализации игры:', error);
        alert('Произошла ошибка при загрузке игры. Пожалуйста, обновите страницу.');
    }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameController;
} else if (typeof window !== 'undefined') {
    window.GameController = GameController;
}
