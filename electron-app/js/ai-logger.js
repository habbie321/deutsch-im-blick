/**
 * Main-process AI telemetry (no message content or student answers).
 */

function logAiEvent(event, meta = {}) {
  const payload = {
    at: new Date().toISOString(),
    event,
    ...meta
  };
  console.info('[ai]', JSON.stringify(payload));
}

module.exports = { logAiEvent };
