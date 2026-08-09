
console.log("AI Gmail Extension Loaded");

const AI_STATE = {
    IDLE: "idle",
    GENERATING: "generating",
    SUCCESS: "success",
    ERROR: "error"
};

const COMPOSE_SELECTORS = [
    ".btC",
    ".aDh",
    "[role='dialog']",
    ".gU.Up"
];

const EMAIL_CONTENT_SELECTORS = [
    ".a3s.aiL",
    ".h7",
    ".gmail_quote"
];

const COMPOSE_TEXTBOX_SELECTOR =
    '[role="textbox"][g_editable="true"]';

const AI_API_ENDPOINT =
    "http://localhost:8080/api/v1/mail/gen-mail";

const BUTTON_RESET_DELAY = 2000;
const ERROR_RESET_DELAY = 3000;

let currentState = AI_STATE.IDLE;

function findComposeBox() {
    for (const selector of COMPOSE_SELECTORS) {
        const composeBox = document.querySelector(selector);

        if (composeBox) {
            return composeBox;
        }
    }

    return null;
}

function getEmailContent() {
    for (const selector of EMAIL_CONTENT_SELECTORS) {
        const emailElements = document.querySelectorAll(selector);

        if (!emailElements.length) {
            continue;
        }

        const emailElement = emailElements[emailElements.length - 1];
        const content = emailElement.innerText?.trim();

        if (content) {
            console.log("Email content found:", content);
            return content;
        }
    }

    console.log("Email content not found");
    return null;
}

function createReplyButton() {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "ai-reply-button";
    button.title = "Generate AI Reply";
    button.innerHTML = `
        <span class="ai-icon">✦</span>
        <span class="ai-button-text">AI Reply</span>
    `;

    return button;
}

function createStatusElement() {
    const status = document.createElement("span");
    status.className = "ai-status";
    return status;
}

function addButtonStyles() {
    if (document.getElementById("ai-reply-button-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "ai-reply-button-styles";

    style.textContent = `
        .ai-reply-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            height: 32px;
            min-width: 90px;
            padding: 0 12px;
            border: 1px solid #dadce0;
            border-radius: 16px;
            background: #ffffff;
            color: #202124;
            font-family: Google Sans, Roboto, Arial, sans-serif;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            margin-left: 8px;
            transition: background 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
            white-space: nowrap;
        }

        .ai-reply-button:hover {
            background: #f8fafd;
            border-color: #c5c7c9;
            box-shadow: 0 1px 2px rgba(60,64,67,.15), 0 1px 3px rgba(60,64,67,.08);
        }

        .ai-reply-button:active {
            background: #f1f3f4;
        }

        .ai-reply-button:disabled {
            cursor: not-allowed;
            opacity: 0.7;
        }

        .ai-icon {
            font-size: 16px;
            line-height: 1;
            color: #1a73e8;
        }

        .ai-button-text {
            line-height: 1;
        }

        .ai-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid #dadce0;
            border-top-color: #1a73e8;
            border-radius: 50%;
            animation: ai-spin 0.8s linear infinite;
        }

        @keyframes ai-spin {
            to { transform: rotate(360deg); }
        }

        .ai-status {
            font-family: Google Sans, Roboto, Arial, sans-serif;
            font-size: 12px;
            margin-left: 8px;
            white-space: nowrap;
        }

        .ai-status.generating { color: #5f6368; }
        .ai-status.success { color: #188038; }
        .ai-status.error { color: #d93025; }
    `;

    document.head.appendChild(style);
}

function setButtonState(button, state) {
    currentState = state;

    const icon = button.querySelector(".ai-icon");
    const text = button.querySelector(".ai-button-text");

    if (!icon || !text) {
        return;
    }

    button.disabled = state === AI_STATE.GENERATING;
    button.title = state === AI_STATE.GENERATING ? "Generating AI reply" : "Generate AI Reply";

    switch (state) {
        case AI_STATE.IDLE:
            icon.textContent = "✦";
            text.textContent = "AI Reply";
            break;
        case AI_STATE.GENERATING:
            icon.innerHTML = `<span class="ai-spinner"></span>`;
            text.textContent = "Generating...";
            break;
        case AI_STATE.SUCCESS:
            icon.textContent = "✓";
            text.textContent = "Generated";
            break;
        case AI_STATE.ERROR:
            icon.textContent = "!";
            text.textContent = "Try Again";
            button.title = "Try generating again";
            break;
    }
}

function setStatus(statusElement, state, message) {
    statusElement.className = `ai-status ${state}`;
    statusElement.textContent = message;
}

function resetUIAfterDelay(button, statusElement, state, message, delay) {
    setTimeout(() => {
        if (!document.body.contains(button)) {
            return;
        }

        setButtonState(button, AI_STATE.IDLE);
        setStatus(statusElement, "", "");
    }, delay);
}

function insertGeneratedEmail(composeBox, generatedText) {

    console.log("Inserting generated email into compose box...", generatedText);
    const composeTextArea = document.querySelector(COMPOSE_TEXTBOX_SELECTOR);

    if (!composeTextArea) {
        console.error("Gmail compose textbox not found");
        return false;
    }

    composeTextArea.value = generatedText;

    composeTextArea.focus();
    document.execCommand("insertText", false, generatedText);
    composeTextArea.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        inputType: "insertText",
        data: generatedText
    }));

    console.log("AI response inserted into Gmail compose box");
    return true;
}

