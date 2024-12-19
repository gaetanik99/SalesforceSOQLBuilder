// Handle Salesforce OAuth flow
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SF_AUTH') {
        initiateSalesforceAuth();
    } else if (request.type === 'SF_QUERY') {
        executeSalesforceQuery(request.query)
            .then(result => sendResponse({ success: true, data: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Required for async response
    }
});

// Salesforce OAuth configuration
const SF_CONFIG = {
    clientId: '', // To be filled by user
    redirectUri: chrome.identity.getRedirectURL('oauth2'),
    scope: 'api web refresh_token',
    loginUrl: 'https://login.salesforce.com'
};

async function initiateSalesforceAuth() {
    const authUrl = `${SF_CONFIG.loginUrl}/services/oauth2/authorize?` +
        `client_id=${SF_CONFIG.clientId}&` +
        `redirect_uri=${encodeURIComponent(SF_CONFIG.redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(SF_CONFIG.scope)}`;

    try {
        const redirectUrl = await chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        });

        const params = new URLSearchParams(redirectUrl.split('#')[1]);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            await chrome.storage.local.set({ 
                sfAccessToken: accessToken,
                tokenTimestamp: Date.now()
            });
            return { success: true };
        }
    } catch (error) {
        console.error('Auth error:', error);
        return { success: false, error: error.message };
    }
}

async function executeSalesforceQuery(query) {
    const token = await getValidAccessToken();
    if (!token) {
        throw new Error('No valid access token');
    }

    const instance = await getSalesforceInstance();
    const response = await fetch(`${instance}/services/data/v57.0/query?q=${encodeURIComponent(query)}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.statusText}`);
    }

    return await response.json();
}

async function getValidAccessToken() {
    const { sfAccessToken, tokenTimestamp } = await chrome.storage.local.get(['sfAccessToken', 'tokenTimestamp']);
    
    if (!sfAccessToken) return null;
    
    // Check if token is expired (tokens typically last 2 hours)
    const tokenAge = Date.now() - (tokenTimestamp || 0);
    if (tokenAge > 7200000) { // 2 hours in milliseconds
        await initiateSalesforceAuth();
        const { sfAccessToken: newToken } = await chrome.storage.local.get('sfAccessToken');
        return newToken;
    }
    
    return sfAccessToken;
}

async function getSalesforceInstance() {
    const { sfInstance } = await chrome.storage.local.get('sfInstance');
    return sfInstance || 'https://na1.salesforce.com';
}
