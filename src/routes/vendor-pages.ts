// Vendor Portal Pages

import { Hono } from 'hono'
import { getVendorLayout } from '../lib/vendor-layout'
import type { Bindings } from '../types'

const vendorPages = new Hono<{ Bindings: Bindings }>()

// Vendor Dashboard
vendorPages.get('/dashboard', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
        <p class="text-gray-600">Welcome to your vendor portal. Manage RFQs, bids, and orders.</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-2">
                <div class="text-sm font-medium text-gray-600">Available RFQs</div>
                <i class="fas fa-clipboard-list text-blue-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-gray-900" id="stat-available">0</div>
            <div class="text-xs text-gray-500 mt-1">Open for bidding</div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-2">
                <div class="text-sm font-medium text-gray-600">My Bids</div>
                <i class="fas fa-file-invoice text-purple-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-gray-900" id="stat-bids">0</div>
            <div class="text-xs text-gray-500 mt-1">Total submitted</div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-2">
                <div class="text-sm font-medium text-gray-600">Won Bids</div>
                <i class="fas fa-trophy text-green-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-gray-900" id="stat-won">0</div>
            <div class="text-xs text-green-600 mt-1">Accepted</div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-2">
                <div class="text-sm font-medium text-gray-600">Revenue</div>
                <i class="fas fa-dollar-sign text-yellow-600 text-xl"></i>
            </div>
            <div class="text-3xl font-bold text-gray-900" id="stat-revenue">EGP 0</div>
            <div class="text-xs text-gray-500 mt-1">This month</div>
        </div>
    </div>

    <!-- Recent RFQs -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">
                <i class="fas fa-clipboard-list mr-2 text-blue-600"></i>
                Recent RFQs Available for Bidding
            </h2>
            <a href="/vendor/rfqs" class="text-sm text-purple-600 hover:text-purple-800 font-medium">
                View All <i class="fas fa-arrow-right ml-1"></i>
            </a>
        </div>
        <div id="recent-rfqs" class="space-y-3">
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                <p>Loading RFQs...</p>
            </div>
        </div>
    </div>

    <!-- Recent Bids -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900">
                <i class="fas fa-file-invoice mr-2 text-purple-600"></i>
                My Recent Bids
            </h2>
            <a href="/vendor/bids" class="text-sm text-purple-600 hover:text-purple-800 font-medium">
                View All <i class="fas fa-arrow-right ml-1"></i>
            </a>
        </div>
        <div id="recent-bids" class="space-y-3">
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                <p>Loading bids...</p>
            </div>
        </div>
    </div>

    <script>
        async function loadDashboardData() {
            try {
                // Load available RFQs
                const rfqsRes = await apiCall('/api/bids/rfqs?limit=5');
                if (rfqsRes.success) {
                    document.getElementById('stat-available').textContent = rfqsRes.data.pagination.total;
                    displayRecentRFQs(rfqsRes.data.rfqs);
                }

                // Load my bids
                const bidsRes = await apiCall('/api/bids?limit=5');
                if (bidsRes.success) {
                    document.getElementById('stat-bids').textContent = bidsRes.data.pagination.total;
                    displayRecentBids(bidsRes.data.bids);
                    
                    // Count won bids
                    const wonCount = bidsRes.data.bids.filter(b => b.status === 'accepted').length;
                    document.getElementById('stat-won').textContent = wonCount;
                }
            } catch (error) {
                console.error('Dashboard load error:', error);
            }
        }

        function displayRecentRFQs(rfqs) {
            const container = document.getElementById('recent-rfqs');
            if (!rfqs || rfqs.length === 0) {
                container.innerHTML = '<div class="text-center py-8 text-gray-400"><i class="fas fa-inbox text-3xl mb-2"></i><p>No RFQs available</p></div>';
                return;
            }

            container.innerHTML = rfqs.map(rfq => \`
                <div class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <span class="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">\${rfq.rfq_number}</span>
                                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded capitalize">\${rfq.status}</span>
                            </div>
                            <h3 class="font-semibold text-gray-900 mb-1">\${rfq.title}</h3>
                            <p class="text-sm text-gray-600 mb-2">\${rfq.description || 'No description'}</p>
                            <div class="flex items-center space-x-4 text-xs text-gray-500">
                                <span><i class="fas fa-boxes mr-1"></i>\${rfq.item_count} items</span>
                                <span><i class="fas fa-calendar mr-1"></i>\${new Date(rfq.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <a href="/vendor/rfqs/\${rfq.id}" class="ml-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-all">
                            <i class="fas fa-file-invoice mr-1"></i>Submit Bid
                        </a>
                    </div>
                </div>
            \`).join('');
        }

        function displayRecentBids(bids) {
            const container = document.getElementById('recent-bids');
            if (!bids || bids.length === 0) {
                container.innerHTML = '<div class="text-center py-8 text-gray-400"><i class="fas fa-inbox text-3xl mb-2"></i><p>No bids submitted yet</p></div>';
                return;
            }

            const statusColors = {
                pending: 'bg-yellow-100 text-yellow-800',
                accepted: 'bg-green-100 text-green-800',
                rejected: 'bg-red-100 text-red-800'
            };

            container.innerHTML = bids.map(bid => \`
                <div class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-all">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <span class="text-xs font-mono bg-purple-100 text-purple-800 px-2 py-1 rounded">\${bid.bid_number}</span>
                                <span class="text-xs \${statusColors[bid.status] || 'bg-gray-100 text-gray-800'} px-2 py-1 rounded capitalize">\${bid.status}</span>
                            </div>
                            <h3 class="font-semibold text-gray-900 mb-1">RFQ: \${bid.title || bid.rfq_number}</h3>
                            <div class="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                <span class="font-semibold">EGP \${Number(bid.total_amount).toLocaleString()}</span>
                                <span class="text-xs text-gray-500"><i class="fas fa-calendar mr-1"></i>\${new Date(bid.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <a href="/vendor/bids/\${bid.id}" class="ml-4 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all">
                            <i class="fas fa-eye mr-1"></i>View
                        </a>
                    </div>
                </div>
            \`).join('');
        }

        // Load data on page load
        loadDashboardData();
    </script>
  `
  
  return c.html(getVendorLayout(content, 'Vendor Dashboard'))
})

// Available RFQs for Bidding
vendorPages.get('/rfqs', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Available RFQs</h1>
        <p class="text-gray-600">Browse and submit bids for open RFQs</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center space-x-4">
            <div class="flex-1">
                <input type="text" id="search" placeholder="Search RFQs..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            </div>
            <button onclick="loadRFQs()" class="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all">
                <i class="fas fa-search mr-2"></i>Search
            </button>
        </div>
    </div>

    <!-- RFQs List -->
    <div id="rfqs-list" class="space-y-4">
        <div class="text-center py-12 text-gray-400">
            <i class="fas fa-spinner fa-spin text-4xl mb-3"></i>
            <p>Loading RFQs...</p>
        </div>
    </div>

    <!-- Pagination -->
    <div id="pagination" class="mt-6"></div>

    <script>
        let currentPage = 1;

        async function loadRFQs(page = 1) {
            try {
                currentPage = page;
                const search = document.getElementById('search').value;
                const res = await apiCall(\`/api/bids/rfqs?page=\${page}&limit=10\`);
                
                if (res.success) {
                    displayRFQs(res.data.rfqs);
                    displayPagination(res.data.pagination);
                } else {
                    showError(res.error || 'Failed to load RFQs');
                }
            } catch (error) {
                console.error('Load RFQs error:', error);
                showError('Failed to load RFQs');
            }
        }

        function displayRFQs(rfqs) {
            const container = document.getElementById('rfqs-list');
            if (!rfqs || rfqs.length === 0) {
                container.innerHTML = \`
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <i class="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No RFQs Available</h3>
                        <p class="text-gray-500">There are currently no open RFQs for bidding.</p>
                    </div>
                \`;
                return;
            }

            container.innerHTML = rfqs.map(rfq => \`
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-3">
                                <span class="text-sm font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">\${rfq.rfq_number}</span>
                                <span class="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-lg capitalize">\${rfq.status}</span>
                                <span class="text-sm text-gray-500"><i class="fas fa-boxes mr-1"></i>\${rfq.item_count} items</span>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 mb-2">\${rfq.title}</h3>
                            <p class="text-gray-600 mb-3">\${rfq.description || 'No description provided'}</p>
                            <div class="flex items-center space-x-6 text-sm text-gray-500">
                                <span><i class="fas fa-map-marker-alt mr-1"></i>\${rfq.delivery_address}</span>
                                <span><i class="fas fa-calendar mr-1"></i>Required: \${rfq.required_delivery_date ? new Date(rfq.required_delivery_date).toLocaleDateString() : 'Not specified'}</span>
                                <span><i class="fas fa-clock mr-1"></i>Posted \${new Date(rfq.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="ml-6">
                            <a href="/vendor/rfqs/\${rfq.id}" class="block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all text-center">
                                <i class="fas fa-file-invoice mr-2"></i>Submit Bid
                            </a>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        function displayPagination(pagination) {
            const container = document.getElementById('pagination');
            if (pagination.totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            let pages = '';
            for (let i = 1; i <= pagination.totalPages; i++) {
                const active = i === pagination.page ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100';
                pages += \`<button onclick="loadRFQs(\${i})" class="\${active} px-4 py-2 border border-gray-300 font-medium">\${i}</button>\`;
            }

            container.innerHTML = \`
                <div class="flex items-center justify-center space-x-1">
                    \${pages}
                </div>
            \`;
        }

        function showError(message) {
            document.getElementById('rfqs-list').innerHTML = \`
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <i class="fas fa-exclamation-circle text-red-600 text-3xl mb-2"></i>
                    <p class="text-red-800">\${message}</p>
                </div>
            \`;
        }

        // Load on page load
        loadRFQs();
    </script>
  `
  
  return c.html(getVendorLayout(content, 'Available RFQs'))
})

// My Bids
vendorPages.get('/bids', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">My Bids</h1>
        <p class="text-gray-600">Track all your submitted bids and their status</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center space-x-4">
            <select id="status-filter" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
            </select>
            <button onclick="loadBids()" class="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all">
                <i class="fas fa-filter mr-2"></i>Filter
            </button>
        </div>
    </div>

    <!-- Bids List -->
    <div id="bids-list" class="space-y-4">
        <div class="text-center py-12 text-gray-400">
            <i class="fas fa-spinner fa-spin text-4xl mb-3"></i>
            <p>Loading bids...</p>
        </div>
    </div>

    <!-- Pagination -->
    <div id="pagination" class="mt-6"></div>

    <script>
        async function loadBids(page = 1) {
            try {
                const status = document.getElementById('status-filter').value;
                const statusParam = status ? \`&status=\${status}\` : '';
                const res = await apiCall(\`/api/bids?page=\${page}&limit=10\${statusParam}\`);
                
                if (res.success) {
                    displayBids(res.data.bids);
                    displayPagination(res.data.pagination);
                } else {
                    showError(res.error || 'Failed to load bids');
                }
            } catch (error) {
                console.error('Load bids error:', error);
                showError('Failed to load bids');
            }
        }

        function displayBids(bids) {
            const container = document.getElementById('bids-list');
            if (!bids || bids.length === 0) {
                container.innerHTML = \`
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <i class="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Bids Yet</h3>
                        <p class="text-gray-500 mb-4">You haven't submitted any bids yet.</p>
                        <a href="/vendor/rfqs" class="inline-block px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700">
                            Browse RFQs
                        </a>
                    </div>
                \`;
                return;
            }

            const statusColors = {
                pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'fa-clock' },
                accepted: { bg: 'bg-green-100', text: 'text-green-800', icon: 'fa-check-circle' },
                rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: 'fa-times-circle' }
            };

            container.innerHTML = bids.map(bid => {
                const status = statusColors[bid.status] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'fa-question-circle' };
                return \`
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center space-x-3 mb-3">
                                    <span class="text-sm font-mono bg-purple-100 text-purple-800 px-3 py-1 rounded-lg">\${bid.bid_number}</span>
                                    <span class="text-sm \${status.bg} \${status.text} px-3 py-1 rounded-lg capitalize">
                                        <i class="fas \${status.icon} mr-1"></i>\${bid.status}
                                    </span>
                                    <span class="text-sm text-gray-500">RFQ: \${bid.rfq_number}</span>
                                </div>
                                <h3 class="text-xl font-bold text-gray-900 mb-2">\${bid.title || bid.rfq_number}</h3>
                                <div class="flex items-center space-x-6 text-sm mb-3">
                                    <span class="text-2xl font-bold text-purple-600">EGP \${Number(bid.total_amount).toLocaleString()}</span>
                                    <span class="text-gray-500"><i class="fas fa-calendar mr-1"></i>Submitted: \${new Date(bid.created_at).toLocaleDateString()}</span>
                                </div>
                                \${bid.notes ? \`<p class="text-sm text-gray-600"><i class="fas fa-sticky-note mr-1"></i>\${bid.notes}</p>\` : ''}
                            </div>
                            <div class="ml-6">
                                <a href="/vendor/bids/\${bid.id}" class="block px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all text-center">
                                    <i class="fas fa-eye mr-2"></i>View Details
                                </a>
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        function displayPagination(pagination) {
            const container = document.getElementById('pagination');
            if (pagination.totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            let pages = '';
            for (let i = 1; i <= pagination.totalPages; i++) {
                const active = i === pagination.page ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100';
                pages += \`<button onclick="loadBids(\${i})" class="\${active} px-4 py-2 border border-gray-300 font-medium">\${i}</button>\`;
            }

            container.innerHTML = \`
                <div class="flex items-center justify-center space-x-1">
                    \${pages}
                </div>
            \`;
        }

        function showError(message) {
            document.getElementById('bids-list').innerHTML = \`
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <i class="fas fa-exclamation-circle text-red-600 text-3xl mb-2"></i>
                    <p class="text-red-800">\${message}</p>
                </div>
            \`;
        }

        // Load on page load
        loadBids();
    </script>
  `
  
  return c.html(getVendorLayout(content, 'My Bids'))
})

export default vendorPages
