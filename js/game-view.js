/**
 * GameView - Управление пользовательским интерфейсом игры Гомоку
 */
class GameView {
    constructor() {
        this.boardElement = document.getElementById('gameBoard');
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.moveCountElement = document.getElementById('moveCount');
        this.gameTimeElement = document.getElementById('gameTime');
        
        this.boardSize = 15;
        this.cells = [];
        this.gameTimeInterval = null;
        
        this.initializeElements();
    }

    /**
     * Инициализация элементов интерфейса
     */
    initializeElements() {
        // Элементы модальных окон
        this.gameEndModal = document.getElementById('gameEndModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // Элементы статистики
        this.player1WinsElement = document.getElementById('player1Wins');
        this.player2WinsElement = document.getElementById('player2Wins');
        this.drawsElement = document.getElementById('draws');
        this.totalGamesElement = document.getElementById('totalGames');
    }

    /**
     * Создание игрового поля
     * @param {number} size - Размер поля
     */
    createBoard(size) {
        this.boardSize = size;
        this.boardElement.innerHTML = '';
        this.boardElement.className = `game-board size-${size}`;
        this.cells = [];

        for (let row = 0; row < size; row++) {
            this.cells[row] = [];
            for (let col = 0; col < size; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.setAttribute('role', 'gridcell');
                cell.setAttribute('aria-label', `Клетка ${row + 1}, ${col + 1}`);
                
                this.boardElement.appendChild(cell);
                this.cells[row][col] = cell;
            }
        }
    }

    /**
     * Размещение фишки на игровом поле
     * @param {number} row - Строка
     * @param {number} col - Столбец
     * @param {number} player - Игрок (1 или 2)
     */
    placeStone(row, col, player) {
        const cell = this.cells[row][col];
        const stone = document.createElement('div');
        
        stone.className = `stone ${player === 1 ? 'black' : 'white'}`;
        stone.setAttribute('aria-label', `Фишка ${player === 1 ? 'черная' : 'белая'}`);
        
        cell.appendChild(stone);
        cell.classList.add('occupied');
        
        // Добавить класс для последнего хода
        this.clearLastMoveIndicator();
        cell.classList.add('last-move');
    }

    /**
     * Удаление фишки с игрового поля
     * @param {number} row - Строка
     * @param {number} col - Столбец
     */
    removeStone(row, col) {
        const cell = this.cells[row][col];
        const stone = cell.querySelector('.stone');
        if (stone) {
            stone.remove();
        }
        cell.classList.remove('occupied', 'last-move');
    }

    /**
     * Очистка индикатора последнего хода
     */
    clearLastMoveIndicator() {
        const lastMoveCell = this.boardElement.querySelector('.last-move');
        if (lastMoveCell) {
            lastMoveCell.classList.remove('last-move');
        }
    }

    /**
     * Подсветка победной линии
     * @param {Array} winLine - Массив координат победной линии
     */
    highlightWinLine(winLine) {
        winLine.forEach(({row, col}) => {
            const cell = this.cells[row][col];
            const stone = cell.querySelector('.stone');
            if (stone) {
                stone.classList.add('winning');
            }
        });
    }

    /**
     * Обновление индикатора текущего игрока
     * @param {number} player - Номер игрока (1 или 2)
     */
    updateCurrentPlayer(player) {
        const indicator = this.currentPlayerElement.querySelector('.player-indicator');
        const text = this.currentPlayerElement.querySelector('.player-text');
        
        if (player === 1) {
            indicator.classList.remove('white');
            text.textContent = 'Ход: Игрок 1 (Черный)';
        } else {
            indicator.classList.add('white');
            text.textContent = 'Ход: Игрок 2 (Белый)';
        }
    }

    /**
     * Обновление счетчика ходов
     * @param {number} count - Количество ходов
     */
    updateMoveCount(count) {
        this.moveCountElement.textContent = count;
    }

    /**
     * Запуск таймера игры
     * @param {Function} getGameTime - Функция получения времени игры
     */
    startGameTimer(getGameTime) {
        this.stopGameTimer();
        this.gameTimeInterval = setInterval(() => {
            this.gameTimeElement.textContent = this.formatTime(getGameTime());
        }, 1000);
    }

    /**
     * Остановка таймера игры
     */
    stopGameTimer() {
        if (this.gameTimeInterval) {
            clearInterval(this.gameTimeInterval);
            this.gameTimeInterval = null;
        }
    }

    /**
     * Форматирование времени
     * @param {number} seconds - Секунды
     * @returns {string} Время в формате MM:SS
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Показ сообщения о завершении игры
     * @param {string} title - Заголовок
     * @param {string} message - Сообщение
     * @param {number} moves - Количество ходов
     * @param {string} time - Время игры
     */
    showGameEndModal(title, message, moves, time) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('modalMoves').textContent = moves;
        document.getElementById('modalTime').textContent = time;
        
        this.gameEndModal.classList.add('active');
        this.gameEndModal.setAttribute('aria-hidden', 'false');
    }

    /**
     * Скрытие модального окна завершения игры
     */
    hideGameEndModal() {
        this.gameEndModal.classList.remove('active');
        this.gameEndModal.setAttribute('aria-hidden', 'true');
    }

    /**
     * Показ модального окна настроек
     */
    showSettingsModal() {
        this.settingsModal.classList.add('active');
        this.settingsModal.setAttribute('aria-hidden', 'false');
    }

