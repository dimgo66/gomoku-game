/**
 * ConfigManager - Управление настройками и статистикой игры
 */
class ConfigManager {
    constructor() {
        this.defaultSettings = {
            boardSize: 15,
            gameMode: 'human',
            aiDifficulty: 'medium',
            animationSpeed: 'normal',
            soundEnabled: true,
            showCoordinates: false
        };
        
        this.defaultStats = {
            player1Wins: 0,
            player2Wins: 0,
            draws: 0,
            totalGames: 0,
            playTime: 0
        };
        
        this.settings = this.loadSettings();
        this.stats = this.loadStatistics();
    }

    /**
     * Загрузка настроек из localStorage
     * @returns {Object} Настройки
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('gomoku_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                return { ...this.defaultSettings, ...settings };
            }
        } catch (error) {
            console.warn('Ошибка загрузки настроек:', error);
        }
        return { ...this.defaultSettings };
    }

    /**
     * Сохранение настроек в localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('gomoku_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Ошибка сохранения настроек:', error);
        }
    }

    /**
     * Получение значения настройки
     * @param {string} key - Ключ настройки
     * @returns {*} Значение настройки
     */
    getSetting(key) {
        return this.settings[key];
    }

    /**
     * Установка значения настройки
     * @param {string} key - Ключ настройки
     * @param {*} value - Значение настройки
     */
    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    /**
     * Применение настроек к элементам интерфейса
     */
    applySettingsToUI() {
        // Размер поля
        const boardSizeSelect = document.getElementById('boardSize');
        if (boardSizeSelect) {
            boardSizeSelect.value = this.settings.boardSize;
        }

        // Режим игры
        const gameModeSelect = document.getElementById('gameMode');
        if (gameModeSelect) {
            gameModeSelect.value = this.settings.gameMode;
        }

        // Сложность ИИ
        const aiDifficultySelect = document.getElementById('aiDifficulty');
        if (aiDifficultySelect) {
            aiDifficultySelect.value = this.settings.aiDifficulty;
        }

        // Скорость анимации
        const animationSpeedSelect = document.getElementById('animationSpeed');
        if (animationSpeedSelect) {
            animationSpeedSelect.value = this.settings.animationSpeed;
        }

        // Звуковые эффекты
        const soundEnabledCheckbox = document.getElementById('soundEnabled');
        if (soundEnabledCheckbox) {
            soundEnabledCheckbox.checked = this.settings.soundEnabled;
        }

        // Показ координат
        const showCoordinatesCheckbox = document.getElementById('showCoordinates');
        if (showCoordinatesCheckbox) {
            showCoordinatesCheckbox.checked = this.settings.showCoordinates;
        }
    }

    /**
     * Сбор настроек из интерфейса
     */
    collectSettingsFromUI() {
        const boardSizeSelect = document.getElementById('boardSize');
        if (boardSizeSelect) {
            this.settings.boardSize = parseInt(boardSizeSelect.value);
        }

        const gameModeSelect = document.getElementById('gameMode');
        if (gameModeSelect) {
            this.settings.gameMode = gameModeSelect.value;
        }

        const aiDifficultySelect = document.getElementById('aiDifficulty');
        if (aiDifficultySelect) {
            this.settings.aiDifficulty = aiDifficultySelect.value;
        }

        const animationSpeedSelect = document.getElementById('animationSpeed');
        if (animationSpeedSelect) {
            this.settings.animationSpeed = animationSpeedSelect.value;
        }

        const soundEnabledCheckbox = document.getElementById('soundEnabled');
        if (soundEnabledCheckbox) {
            this.settings.soundEnabled = soundEnabledCheckbox.checked;
        }

        const showCoordinatesCheckbox = document.getElementById('showCoordinates');
        if (showCoordinatesCheckbox) {
            this.settings.showCoordinates = showCoordinatesCheckbox.checked;
        }

        this.saveSettings();
    }

    /**
     * Загрузка статистики из localStorage
     * @returns {Object} Статистика
     */
    loadStatistics() {
        try {
            const saved = localStorage.getItem('gomoku_stats');
            if (saved) {
                const stats = JSON.parse(saved);
                return { ...this.defaultStats, ...stats };
            }
        } catch (error) {
            console.warn('Ошибка загрузки статистики:', error);
        }
        return { ...this.defaultStats };
    }

    /**
     * Сохранение статистики в localStorage
     */
    saveStatistics() {
        try {
            localStorage.setItem('gomoku_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Ошибка сохранения статистики:', error);
        }
    }

    /**
     * Получение статистики
     * @returns {Object} Статистика
     */
    getStatistics() {
        return { ...this.stats };
    }

    /**
     * Обновление статистики после завершения игры
     * @param {string} result - Результат игры ('player1', 'player2', 'draw')
     * @param {number} gameTime - Время игры в секундах
     */
    updateStatistics(result, gameTime = 0) {
        this.stats.totalGames++;
        this.stats.playTime += gameTime;

        switch (result) {
            case 'player1':
                this.stats.player1Wins++;
                break;
            case 'player2':
                this.stats.player2Wins++;
                break;
            case 'draw':
                this.stats.draws++;
                break;
        }

        this.saveStatistics();
    }

    /**
     * Сброс статистики
     */
    resetStatistics() {
        this.stats = { ...this.defaultStats };
        this.saveStatistics();
    }

