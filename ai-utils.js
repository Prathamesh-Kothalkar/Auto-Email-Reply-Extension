function setReplyButtonState(button, state) {
    currentReplyState = state;

    const icon =
        button.querySelector(".ai-icon");
    const text =
        button.querySelector(".ai-button-text");

    if (!icon || !text) {
        return;
    }

    button.disabled =
        state === AI_STATE.GENERATING;

    button.title =
        state === AI_STATE.GENERATING
            ? "Generating AI reply"
            : "Generate AI Reply";

    switch (state) {
        case AI_STATE.IDLE:
            icon.textContent = "✦";
            text.textContent = "AI Reply";
            break;

        case AI_STATE.GENERATING:
            icon.innerHTML =
                `<span class="ai-spinner"></span>`;
            text.textContent =
                "Generating...";
            break;

        case AI_STATE.SUCCESS:
            icon.textContent = "✓";
            text.textContent = "Generated";
            break;

        case AI_STATE.ERROR:
            icon.textContent = "!";
            text.textContent = "Try Again";
            button.title =
                "Try generating again";
            break;
    }
}

function setStatus(statusElement, state, message) {
    statusElement.className =
        `ai-status ${state}`;
    statusElement.textContent =
        message;
}

function resetReplyUIAfterDelay(button, statusElement, delay) {
    setTimeout(() => {
        if (!document.body.contains(button)) {
            return;
        }

        setReplyButtonState(
            button,
            AI_STATE.IDLE
        );

        setStatus(
            statusElement,
            "",
            ""
        );
    }, delay);
}

function insertGeneratedEmail(composeBox, generatedText) {
    console.log(
        "Inserting generated email...",
        generatedText
    );

    let composeTextArea =
        composeBox.querySelector(
            COMPOSE_TEXTBOX_SELECTOR
        );

    if (!composeTextArea) {
        composeTextArea =
            document.querySelector(
                COMPOSE_TEXTBOX_SELECTOR
            );
    }

    if (!composeTextArea) {
        console.error(
            "Gmail compose textbox not found"
        );
        return false;
    }

    composeTextArea.focus();

    document.execCommand(
        "insertText",
        false,
        generatedText
    );

    composeTextArea.dispatchEvent(
        new InputEvent(
            "input",
            {
                bubbles: true,
                inputType: "insertText",
                data: generatedText
            }
        )
    );

    console.log(
        "AI response inserted into Gmail compose box"
    );

    return true;
}

function escapeHtml(text) {
    const div =
        document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function showSummary(summary) {
    const existing =
        document.querySelector(
            ".ai-summary-popup"
        );

    if (existing) {
        existing.remove();
    }

    const popup =
        document.createElement("div");
    popup.className =
        "ai-summary-popup";

    popup.innerHTML = `
        <div class="ai-summary-header">
            <div class="ai-summary-title">
                <span
                    style="
                        color:#1a73e8;
                        font-size:18px;
                    "
                >
                    ✦
                </span>
                <span>
                    Email Summary
                </span>
            </div>
            <button
                class="ai-summary-close"
                type="button"
                aria-label="Close summary"
            >
                ×
            </button>
        </div>
        <div class="ai-summary-content">
            ${escapeHtml(summary)}
        </div>
    `;

    document.body.appendChild(
        popup
    );

    const closeButton =
        popup.querySelector(
            ".ai-summary-close"
        );

    closeButton.addEventListener(
        "click",
        () => {
            popup.remove();
        }
    );
}
