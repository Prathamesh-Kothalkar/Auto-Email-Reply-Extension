const observer =
    new MutationObserver(
        (mutations) => {
            const shouldCheck =
                mutations.some(
                    (mutation) => {
                        if (
                            mutation.type !==
                            'childList'
                        ) {
                            return false;
                        }

                        return Array.from(
                            mutation.addedNodes
                        ).some(
                            (node) => {
                                if (
                                    node.nodeType !==
                                    Node.ELEMENT_NODE
                                ) {
                                    return false;
                                }

                                return (
                                    node.matches?.('.aDh, .btC, [role="dialog"], [role="toolbar"], [gh="tm"]') ||
                                    node.querySelector?.('.aDh, .btC, [role="dialog"], [role="toolbar"], [gh="tm"]')
                                );
                            }
                        );
                    }
                );

            if (!shouldCheck) {
                return;
            }

            setTimeout(() => {
                injectReplyButton();
                injectSummarizeButtons();
            }, 500);
        }
    );

observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);

setTimeout(() => {
    console.log(
        'Running initial button injection...'
    );

    injectReplyButton();
     injectSummarizeButtons()
}, 300);
