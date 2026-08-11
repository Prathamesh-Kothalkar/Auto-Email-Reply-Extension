async function generateAIReply(
    composeBox,
    aiButton,
    statusElement
) {
    const emailContent =
        getEmailContent();

    if (!emailContent) {
        setReplyButtonState(
            aiButton,
            AI_STATE.ERROR
        );

        setStatus(
            statusElement,
            "error",
            "Email content not found"
        );

        resetReplyUIAfterDelay(
            aiButton,
            statusElement,
            ERROR_RESET_DELAY
        );

        return;
    }

    setReplyButtonState(
        aiButton,
        AI_STATE.GENERATING
    );

    setStatus(
        statusElement,
        "generating",
        "Generating AI reply..."
    );

    try {
        console.log(
            "Sending email to AI service..."
        );

        const generatedText =
            await fetchAiReply(
                emailContent
            );

        if (
            !insertGeneratedEmail(
                composeBox,
                generatedText
            )
        ) {
            throw new Error(
                "Could not find Gmail compose textbox"
            );
        }

        setReplyButtonState(
            aiButton,
            AI_STATE.SUCCESS
        );

        setStatus(
            statusElement,
            "success",
            "Reply generated"
        );

        resetReplyUIAfterDelay(
            aiButton,
            statusElement,
            BUTTON_RESET_DELAY
        );
    } catch (error) {
        console.error(
            "AI Reply Error:",
            error
        );

        setReplyButtonState(
            aiButton,
            AI_STATE.ERROR
        );

        setStatus(
            statusElement,
            "error",
            "Failed to generate reply"
        );

        resetReplyUIAfterDelay(
            aiButton,
            statusElement,
            ERROR_RESET_DELAY
        );
    }
}

async function summarizeEmail(summarizeButton) {
    if (currentSummarizeState === AI_STATE.GENERATING) {
        return;
    }

    const emailContent = getEmailContent();

    if (!emailContent) {
        console.error("Cannot summarize: email content not found");
        return;
    }

    currentSummarizeState = AI_STATE.GENERATING;
    summarizeButton.disabled = true;

    const icon = summarizeButton.querySelector(".summarize-icon");
    const text = summarizeButton.querySelector(".summarize-text");

    icon.innerHTML = `<span class="ai-spinner"></span>`;
    text.textContent = "Summarizing...";

    showSummary("Generating summary...");

    try {
        const summary = await fetchEmailSummary(emailContent);

        currentSummarizeState = AI_STATE.SUCCESS;
        icon.textContent = "✓";
        text.textContent = "Summarized";

        showSummary(summary);

        setTimeout(() => {
            if (document.body.contains(summarizeButton)) {
                icon.textContent = "✦";
                text.textContent = "Summarize";
            }
            currentSummarizeState = AI_STATE.IDLE;
        }, BUTTON_RESET_DELAY);
    } catch (error) {
        console.error("Summarization Error:", error);

        currentSummarizeState = AI_STATE.ERROR;
        icon.textContent = "!";
        text.textContent = "Try Again";

        setTimeout(() => {
            if (document.body.contains(summarizeButton)) {
                icon.textContent = "✦";
                text.textContent = "Summarize";
            }
            currentSummarizeState = AI_STATE.IDLE;
        }, ERROR_RESET_DELAY);
    } finally {
        summarizeButton.disabled = false;
    }
}



function injectReplyButton() {
    addButtonStyles();

    const composeBox =
        findComposeBox();

    if (!composeBox) {
        return;
    }

    if (
        composeBox.querySelector(
            ".ai-reply-button"
        )
    ) {
        return;
    }

    console.log(
        "Compose box found. Injecting AI Reply button..."
    );

    const aiButton =
        createReplyButton();
    const statusElement =
        createStatusElement();

    aiButton.addEventListener(
        "click",
        async () => {
            if (
                currentReplyState ===
                AI_STATE.GENERATING
            ) {
                return;
            }

            console.log(
                "AI Reply button clicked"
            );

            await generateAIReply(
                composeBox,
                aiButton,
                statusElement
            );
        }
    );

    const toolbar =
        composeBox.querySelector(
            ".btC"
        );

    if (toolbar) {
        toolbar.append(
            aiButton,
            statusElement
        );
    } else {
        composeBox.append(
            aiButton,
            statusElement
        );
    }

    console.log(
        "AI Reply button injected successfully"
    );
}

function injectSummarizeButtons() {
    addButtonStyles();

    const messages = findMessageContainers();

    if (!messages.length) {
        console.log("No message containers found");
        return;
    }

    messages.forEach((messageEl) => {
        // Skip if already injected for this message
        if (messageEl.querySelector(".ai-summarize-button")) {
            return;
        }

        const subjectEl = document.querySelector("h2.hP"); // subject is thread-level, not per-message
        const bodyEl = messageEl.querySelector(".a3s.aiL"); // message content

        const summarizeButton = createSummarizeButton();
        if (!summarizeButton) {
            console.error("Failed to create summarize button");
            return;
        }

        summarizeButton.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            try {
                summarizeButton.disabled = true;
                await summarizeEmail(summarizeButton, bodyEl);
            } catch (error) {
                console.error("Summarize email failed:", error);
            } finally {
                summarizeButton.disabled = false;
            }
        });

        // Insert directly below the subject, once per thread
        if (subjectEl && !document.querySelector(".ai-summarize-button .subject-btn")) {
            summarizeButton.classList.add("subject-btn");
            subjectEl.insertAdjacentElement("afterend", summarizeButton);
        }

        // Optional: also insert a button right after the message body
        if (bodyEl) {
            const bodyButton = summarizeButton.cloneNode(true);
            bodyEl.insertAdjacentElement("afterend", bodyButton);
        }
    });

    console.log("Summarize buttons injected successfully");
}