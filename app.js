// API Configuration
const API_BASE_URL = 'https://staging.aone1.ai';

// State management
let currentEmail = '';
let currentGrantId = '';
let isProcessing = false;

// Check if we're on the connected page on load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const grantId = urlParams.get('grant_id');
    
    if (window.location.pathname === '/connected' || window.location.pathname === '/connected.html') {
        handleConnectedPage(grantId);
    }
});

// Mock data for deals (fallback, will be replaced with real API data)
const mockDeals = [
    {
        id: 1,
        merchant: "Amazon",
        category: "retail",
        title: "20% off Electronics",
        description: "Get 20% off on electronics over $100. Valid on select items.",
        code: "TECH20OFF",
        value: "$20-$200",
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        discount: "20%"
    },
    {
        id: 2,
        merchant: "Uber Eats",
        category: "food",
        title: "$15 off your next order",
        description: "Enjoy $15 off orders over $30. Limited time offer!",
        code: "FEAST15",
        value: "$15",
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        discount: "$15"
    },
    {
        id: 3,
        merchant: "Nike",
        category: "retail",
        title: "30% off Sitewide",
        description: "Get 30% off your entire purchase. Exclusions apply.",
        code: "JUSTDOIT30",
        value: "$30-$150",
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        discount: "30%"
    },
    {
        id: 4,
        merchant: "Airbnb",
        category: "travel",
        title: "$50 off your booking",
        description: "Save $50 on bookings over $200. Perfect for your next getaway!",
        code: "TRAVEL50",
        value: "$50",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        discount: "$50"
    },
    {
        id: 5,
        merchant: "Starbucks",
        category: "food",
        title: "Buy 1 Get 1 Free",
        description: "Buy any grande or larger beverage and get one free.",
        code: "BOGO2024",
        value: "$5-$8",
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        discount: "BOGO"
    },
    {
        id: 6,
        merchant: "Spotify",
        category: "services",
        title: "3 Months Premium for Free",
        description: "Try Spotify Premium free for 3 months. Cancel anytime.",
        code: "PREMIUM3M",
        value: "$30",
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        discount: "3 months free"
    },
    {
        id: 7,
        merchant: "Target",
        category: "retail",
        title: "$10 off $50 Purchase",
        description: "Save $10 when you spend $50 or more on household items.",
        code: "TARGET10",
        value: "$10",
        expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        discount: "$10"
    },
    {
        id: 8,
        merchant: "DoorDash",
        category: "food",
        title: "Free Delivery",
        description: "Get free delivery on your next 3 orders. No minimum.",
        code: "FREEDEL3",
        value: "$15-$21",
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        discount: "Free delivery"
    },
    {
        id: 9,
        merchant: "Sephora",
        category: "retail",
        title: "25% off Beauty Products",
        description: "Treat yourself with 25% off all beauty and skincare products.",
        code: "BEAUTY25",
        value: "$25-$100",
        expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        discount: "25%"
    },
    {
        id: 10,
        merchant: "Hotels.com",
        category: "travel",
        title: "20% off Hotel Stays",
        description: "Save 20% on your next hotel booking anywhere in the world.",
        code: "HOTEL20",
        value: "$40-$200",
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        discount: "20%"
    },
    {
        id: 11,
        merchant: "Grammarly",
        category: "services",
        title: "40% off Premium Annual",
        description: "Get 40% off Grammarly Premium annual subscription.",
        code: "WRITE40",
        value: "$72",
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        discount: "40%"
    },
    {
        id: 12,
        merchant: "Chipotle",
        category: "food",
        title: "Free Guacamole",
        description: "Add free guacamole to any entrée with this code.",
        code: "GUAC2024",
        value: "$2.50",
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        discount: "Free guac"
    }
];

let currentFilter = 'all';
let allDeals = [];

// Page elements
const pages = {
    landing: document.getElementById('landing-page'),
    loading: document.getElementById('loading-page'),
    results: document.getElementById('results-page')
};

