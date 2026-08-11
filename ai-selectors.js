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

const AI_REPLY_API_ENDPOINT =
    "http://localhost:8080/api/v1/mail/gen-mail";

const AI_SUMMARIZE_API_ENDPOINT =
    "http://localhost:8080/api/v1/mail/mail-summary";

const BUTTON_RESET_DELAY = 2000;
const ERROR_RESET_DELAY = 3000;

function findComposeBox() {
    for (const selector of COMPOSE_SELECTORS) {
        const composeBox =
            document.querySelector(selector);

        if (composeBox) {
            return composeBox;
        }
    }

    return null;
}

function getEmailContent() {
    for (const selector of EMAIL_CONTENT_SELECTORS) {
        const emailElements =
            document.querySelectorAll(selector);

        if (!emailElements.length) {
            continue;
        }

        for (let i = emailElements.length - 1; i >= 0; i--) {
            const element = emailElements[i];

            if (!element.offsetParent) {
                continue;
            }

            const content =
                element.innerText?.trim();

            if (content) {
                console.log(
                    "Email content found:",
                    content
                );

                return content;
            }
        }
    }

    console.log("Email content not found");

    return null;
}

function createReplyButton() {
    const button =
        document.createElement("button");

    button.type = "button";
    button.className = "ai-reply-button";
    button.title = "Generate AI Reply";
    button.innerHTML = `
        <span class="ai-icon">✦</span>
        <span class="ai-button-text">AI Reply</span>
    `;

    return button;
}

function createSummarizeButton() {
    const button =
        document.createElement("button");

    button.type = "button";
    button.className = "G-Ni J-J5-Ji";
    button.classList.add("ai-summarize-button");
    button.setAttribute(
        "aria-label",
        "Summarize email"
    );
    button.title = "Summarize this email";
    button.innerHTML = `
        <span class="summarize-icon">✦</span>
        <span class="summarize-text">Summarize</span>
        
        `;
    

    return button;
}

function createStatusElement() {
    const status =
        document.createElement("span");

    status.className = "ai-status";

    return status;
}

function findMessageContainers() {
    // Each .adn.ads is one full message block (works for single or expanded thread view)
    const messages = Array.from(document.querySelectorAll('.adn.ads'));
    console.log("Found message containers:", messages);
    return messages;
}
