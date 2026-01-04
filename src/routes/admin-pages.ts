// Admin Portal Pages

import { Hono } from 'hono'
import { getAdminLayout } from '../lib/admin-layout'
import type { Bindings } from '../types'

const adminPages = new Hono<{ Bindings: Bindings }>()

// Admin Dashboard
adminPages.get('/dashboard', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p class="text-gray-600">Monitor platform activity and manage operations</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <!-- Users Stats -->
        <div class="stat-card bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <i class="fas fa-users text-3xl opacity-80"></i>
                <div class="text-right">
                    <div class="text-2xl font-bold" id="stat-buyers">0</div>
                    <div class="text-sm opacity-90">Buyers</div>
                </div>
            </div>
            <div class="text-xs opacity-75">Active companies</div>
        </div>

        <div class="stat-card bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <i class="fas fa-store text-3xl opacity-80"></i>
                <div class="text-right">
                    <div class="text-2xl font-bold" id="stat-vendors">0</div>
                    <div class="text-sm opacity-90">Vendors</div>
                </div>
            </div>
            <div class="text-xs opacity-75">Registered suppliers</div>
        </div>

        <!-- RFQs Stats -->
        <div class="stat-card bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <i class="fas fa-clipboard-list text-3xl opacity-80"></i>
                <div class="text-right">
                    <div class="text-2xl font-bold" id="stat-rfqs">0</div>
                    <div class="text-sm opacity-90">RFQs</div>
                </div>
            </div>
            <div class="text-xs opacity-75">Total requests</div>
        </div>

        <!-- Revenue Stats -->
        <div class="stat-card bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div class="flex items-center justify-between mb-4">
                <i class="fas fa-dollar-sign text-3xl opacity-80"></i>
                <div class="text-right">
                    <div class="text-2xl font-bold" id="stat-revenue">0</div>
                    <div class="text-sm opacity-90">Revenue</div>
                </div>
            </div>
            <div class="text-xs opacity-75">Total earnings</div>
        </div>
    </div>

    <!-- Activity Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Pending Approvals -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-clock text-yellow-600 mr-2"></i>
                Pending Approvals
            </h2>
            <div id="pending-approvals" class="space-y-3">
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                    <p>Loading...</p>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-history text-gray-600 mr-2"></i>
                Recent Activity
            </h2>
            <div id="recent-activity" class="space-y-3">
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Orders Requiring QA -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <i class="fas fa-clipboard-check text-green-600 mr-2"></i>
            Orders Requiring QA
        </h2>
        <div id="qa-orders" class="space-y-3">
            <div class="text-center py-8 text-gray-400">
                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                <p>Loading...</p>
            </div>
        </div>
    </div>

    <script>
        async function loadDashboard() {
            try {
                const stats = await apiCall('/api/admin/stats');
                if (stats.success) {
                    updateStats(stats.data);
                }

                const users = await apiCall('/api/admin/users?status=pending&limit=5');
                if (users.success) {
                    displayPendingUsers(users.data.users);
                }

                const rfqs = await apiCall('/api/admin/rfqs?status=submitted&limit=5');
                if (rfqs.success) {
                    displayRecentRFQs(rfqs.data.rfqs);
                }

                const orders = await apiCall('/api/admin/orders?limit=5');
                if (orders.success) {
                    displayQAOrders(orders.data.orders);
                }
            } catch (error) {
                console.error('Dashboard load error:', error);
            }
        }

        function updateStats(data) {
            const buyers = data.users.find(u => u.role === 'buyer')?.count || 0;
            const vendors = data.users.find(u => u.role === 'vendor')?.count || 0;
            const totalRFQs = data.rfqs.reduce((sum, r) => sum + r.count, 0);
            
            document.getElementById('stat-buyers').textContent = buyers;
            document.getElementById('stat-vendors').textContent = vendors;
            document.getElementById('stat-rfqs').textContent = totalRFQs;
            document.getElementById('stat-revenue').textContent = 'EGP ' + Number(data.revenue).toLocaleString();
        }

        function displayPendingUsers(users) {
            const container = document.getElementById('pending-approvals');
            if (!users || users.length === 0) {
                container.innerHTML = '<div class="text-center py-6 text-gray-400">No pending approvals</div>';
                return;
            }

            container.innerHTML = users.map(user => \`
                <div class="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-orange-300 transition-all">
                    <div>
                        <div class="font-semibold text-gray-900">\${user.email}</div>
                        <div class="text-sm text-gray-600">Role: <span class="capitalize">\${user.role}</span></div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="approveUser(\${user.id})" class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                            <i class="fas fa-check mr-1"></i>Approve
                        </button>
                        <button onclick="rejectUser(\${user.id})" class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                            <i class="fas fa-times mr-1"></i>Reject
                        </button>
                    </div>
                </div>
            \`).join('');
        }

        function displayRecentRFQs(rfqs) {
            const container = document.getElementById('recent-activity');
            if (!rfqs || rfqs.length === 0) {
                container.innerHTML = '<div class="text-center py-6 text-gray-400">No recent activity</div>';
                return;
            }

            container.innerHTML = rfqs.map(rfq => \`
                <div class="border-l-4 border-blue-500 pl-4 py-2">
                    <div class="font-semibold text-gray-900">\${rfq.title}</div>
                    <div class="text-sm text-gray-600">
                        <span class="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">\${rfq.rfq_number}</span>
                        <span class="mx-2">•</span>
                        <span>\${rfq.bid_count} bids</span>
                        <span class="mx-2">•</span>
                        <span>\${new Date(rfq.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            \`).join('');
        }

        function displayQAOrders(orders) {
            const container = document.getElementById('qa-orders');
            if (!orders || orders.length === 0) {
                container.innerHTML = '<div class="text-center py-6 text-gray-400">No orders requiring QA</div>';
                return;
            }

            container.innerHTML = orders.map(order => \`
                <div class="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-green-300 transition-all">
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">\${order.order_number || 'Order #' + order.id}</div>
                        <div class="text-sm text-gray-600">
                            Buyer: \${order.buyer_email} • 
                            Amount: EGP \${Number(order.total_amount).toLocaleString()} •
                            Status: <span class="capitalize">\${order.status}</span>
                        </div>
                    </div>
                    <a href="/admin/orders?id=\${order.id}" class="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        <i class="fas fa-clipboard-check mr-1"></i>Review
                    </a>
                </div>
            \`).join('');
        }

        async function approveUser(userId) {
            if (!confirm('Are you sure you want to approve this user?')) return;
            
            try {
                const res = await apiCall(\`/api/admin/users/\${userId}/status\`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'active' })
                });
                
                if (res.success) {
                    showToast('User approved successfully');
                    loadDashboard();
                } else {
                    showToast(res.error || 'Failed to approve user', 'error');
                }
            } catch (error) {
                showToast('Failed to approve user', 'error');
            }
        }

        async function rejectUser(userId) {
            if (!confirm('Are you sure you want to suspend this user?')) return;
            
            try {
                const res = await apiCall(\`/api/admin/users/\${userId}/status\`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'suspended' })
                });
                
                if (res.success) {
                    showToast('User suspended');
                    loadDashboard();
                } else {
                    showToast(res.error || 'Failed to suspend user', 'error');
                }
            } catch (error) {
                showToast('Failed to suspend user', 'error');
            }
        }

        loadDashboard();
    </script>
  `
  
  return c.html(getAdminLayout(content, 'Admin Dashboard'))
})

// Users Management
adminPages.get('/users', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p class="text-gray-600">Manage all platform users</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center space-x-4">
            <select id="role-filter" class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">All Roles</option>
                <option value="buyer">Buyers</option>
                <option value="vendor">Vendors</option>
                <option value="admin">Admins</option>
            </select>
            <select id="status-filter" class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
            </select>
            <button onclick="loadUsers()" class="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700">
                <i class="fas fa-filter mr-2"></i>Filter
            </button>
        </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody id="users-list" class="bg-white divide-y divide-gray-200">
                <tr><td colspan="5" class="text-center py-8 text-gray-400">Loading...</td></tr>
            </tbody>
        </table>
    </div>

    <script>
        async function loadUsers(page = 1) {
            try {
                const role = document.getElementById('role-filter').value;
                const status = document.getElementById('status-filter').value;
                const params = new URLSearchParams({ page: page.toString(), limit: '20' });
                if (role) params.append('role', role);
                if (status) params.append('status', status);
                
                const res = await apiCall('/api/admin/users?' + params);
                if (res.success) {
                    displayUsers(res.data.users);
                }
            } catch (error) {
                console.error('Load users error:', error);
            }
        }

        function displayUsers(users) {
            const tbody = document.getElementById('users-list');
            if (!users || users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400">No users found</td></tr>';
                return;
            }

            const statusColors = {
                active: 'bg-green-100 text-green-800',
                pending: 'bg-yellow-100 text-yellow-800',
                suspended: 'bg-red-100 text-red-800'
            };

            const roleColors = {
                admin: 'bg-orange-100 text-orange-800',
                buyer: 'bg-blue-100 text-blue-800',
                vendor: 'bg-purple-100 text-purple-800'
            };

            tbody.innerHTML = users.map(user => \`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">\${user.email}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-semibold rounded \${roleColors[user.role] || 'bg-gray-100 text-gray-800'} capitalize">
                            \${user.role}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-semibold rounded \${statusColors[user.status] || 'bg-gray-100 text-gray-800'} capitalize">
                            \${user.status}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        \${new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select onchange="updateUserStatus(\${user.id}, this.value)" class="px-2 py-1 border border-gray-300 rounded text-xs">
                            <option value="">Change Status</option>
                            <option value="active" \${user.status === 'active' ? 'disabled' : ''}>Activate</option>
                            <option value="suspended" \${user.status === 'suspended' ? 'disabled' : ''}>Suspend</option>
                        </select>
                    </td>
                </tr>
            \`).join('');
        }

        async function updateUserStatus(userId, status) {
            if (!status) return;
            if (!confirm(\`Are you sure you want to change this user's status to \${status}?\`)) return;
            
            try {
                const res = await apiCall(\`/api/admin/users/\${userId}/status\`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                });
                
                if (res.success) {
                    showToast('User status updated');
                    loadUsers();
                } else {
                    showToast(res.error || 'Failed to update status', 'error');
                }
            } catch (error) {
                showToast('Failed to update status', 'error');
            }
        }

        loadUsers();
    </script>
  `
  
  return c.html(getAdminLayout(content, 'User Management'))
})

// RFQs Management
adminPages.get('/rfqs', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">RFQ Management</h1>
        <p class="text-gray-600">Monitor and manage all RFQs and bids</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center space-x-4">
            <select id="status-filter" class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
            </select>
            <button onclick="loadRFQs()" class="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700">
                <i class="fas fa-filter mr-2"></i>Filter
            </button>
        </div>
    </div>

    <!-- RFQs List -->
    <div id="rfqs-list" class="space-y-4">
        <div class="text-center py-12 text-gray-400">Loading...</div>
    </div>

    <script>
        async function loadRFQs(page = 1) {
            try {
                const status = document.getElementById('status-filter').value;
                const params = new URLSearchParams({ page: page.toString(), limit: '10' });
                if (status) params.append('status', status);
                
                const res = await apiCall('/api/admin/rfqs?' + params);
                if (res.success) {
                    displayRFQs(res.data.rfqs);
                }
            } catch (error) {
                console.error('Load RFQs error:', error);
            }
        }

        function displayRFQs(rfqs) {
            const container = document.getElementById('rfqs-list');
            if (!rfqs || rfqs.length === 0) {
                container.innerHTML = '<div class="bg-white rounded-lg p-12 text-center text-gray-400">No RFQs found</div>';
                return;
            }

            container.innerHTML = rfqs.map(rfq => \`
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <div class="flex items-center space-x-3 mb-2">
                                <span class="font-mono text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">\${rfq.rfq_number}</span>
                                <span class="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded capitalize">\${rfq.status}</span>
                                <span class="text-sm text-gray-500">\${rfq.bid_count} bids</span>
                            </div>
                            <h3 class="text-xl font-bold text-gray-900 mb-1">\${rfq.title}</h3>
                            <p class="text-gray-600 mb-2">\${rfq.description || 'No description'}</p>
                            <div class="flex items-center space-x-4 text-sm text-gray-500">
                                <span><i class="fas fa-user mr-1"></i>\${rfq.buyer_email}</span>
                                <span><i class="fas fa-boxes mr-1"></i>\${rfq.total_items} items</span>
                                <span><i class="fas fa-calendar mr-1"></i>\${new Date(rfq.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button onclick="viewBids(\${rfq.id}, '\${rfq.rfq_number}')" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                            <i class="fas fa-eye mr-2"></i>View Bids
                        </button>
                    </div>
                </div>
            \`).join('');
        }

        async function viewBids(rfqId, rfqNumber) {
            try {
                const res = await apiCall(\`/api/admin/bids/\${rfqId}\`);
                if (res.success) {
                    showBidsModal(res.data.bids, rfqNumber);
                }
            } catch (error) {
                showToast('Failed to load bids', 'error');
            }
        }

        function showBidsModal(bids, rfqNumber) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
            
            modal.innerHTML = \`
                <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl font-bold text-gray-900">Bids for \${rfqNumber}</h2>
                            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times text-xl"></i>
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        \${bids.length === 0 ? '<p class="text-center text-gray-400 py-8">No bids submitted yet</p>' : 
                          bids.map(bid => \`
                            <div class="border border-gray-200 rounded-lg p-4 mb-3">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="font-semibold text-gray-900">\${bid.company_name}</div>
                                        <div class="text-sm text-gray-600">Vendor: \${bid.vendor_email}</div>
                                        <div class="text-lg font-bold text-green-600 mt-1">EGP \${Number(bid.total_amount).toLocaleString()}</div>
                                        <div class="text-xs text-gray-500 mt-1">Status: <span class="capitalize">\${bid.status}</span></div>
                                    </div>
                                    <div class="flex space-x-2">
                                        <button onclick="acceptBid(\${bid.id})" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" \${bid.status !== 'pending' ? 'disabled' : ''}>
                                            <i class="fas fa-check mr-1"></i>Accept
                                        </button>
                                        <button onclick="rejectBid(\${bid.id})" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" \${bid.status !== 'pending' ? 'disabled' : ''}>
                                            <i class="fas fa-times mr-1"></i>Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                          \`).join('')
                        }
                    </div>
                </div>
            \`;
            
            document.body.appendChild(modal);
        }

        async function acceptBid(bidId) {
            if (!confirm('Accept this bid?')) return;
            try {
                const res = await apiCall(\`/api/admin/bids/\${bidId}/status\`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'accepted' })
                });
                if (res.success) {
                    showToast('Bid accepted');
                    document.querySelector('.fixed')?.remove();
                    loadRFQs();
                }
            } catch (error) {
                showToast('Failed to accept bid', 'error');
            }
        }

        async function rejectBid(bidId) {
            if (!confirm('Reject this bid?')) return;
            try {
                const res = await apiCall(\`/api/admin/bids/\${bidId}/status\`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: 'rejected' })
                });
                if (res.success) {
                    showToast('Bid rejected');
                    document.querySelector('.fixed')?.remove();
                    loadRFQs();
                }
            } catch (error) {
                showToast('Failed to reject bid', 'error');
            }
        }

        loadRFQs();
    </script>
  `
  
  return c.html(getAdminLayout(content, 'RFQ Management'))
})

// Orders Management
adminPages.get('/orders', (c) => {
  const content = `
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p class="text-gray-600">Monitor orders and perform quality assurance</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center space-x-4">
            <select id="status-filter" class="px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_warehouse">In Warehouse</option>
                <option value="qa_pending">QA Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
            </select>
            <button onclick="loadOrders()" class="px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700">
                <i class="fas fa-filter mr-2"></i>Filter
            </button>
        </div>
    </div>

    <!-- Orders List -->
    <div id="orders-list" class="space-y-4">
        <div class="text-center py-12 text-gray-400">Loading...</div>
    </div>

    <script>
        async function loadOrders(page = 1) {
            try {
                const status = document.getElementById('status-filter').value;
                const params = new URLSearchParams({ page: page.toString(), limit: '10' });
                if (status) params.append('status', status);
                
                const res = await apiCall('/api/admin/orders?' + params);
                if (res.success) {
                    displayOrders(res.data.orders);
                }
            } catch (error) {
                console.error('Load orders error:', error);
            }
        }

        function displayOrders(orders) {
            const container = document.getElementById('orders-list');
            if (!orders || orders.length === 0) {
                container.innerHTML = '<div class="bg-white rounded-lg p-12 text-center text-gray-400">No orders found</div>';
                return;
            }

            container.innerHTML = orders.map(order => \`
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <span class="font-mono text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded">\${order.order_number || 'ORD-' + order.id}</span>
                                <span class="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded capitalize">\${order.status}</span>
                                <span class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded">QA: \${order.qa_status || 'pending'}</span>
                            </div>
                            <div class="mb-2">
                                <span class="text-xl font-bold text-gray-900">EGP \${Number(order.total_amount).toLocaleString()}</span>
                            </div>
                            <div class="flex items-center space-x-4 text-sm text-gray-600">
                                <span><i class="fas fa-user mr-1"></i>\${order.buyer_email}</span>
                                <span><i class="fas fa-calendar mr-1"></i>\${new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="updateQA(\${order.id}, 'passed')" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                <i class="fas fa-check mr-1"></i>Pass QA
                            </button>
                            <button onclick="updateQA(\${order.id}, 'failed')" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                <i class="fas fa-times mr-1"></i>Fail QA
                            </button>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        async function updateQA(orderId, qaStatus) {
            const notes = prompt(\`Enter QA notes (optional):\`);
            if (notes === null && qaStatus === 'failed') return; // Cancel if notes not provided for failure
            
            try {
                const res = await apiCall(\`/api/admin/orders/\${orderId}/qa\`, {
                    method: 'PUT',
                    body: JSON.stringify({ qa_status: qaStatus, qa_notes: notes || '' })
                });
                
                if (res.success) {
                    showToast(\`QA \${qaStatus === 'passed' ? 'passed' : 'failed'}\`);
                    loadOrders();
                } else {
                    showToast(res.error || 'Failed to update QA', 'error');
                }
            } catch (error) {
                showToast('Failed to update QA', 'error');
            }
        }

        loadOrders();
    </script>
  `
  
  return c.html(getAdminLayout(content, 'Orders Management'))
})

export default adminPages
