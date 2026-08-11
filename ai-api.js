async function fetchAiReply(emailContent) {
    const response =
        await fetch(
            AI_REPLY_API_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    email: emailContent,
                    type: "professional"
                })
            }
        );

    if (!response.ok) {
        throw new Error(
            `HTTP error: ${response.status}`
        );
    }

    const generatedText =
        await response.text();

    if (!generatedText?.trim()) {
        throw new Error(
            "AI service returned an empty response"
        );
    }

    return generatedText;
}

async function fetchEmailSummary(emailContent) {
    const response =
        await fetch(
            AI_SUMMARIZE_API_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    email: emailContent
                })
            }
        );

    if (!response.ok) {
        throw new Error(
            `HTTP error: ${response.status}`
        );
    }

    const summary =
        await response.text();

    if (!summary?.trim()) {
        throw new Error(
            "AI service returned empty summary"
        );
    }

    return summary;
}
