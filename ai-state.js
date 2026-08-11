console.log("AI Gmail Extension Loaded");

const AI_STATE = {
    IDLE: "idle",
    GENERATING: "generating",
    SUCCESS: "success",
    ERROR: "error"
};

let currentReplyState = AI_STATE.IDLE;
let currentSummarizeState = AI_STATE.IDLE;