// Form handling
document.getElementById('email-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (isProcessing) return;
    isProcessing = true;
    
    const emailInput = document.getElementById('email-input');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    currentEmail = emailInput.value;
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Connecting...';
    submitBtn.classList.add('loading');
    
    try {
        // Call Nylas auth API
        const redirectUrl = `${window.location.origin}/connected.html`;
        const response = await fetch(`${API_BASE_URL}/api/nylas/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                provider: 'google',
                redirect: redirectUrl,
                email: currentEmail
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to initiate authentication');
        }
        
        const data = await response.json();
        
        if (data.authUrl) {
            // Redirect to Nylas OAuth
            window.location.href = data.authUrl;
        } else {
            throw new Error('No auth URL received');
        }
    } catch (error) {
        console.error('Authentication error:', error);
        showError('Failed to connect. Please try again.');
        
        // Re-enable button
        submitBtn.disabled = false;
        btnText.textContent = originalText;
        submitBtn.classList.remove('loading');
        isProcessing = false;
    }
});

// Logout/change email
document.getElementById('logout-btn').addEventListener('click', () => {
    currentEmail = '';
    currentGrantId = '';
    allDeals = [];
    isProcessing = false;
    window.location.href = '/';
});

// Handle connected page
async function handleConnectedPage(grantId) {
    if (!grantId) {
        showConnectionFailed();
        return;
    }
    
    currentGrantId = grantId;
    
    // Show loading page
    showPage('loading');
    updateLoadingText('Connection successful!');
    await sleep(500);
    
    try {
        // Trigger backfill
        updateLoadingText('Scanning your inbox for deals...');
        
        // Calculate date range (last 90 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        
        const backfillResponse = await fetch(`${API_BASE_URL}/admin/backfill`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: grantId,
                tenant_id: '00000000-0000-0000-0000-000000000000',
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                batch_size: 50
            })
        });
        
        if (!backfillResponse.ok) {
            throw new Error('Failed to start backfill');
        }
        
        // Poll for promotions to fill
        updateLoadingText('Analyzing promotions...');
        await pollPromotions(grantId);
        
        // Load promos
        updateLoadingText('Loading your deals...');
        await loadPromos(grantId);
        
    } catch (error) {
        console.error('Error loading promos:', error);
        showError('Failed to load your deals. Please try again.');
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    }
}

async function pollPromotions(userId, maxAttempts = 60) {
    let previousCount = 0;
    let stableCount = 0;
    
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/artifacts/promotions`);
            if (response.ok) {
                const data = await response.json();
                const currentCount = Array.isArray(data) ? data.length : (data.promotions ? data.promotions.length : 0);
                
                // Check if count has stabilized
                if (currentCount === previousCount && currentCount > 0) {
                    stableCount++;
                    // If count is stable for 3 consecutive checks, we're done
                    if (stableCount >= 3) {
                        return;
                    }
                } else {
                    stableCount = 0;
                }
                
                previousCount = currentCount;
                
                // Update loading text with progress
                if (currentCount > 0) {
                    updateLoadingText(`Found ${currentCount} promotions...`);
                }
            }
        } catch (error) {
            console.warn('Poll attempt failed:', error);
        }
        await sleep(3000); // Wait 3 seconds between polls
    }
}