    /**
     * Получение процента побед игрока
     * @param {number} player - Номер игрока (1 или 2)
     * @returns {number} Процент побед
     */
    getWinRate(player) {
        if (this.stats.totalGames === 0) return 0;
        
        const wins = player === 1 ? this.stats.player1Wins : this.stats.player2Wins;
        return Math.round((wins / this.stats.totalGames) * 100);
    }

    /**
     * Получение среднего времени игры
     * @returns {string} Среднее время в формате MM:SS
     */
    getAverageGameTime() {
        if (this.stats.totalGames === 0) return '00:00';
        
        const averageSeconds = Math.floor(this.stats.playTime / this.stats.totalGames);
        const minutes = Math.floor(averageSeconds / 60);
        const seconds = averageSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Сохранение состояния игры
     * @param {Object} gameState - Состояние игры
     */
    saveGameState(gameState) {
        try {
            localStorage.setItem('gomoku_game_state', JSON.stringify(gameState));
        } catch (error) {
            console.warn('Ошибка сохранения игры:', error);
        }
    }

    /**
     * Загрузка состояния игры
     * @returns {Object|null} Состояние игры или null
     */
    loadGameState() {
        try {
            const saved = localStorage.getItem('gomoku_game_state');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Ошибка загрузки игры:', error);
        }
        return null;
    }

    /**
     * Удаление сохраненной игры
     */
    clearSavedGame() {
        try {
            localStorage.removeItem('gomoku_game_state');
        } catch (error) {
            console.warn('Ошибка очистки сохраненной игры:', error);
        }
    }

    /**
     * Экспорт настроек и статистики в JSON
     * @returns {string} JSON строка с данными
     */
    exportData() {
        const data = {
            settings: this.settings,
            statistics: this.stats,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Импорт настроек и статистики из JSON
     * @param {string} jsonData - JSON строка с данными
     * @returns {boolean} Успешность импорта
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.settings) {
                this.settings = { ...this.defaultSettings, ...data.settings };
                this.saveSettings();
                this.applySettingsToUI();
            }
            
            if (data.statistics) {
                this.stats = { ...this.defaultStats, ...data.statistics };
                this.saveStatistics();
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            return false;
        }
    }

    /**
     * Проверка поддержки localStorage
     * @returns {boolean} Поддерживается ли localStorage
     */
    isLocalStorageSupported() {
        try {
            const test = 'gomoku_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Получение размера данных в localStorage (в байтах)
     * @returns {number} Размер данных
     */
    getStorageSize() {
        if (!this.isLocalStorageSupported()) return 0;
        
        let total = 0;
        for (let key in localStorage) {
            if (key.startsWith('gomoku_')) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    /**
     * Применение настройки скорости анимации
     */
    applyAnimationSpeed() {
        const speed = this.settings.animationSpeed;
        let duration;
        
        switch (speed) {
            case 'fast':
                duration = '0.15s';
                break;
            case 'slow':
                duration = '0.6s';
                break;
            default: // normal
                duration = '0.3s';
        }
        
        document.documentElement.style.setProperty('--transition-duration', duration);
    }

    /**
     * Применение настройки показа координат
     */
    applyCoordinatesDisplay() {
        const show = this.settings.showCoordinates;
        const gameBoard = document.getElementById('gameBoard');
        
        if (gameBoard) {
            if (show) {
                gameBoard.classList.add('show-coordinates');
            } else {
                gameBoard.classList.remove('show-coordinates');
            }
        }
    }

    /**
     * Получение настроек темы (для будущего расширения)
     * @returns {Object} Настройки темы
     */
    getThemeSettings() {
        return {
            theme: this.settings.theme || 'default',
            boardColor: this.settings.boardColor || '#d4a574',
            stoneStyle: this.settings.stoneStyle || 'classic'
        };
    }

    /**
     * Валидация настроек
     * @returns {boolean} Валидны ли настройки
     */
    validateSettings() {
        const validBoardSizes = [15, 19];
        const validGameModes = ['human', 'ai'];
        const validDifficulties = ['easy', 'medium', 'hard'];
        const validAnimationSpeeds = ['fast', 'normal', 'slow'];
        
        return (
            validBoardSizes.includes(this.settings.boardSize) &&
            validGameModes.includes(this.settings.gameMode) &&
            validDifficulties.includes(this.settings.aiDifficulty) &&
            validAnimationSpeeds.includes(this.settings.animationSpeed) &&
            typeof this.settings.soundEnabled === 'boolean' &&
            typeof this.settings.showCoordinates === 'boolean'
        );
    }

    /**
     * Восстановление настроек по умолчанию
     */
    resetSettings() {
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applySettingsToUI();
    }

    /**
     * Получение истории игр (для будущего расширения)
     * @returns {Array} История игр
     */
    getGameHistory() {
        try {
            const saved = localStorage.getItem('gomoku_game_history');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Ошибка загрузки истории:', error);
        }
        return [];
    }

    /**
     * Добавление игры в историю
     * @param {Object} gameInfo - Информация об игре
     */
    addToGameHistory(gameInfo) {
        try {
            const history = this.getGameHistory();
            history.unshift({
                ...gameInfo,
                date: new Date().toISOString()
            });
            
            // Ограничить историю 100 играми
            if (history.length > 100) {
                history.length = 100;
            }
            
            localStorage.setItem('gomoku_game_history', JSON.stringify(history));
        } catch (error) {
            console.warn('Ошибка сохранения в историю:', error);
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
} else if (typeof window !== 'undefined') {
    window.ConfigManager = ConfigManager;
}