    /**
     * Скрытие модального окна настроек
     */
    hideSettingsModal() {
        this.settingsModal.classList.remove('active');
        this.settingsModal.setAttribute('aria-hidden', 'true');
    }

    /**
     * Показ индикатора загрузки
     */
    showLoadingIndicator() {
        this.loadingIndicator.classList.add('active');
        this.loadingIndicator.setAttribute('aria-hidden', 'false');
    }

    /**
     * Скрытие индикатора загрузки
     */
    hideLoadingIndicator() {
        this.loadingIndicator.classList.remove('active');
        this.loadingIndicator.setAttribute('aria-hidden', 'true');
    }

    /**
     * Показ подсказки
     * @param {number} row - Строка
     * @param {number} col - Столбец
     */
    showHint(row, col) {
        this.clearHints();
        const cell = this.cells[row][col];
        cell.classList.add('hint');
        
        // Автоматически скрыть подсказку через 3 секунды
        setTimeout(() => {
            this.clearHints();
        }, 3000);
    }

    /**
     * Очистка подсказок
     */
    clearHints() {
        const hintCells = this.boardElement.querySelectorAll('.hint');
        hintCells.forEach(cell => {
            cell.classList.remove('hint');
        });
    }

    /**
     * Очистка игрового поля
     */
    clearBoard() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.removeStone(row, col);
                this.cells[row][col].classList.remove('hint', 'last-move');
            }
        }
        
        // Очистить подсветку победной линии
        const winningStones = this.boardElement.querySelectorAll('.stone.winning');
        winningStones.forEach(stone => {
            stone.classList.remove('winning');
        });
    }

    /**
     * Обновление статистики
     * @param {Object} stats - Объект статистики
     */
    updateStatistics(stats) {
        this.player1WinsElement.textContent = stats.player1Wins || 0;
        this.player2WinsElement.textContent = stats.player2Wins || 0;
        this.drawsElement.textContent = stats.draws || 0;
        this.totalGamesElement.textContent = stats.totalGames || 0;
    }

    /**
     * Включение/отключение кнопки
     * @param {string} buttonId - ID кнопки
     * @param {boolean} enabled - Включена ли кнопка
     */
    setButtonEnabled(buttonId, enabled) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = !enabled;
        }
    }

    /**
     * Добавление обработчика клика по клетке
     * @param {Function} callback - Функция обработчик
     */
    onCellClick(callback) {
        this.boardElement.addEventListener('click', (event) => {
            const cell = event.target.closest('.cell');
            if (cell && !cell.classList.contains('occupied')) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                callback(row, col);
            }
        });
    }

    /**
     * Добавление обработчика для модальных окон
     */
    setupModalHandlers() {
        // Закрытие модальных окон по клику на крестик
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => {
                this.hideGameEndModal();
                this.hideSettingsModal();
            });
        });

        // Закрытие модальных окон по клику вне содержимого
        [this.gameEndModal, this.settingsModal].forEach(modal => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    this.hideGameEndModal();
                    this.hideSettingsModal();
                }
            });
        });

        // Закрытие по клавише Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideGameEndModal();
                this.hideSettingsModal();
            }
        });
    }

    /**
     * Показ уведомления
     * @param {string} message - Сообщение
     * @param {string} type - Тип уведомления ('success', 'warning', 'error')
     */
    showNotification(message, type = 'info') {
        // Создать элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Добавить стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Автоматически удалить уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Включение/выключение игрового поля
     * @param {boolean} enabled - Включено ли поле
     */
    setBoardEnabled(enabled) {
        if (enabled) {
            this.boardElement.style.pointerEvents = 'auto';
            this.boardElement.style.opacity = '1';
        } else {
            this.boardElement.style.pointerEvents = 'none';
            this.boardElement.style.opacity = '0.7';
        }
    }

    /**
     * Анимация размещения фишки
     * @param {number} row - Строка
     * @param {number} col - Столбец
     * @param {number} player - Игрок
     */
    animatePlaceStone(row, col, player) {
        const cell = this.cells[row][col];
        
        // Создать временную фишку для анимации
        const tempStone = document.createElement('div');
        tempStone.className = `stone ${player === 1 ? 'black' : 'white'}`;
        tempStone.style.transform = 'scale(1.5)';
        tempStone.style.opacity = '0.8';
        
        cell.appendChild(tempStone);
        
        // Анимация к финальному размеру
        setTimeout(() => {
            tempStone.style.transform = 'scale(1)';
            tempStone.style.opacity = '1';
        }, 50);
        
        cell.classList.add('occupied');
        this.clearLastMoveIndicator();
        cell.classList.add('last-move');
    }

    /**
     * Получение размеров игрового поля для адаптивности
     * @returns {Object} Объект с размерами
     */
    getBoardDimensions() {
        const rect = this.boardElement.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            cellSize: rect.width / this.boardSize
        };
    }

    /**
     * Адаптация размеров для мобильных устройств
     */
    adaptForMobile() {
        const isMobile = window.innerWidth < 768;
        const cellSize = isMobile ? '18px' : '28px';
        const stoneSize = isMobile ? '14px' : '24px';
        
        document.documentElement.style.setProperty('--cell-size', cellSize);
        document.documentElement.style.setProperty('--stone-size', stoneSize);
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameView;
} else if (typeof window !== 'undefined') {
    window.GameView = GameView;
}