async function fetchAiReply(emailContent) {
    const response = await fetch(AI_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailContent, type: "professional" })
    });

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const generatedText = await response.text();

    if (!generatedText?.trim()) {
        throw new Error("AI service returned an empty response");
    }

    return generatedText;
}

async function generateAIReply(composeBox, aiButton, statusElement) {
    const emailContent = getEmailContent();

    if (!emailContent) {
        setButtonState(aiButton, AI_STATE.ERROR);
        setStatus(statusElement, "error", "Email content not found");
        resetUIAfterDelay(aiButton, statusElement, AI_STATE.IDLE, "", ERROR_RESET_DELAY);
        return;
    }

    setButtonState(aiButton, AI_STATE.GENERATING);
    setStatus(statusElement, "generating", "Generating AI reply...");

    try {
        console.log("Sending email to AI service...");
        const generatedText = await fetchAiReply(emailContent);

        if (!insertGeneratedEmail(composeBox, generatedText)) {
            throw new Error("Could not find Gmail compose textbox");
        }

        setButtonState(aiButton, AI_STATE.SUCCESS);
        setStatus(statusElement, "success", "Reply generated");
        resetUIAfterDelay(aiButton, statusElement, AI_STATE.IDLE, "", BUTTON_RESET_DELAY);
    } catch (error) {
        console.error("AI Reply Error:", error);
        setButtonState(aiButton, AI_STATE.ERROR);
        setStatus(statusElement, "error", "Failed to generate reply");
        resetUIAfterDelay(aiButton, statusElement, AI_STATE.IDLE, "", ERROR_RESET_DELAY);
    }
}

function injectReplyButton() {
    addButtonStyles();

    const composeBox = findComposeBox();
    if (!composeBox) {
        console.log("Compose box not found");
        return;
    }

    if (composeBox.querySelector(".ai-reply-button")) {
        return;
    }

    console.log("Compose box found. Injecting AI button...");

    const aiButton = createReplyButton();
    const statusElement = createStatusElement();

    aiButton.addEventListener("click", async () => {
        if (currentState === AI_STATE.GENERATING) {
            return;
        }

        console.log("AI Reply button clicked");
        await generateAIReply(composeBox, aiButton, statusElement);
    });

    const toolbar = composeBox.querySelector(".btC");
    (toolbar || composeBox).append(aiButton, statusElement);
    console.log("AI Reply button injected successfully");
}

const observer = new MutationObserver((mutations) => {
    const shouldCheck = mutations.some((mutation) => {
        if (mutation.type !== "childList") {
            return false;
        }

        return Array.from(mutation.addedNodes).some((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return false;
            }

            return node.matches?.(".aDh, .btC, [role='dialog']") ||
                node.querySelector?.(".aDh, .btC, [role='dialog']");
        });
    });

    if (shouldCheck) {
        setTimeout(injectReplyButton, 500);
    }
});

observer.observe(document.body, { childList: true, subtree: true });
setTimeout(injectReplyButton, 1000);
