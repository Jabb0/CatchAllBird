const EMAIL_IN_RECIPIENT_REGEXP = /<?([a-zA-Z-_.+0-9]+?@[a-zA-Z0-9-_.+]+?)>?$/;

export function getPrefixFromMessage(domain, recipients, ccList, bccList) {
    const emailIsFromCatchAll = recipient => recipient.toLowerCase().endsWith(domain.toLowerCase());

    // Order matters
    // Make sure this message should not be in two <prefix> accounts. If so prefer recipients (TO) over CC and BCC.
    // NOTE: Seems like bccList is always empty for incoming messages.
    const possibleFields = [
        recipients,
        ccList,
        bccList
    ]

    // The fields do not need to include the email address only.
    // Usually it is "prefix@domain.tld" or "Name <prefix@domain.tld>"
    // I don't see an option to get the email part only
    // Thus we need to parse these two formats

    for (const field of possibleFields) {
        const ownAddresses = field.map(address => {
            const match = EMAIL_IN_RECIPIENT_REGEXP.exec(address);
            return match !== null ? match[1] : null;
        }).filter(match => !!match && emailIsFromCatchAll(match));
        if (ownAddresses.length > 0) {
            return prefixFromEmail(ownAddresses[0], domain);
        }
    }
    return null;
}


export function prefixFromEmail(email, domain) {
    return email.slice(0, -(domain.length + 1)).toLowerCase();
}