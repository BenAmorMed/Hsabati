const EventEmitter = require('events');

/**
 * Central event bus for inter-agent communication.
 * Singleton instance shared across all agents.
 */
class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(30); // Allow many agent listeners
    }

    /**
     * Emit an event with structured payload logging.
     */
    emitEvent(event, payload) {
        console.log(`📡 EventBus [${event}]`, JSON.stringify(payload).substring(0, 120));
        this.emit(event, payload);
    }
}

// Export singleton
const eventBus = new EventBus();
module.exports = eventBus;