async function loadPromos(userId) {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/artifacts/promotions`);
    
    if (!response.ok) {
        throw new Error('Failed to load promos');
    }
    
    const data = await response.json();
    const promos = Array.isArray(data) ? data : (data.promotions || []);
    
    // Transform API data to our format
    allDeals = promos.map((promo, index) => ({
        id: promo.id || index,
        merchant: promo.brand || promo.merchant || 'Unknown',
        category: categorizePromo(promo),
        title: promo.subject || promo.title || 'Special Offer',
        description: promo.description || extractDescription(promo),
        code: promo.code || promo.couponCode || 'N/A',
        value: promo.discount || 'See Details',
        expiryDate: promo.expiry ? new Date(promo.expiry) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        discount: promo.discount || 'Special offer',
        ctaLink: promo.ctaLink || promo.link || '#'
    }));
    
    // If no promos found, show message
    if (allDeals.length === 0) {
        allDeals = [];
    }
    
    // Display results
    displayResults();
    showPage('results');
}

function categorizePromo(promo) {
    const brand = (promo.brand || promo.merchant || '').toLowerCase();
    const subject = (promo.subject || '').toLowerCase();
    const text = `${brand} ${subject}`;
    
    if (text.match(/travel|hotel|flight|airbnb|booking/)) return 'travel';
    if (text.match(/food|restaurant|uber eats|doordash|grubhub|delivery/)) return 'food';
    if (text.match(/amazon|target|walmart|shop|store|retail/)) return 'retail';
    return 'services';
}

function extractDescription(promo) {
    if (promo.description) return promo.description;
    if (promo.subject) return promo.subject;
    return 'Exclusive offer just for you';
}

function showConnectionFailed() {
    const landingPage = document.getElementById('landing-page');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'connection-error';
    errorDiv.innerHTML = `
        <h2>Connection Failed</h2>
        <p>We couldn't connect your email account. Please try again.</p>
        <button onclick="window.location.href='/'" class="btn-primary">Try Again</button>
    `;
    landingPage.innerHTML = '';
    landingPage.appendChild(errorDiv);
    showPage('landing');
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function updateLoadingText(text) {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

// Filter handling
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Apply filter
        currentFilter = btn.dataset.filter;
        displayDeals();
    });
});

// Helper functions
function showPage(pageName) {
    Object.values(pages).forEach(page => page.classList.remove('active'));
    pages[pageName].classList.add('active');
}

async function simulateLoading() {
    const loadingText = document.getElementById('loading-text');
    const progressFill = document.getElementById('progress-fill');
    
    const steps = [
        { text: 'Connecting to your email...', progress: 20 },
        { text: 'Scanning inbox for deals...', progress: 40 },
        { text: 'Analyzing promotions...', progress: 60 },
        { text: 'Filtering expired coupons...', progress: 80 },
        { text: 'Organizing your deals...', progress: 100 }
    ];
    
    for (const step of steps) {
        loadingText.textContent = step.text;
        progressFill.style.width = step.progress + '%';
        await sleep(600);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function displayResults() {
    // Update user email
    document.getElementById('user-email').textContent = currentEmail;
    
    // Update summary
    updateSummary();
    
    // Display deals
    displayDeals();
}

function updateSummary() {
    const totalDeals = allDeals.length;
    const totalSavings = calculateTotalSavings();
    const expiringSoon = allDeals.filter(deal => getDaysUntilExpiry(deal.expiryDate) <= 7).length;
    
    document.getElementById('total-deals').textContent = totalDeals;
    document.getElementById('total-savings').textContent = totalSavings;
    document.getElementById('expiring-soon').textContent = expiringSoon;
}

function calculateTotalSavings() {
    // Simple estimation based on average values
    const total = allDeals.reduce((sum, deal) => {
        const value = deal.value.replace(/[^0-9-]/g, '');
        const numbers = value.split('-').map(n => parseInt(n));
        const avg = numbers.length > 1 ? (numbers[0] + numbers[1]) / 2 : numbers[0];
        return sum + (avg || 0);
    }, 0);
    
    return '$' + Math.round(total);
}

function displayDeals() {
    const container = document.getElementById('deals-container');
    const noDealsDiv = document.getElementById('no-deals');
    
    // Filter deals
    let filteredDeals = allDeals;
    
    if (currentFilter !== 'all') {
        if (currentFilter === 'expiring') {
            filteredDeals = allDeals.filter(deal => getDaysUntilExpiry(deal.expiryDate) <= 7);
        } else {
            filteredDeals = allDeals.filter(deal => deal.category === currentFilter);
        }
    }
    
    // Show/hide no deals message
    if (filteredDeals.length === 0) {
        container.style.display = 'none';
        noDealsDiv.style.display = 'block';
        return;
    } else {
        container.style.display = 'grid';
        noDealsDiv.style.display = 'none';
    }
    
    // Render deals
    container.innerHTML = filteredDeals.map(deal => createDealCard(deal)).join('');
    
    // Add click handlers for codes
    document.querySelectorAll('.deal-code').forEach(codeEl => {
        codeEl.addEventListener('click', () => {
            const code = codeEl.dataset.code || codeEl.textContent.trim();
            navigator.clipboard.writeText(code).then(() => {
                showCopiedNotification();
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        });
    });
}

function createDealCard(deal) {
    const daysUntilExpiry = getDaysUntilExpiry(deal.expiryDate);
    const isExpiringSoon = daysUntilExpiry <= 7;
    const expiryClass = daysUntilExpiry <= 3 ? 'danger' : (daysUntilExpiry <= 7 ? 'warning' : '');
    const hasCode = deal.code && deal.code !== 'N/A';
    const hasLink = deal.ctaLink && deal.ctaLink !== '#';
    
    return `
        <div class="deal-card ${isExpiringSoon ? 'expiring-soon' : ''}">
            ${isExpiringSoon ? `
                <div class="expiring-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    Expiring Soon
                </div>
            ` : ''}
            <div class="deal-header">
                <div class="deal-merchant">${deal.merchant}</div>
                <span class="deal-category">
                    ${getCategoryIcon(deal.category)}
                    ${formatCategory(deal.category)}
                </span>
            </div>
            <div class="deal-body">
                <div class="deal-title">${deal.title}</div>
                <div class="deal-description">${deal.description}</div>
                <div class="deal-details">
                    <div class="deal-detail">
                        <svg class="deal-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Save: ${deal.discount}</span>
                    </div>
                    <div class="deal-detail">
                        <svg class="deal-detail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}</span>
                    </div>
                </div>
                ${hasCode ? `
                    <div class="deal-code" title="Click to copy" data-code="${deal.code}">
                        <svg class="code-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        ${deal.code}
                    </div>
                ` : ''}
                ${hasLink ? `
                    <a href="${deal.ctaLink}" target="_blank" rel="noopener noreferrer" class="deal-cta">
                        View Deal
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                ` : ''}
            </div>
            <div class="deal-footer">
                <div class="deal-expiry ${expiryClass}">
                    ${formatExpiryDate(deal.expiryDate)}
                </div>
                <div class="deal-value">${deal.value}</div>
            </div>
        </div>
    `;
}

function getDaysUntilExpiry(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}

function formatExpiryDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatCategory(category) {
    const categories = {
        retail: 'Retail',
        food: 'Food & Dining',
        travel: 'Travel',
        services: 'Services'
    };
    return categories[category] || category;
}

function getCategoryIcon(category) {
    const icons = {
        retail: '<svg class="category-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
        food: '<svg class="category-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
        travel: '<svg class="category-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>',
        services: '<svg class="category-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m9.22-15.22l-4.24 4.24m-5.96 5.96l-4.24 4.24M23 12h-6m-6 0H1m20.22 9.22l-4.24-4.24m-5.96-5.96l-4.24-4.24"></path></svg>'
    };
    return icons[category] || '';
}

function showCopiedNotification() {
    const notification = document.createElement('div');
    notification.className = 'copied-notification';
    notification.textContent = 'Code copied to clipboard!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
console.log('My Hidden Deals - Ready to discover your savings!');

