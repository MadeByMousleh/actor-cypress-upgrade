export default MessageEventHandler = {
    listeners: {},
    timeouts: {},
    processedMessages: new Set(), // Track processed message IDs

    addListener(nodeMac, messageId, callback, timeoutDuration = 5000) {
        const listenerKey = `${nodeMac.toUpperCase()}_${messageId}`;

        // Check if the message has already been processed
        if (this.processedMessages.has(listenerKey)) {
            console.log(`Message ${listenerKey} already processed, ignoring.`);
            return; // Ignore processing if already processed
        }

        this.listeners[listenerKey] = callback;

        // Set a timeout for this listener
        this.timeouts[listenerKey] = setTimeout(() => {
            this.removeListener(listenerKey);
            callback(new Error("Timeout waiting for response"));
        }, timeoutDuration);
    },

    removeListener(listenerKey) {
        clearTimeout(this.timeouts[listenerKey]);
        delete this.listeners[listenerKey];
        delete this.timeouts[listenerKey];
    },

    handleMessage(msg) {
        try {
            const { id, value, messageId } = JSON.parse(msg.data);
            const listenerKey = `${id.toUpperCase()}_${messageId}`;

            // Skip processing if the message was already processed
            if (this.processedMessages.has(listenerKey)) {
                console.log(`Duplicate message received for ${listenerKey}, ignoring.`);
                return;
            }

            // Mark the message as processed
            this.processedMessages.add(listenerKey);

            const listener = this.listeners[listenerKey];
            if (listener) {
                listener(value);
                this.removeListener(listenerKey); // Clean up after handling the message
            }
        } catch (error) {
            console.error("Error processing message:", error.message);
        }
    }
};

// Attach the global event listener
evReply.onmessage = (msg) => MessageEventHandler.handleMessage(msg);
