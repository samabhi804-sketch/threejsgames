/**
 * Global error handling and user feedback system
 */
export class ErrorHandler {
    static init() {
        console.log('🚨 Initializing error handler...');

        // Global error handlers
        window.addEventListener('error', (event) => {
            this.handleError(event.error, event.message, event.filename, event.lineno, event.colno);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
        });

        // Handle WebGL context loss
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                this.handleWebGLContextLoss();
            });

            canvas.addEventListener('webglcontextrestored', () => {
                this.handleWebGLContextRestored();
            });
        }

        console.log('✅ Error handler initialized');
    }

    /**
     * Handle general errors
     */
    static handleError(error, message, filename, lineno, colno) {
        console.error('🚨 Error occurred:', {
            error,
            message,
            filename,
            lineno,
            colno,
            stack: error?.stack,
            timestamp: new Date().toISOString()
        });

        // Categorize error
        const errorType = this.categorizeError(error, message);

        // Handle based on error type
        switch (errorType) {
            case 'network':
                this.handleNetworkError(message);
                break;
            case 'webgl':
                this.handleWebGLError(message);
                break;
            case 'library':
                this.handleLibraryError(message);
                break;
            default:
                this.handleGenericError(message);
        }
    }

    /**
     * Categorize error type
     */
    static categorizeError(error, message) {
        const msg = (message || '').toLowerCase();
        const err = (error?.message || '').toLowerCase();

        if (msg.includes('network') || msg.includes('fetch') || msg.includes('load')) {
            return 'network';
        }

        if (msg.includes('webgl') || msg.includes('context') || err.includes('webgl')) {
            return 'webgl';
        }

        if (msg.includes('three') || msg.includes('tween') || msg.includes('library')) {
            return 'library';
        }

        return 'generic';
    }

    /**
     * Handle network errors
     */
    static handleNetworkError(message) {
        console.warn('🌐 Network error detected:', message);

        // Show user-friendly message
        this.showUserMessage(
            'Connection Issue',
            'Unable to load game resources. Please check your internet connection and try again.',
            'warning'
        );
    }

    /**
     * Handle WebGL errors
     */
    static handleWebGLError(message) {
        console.error('🎮 WebGL error:', message);

        this.showUserMessage(
            'Graphics Error',
            'Your browser or graphics card doesn\'t support WebGL properly. Try updating your browser or graphics drivers.',
            'error'
        );
    }

    /**
     * Handle library loading errors
     */
    static handleLibraryError(message) {
        console.error('📚 Library loading error:', message);

        this.showUserMessage(
            'Library Error',
            'Failed to load required game libraries. Please refresh the page or try again later.',
            'error'
        );
    }

    /**
     * Handle generic errors
     */
    static handleGenericError(message) {
        console.error('❓ Generic error:', message);

        // Only show user message for critical errors
        if (this.isCriticalError(message)) {
            this.showUserMessage(
                'Game Error',
                'An unexpected error occurred. The game may not work properly.',
                'error'
            );
        }
    }

    /**
     * Handle WebGL context loss
     */
    static handleWebGLContextLoss() {
        console.warn('🎮 WebGL context lost');

        this.showUserMessage(
            'Graphics Context Lost',
            'The graphics context was lost. This can happen when your computer goes to sleep or runs out of memory. The page will attempt to restore the context.',
            'warning'
        );
    }

    /**
     * Handle WebGL context restoration
     */
    static handleWebGLContextRestored() {
        console.log('🎮 WebGL context restored');

        this.showUserMessage(
            'Graphics Restored',
            'The graphics context has been restored. You may need to restart your game.',
            'success'
        );
    }

    /**
     * Check if error is critical
     */
    static isCriticalError(message) {
        const criticalPatterns = [
            'referenceerror',
            'typeerror',
            'syntaxerror',
            'out of memory',
            'maximum call stack'
        ];

        const msg = message.toLowerCase();
        return criticalPatterns.some(pattern => msg.includes(pattern));
    }

    /**
     * Show user-friendly error message
     */
    static showError(message, title = 'Error') {
        this.showUserMessage(title, message, 'error');
    }

    /**
     * Show user message with different types
     */
    static showUserMessage(title, message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `user-message ${type}`;
        messageEl.innerHTML = `
            <div class="message-header">
                <span class="message-icon">${this.getMessageIcon(type)}</span>
                <span class="message-title">${title}</span>
                <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="message-body">${message}</div>
        `;

        // Add styles
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            background: ${this.getMessageBackground(type)};
            border: 1px solid ${this.getMessageBorder(type)};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
            color: white;
            overflow: hidden;
        `;

        // Add to page
        document.body.appendChild(messageEl);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (messageEl.parentElement) {
                messageEl.remove();
            }
        }, 10000);
    }

    /**
     * Get message icon
     */
    static getMessageIcon(type) {
        switch (type) {
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'success': return '✅';
            default: return 'ℹ️';
        }
    }

    /**
     * Get message background color
     */
    static getMessageBackground(type) {
        switch (type) {
            case 'error': return 'rgba(231, 76, 60, 0.9)';
            case 'warning': return 'rgba(241, 196, 15, 0.9)';
            case 'success': return 'rgba(46, 204, 113, 0.9)';
            default: return 'rgba(52, 152, 219, 0.9)';
        }
    }

    /**
     * Get message border color
     */
    static getMessageBorder(type) {
        switch (type) {
            case 'error': return '#e74c3c';
            case 'warning': return '#f1c40f';
            case 'success': return '#2ecc71';
            default: return '#3498db';
        }
    }

    /**
     * Log performance issues
     */
    static logPerformanceIssue(issue, data) {
        console.warn('⚡ Performance issue:', issue, data);
    }

    /**
     * Create error report
     */
    static createErrorReport(error, context = {}) {
        return {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context,
            gameState: this.getGameStateSnapshot()
        };
    }

    /**
     * Get game state snapshot for error reporting
     */
    static getGameStateSnapshot() {
        try {
            // This would integrate with the game instance to get current state
            return {
                timestamp: Date.now(),
                // Add game state properties here
            };
        } catch (error) {
            return { error: 'Failed to get game state' };
        }
    }
}