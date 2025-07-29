import React, { useState, useEffect } from 'react';
import {
  ChartContainer,
  ChartTooltip,
} from '../components/ui/chart';
import * as Recharts from 'recharts';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';

// Import Nunito Sans font
import { Nunito_Sans } from 'next/font/google';

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-nunito-sans',
});

// Define TypeScript interfaces for type safety
interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  tierPrices: TierPrice[];
  image: string;
}

interface TierPrice {
  minQuantity: number;
  maxQuantity: number;
  price: number;
  discountPercent: number;
}

interface CartItem extends Product {
  selectedTier: TierPrice;
  quantity: number;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'Processing' | 'Confirmed' | 'In Transit' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface Customer {
  id: string;
  name: string;
  creditLimit: number;
  currentBalance: number;
  paymentDueDate: string;
  accountStatus: 'Active' | 'Overdue' | 'Suspended';
}

const products: (Product & { image: string })[] = [
  {
    id: "PROD001",
    name: "Organic Whole Wheat Flour",
    category: "Bakery & Grains",
    basePrice: 28.5,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 10, price: 28.5, discountPercent: 0 },
      { minQuantity: 11, maxQuantity: 50, price: 26.75, discountPercent: 6.1 },
      { minQuantity: 51, maxQuantity: 100, price: 24.9, discountPercent: 12.6 },
      { minQuantity: 101, maxQuantity: Infinity, price: 23.25, discountPercent: 18.4 }
    ],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" // Whole Wheat Flour
  },
  {
    id: "PROD002",
    name: "Roasted Coffee Beans",
    category: "Beverages",
    basePrice: 45.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 5, price: 45.0, discountPercent: 0 },
      { minQuantity: 6, maxQuantity: 20, price: 42.3, discountPercent: 6.0 },
      { minQuantity: 21, maxQuantity: 50, price: 39.6, discountPercent: 12.0 },
      { minQuantity: 51, maxQuantity: Infinity, price: 36.9, discountPercent: 18.0 }
    ],
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=80" // Coffee Beans
  },
  {
    id: "PROD003",
    name: "Premium Granola",
    category: "Snacks",
    basePrice: 32.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 10, price: 32.0, discountPercent: 0 },
      { minQuantity: 11, maxQuantity: 30, price: 30.1, discountPercent: 5.9 },
      { minQuantity: 31, maxQuantity: 60, price: 28.2, discountPercent: 11.9 },
      { minQuantity: 61, maxQuantity: Infinity, price: 26.2, discountPercent: 18.1 }
    ],
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80" // Granola
  },
  {
    id: "PROD004",
    name: "Artisanal Honey",
    category: "Jams & Spreads",
    basePrice: 55.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 5, price: 55.0, discountPercent: 0 },
      { minQuantity: 6, maxQuantity: 15, price: 51.7, discountPercent: 6.0 },
      { minQuantity: 16, maxQuantity: 30, price: 48.4, discountPercent: 12.0 },
      { minQuantity: 31, maxQuantity: Infinity, price: 45.1, discountPercent: 18.0 }
    ],
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80" // Honey
  },
  {
    id: "PROD005",
    name: "Organic Almond Milk",
    category: "Dairy Alternatives",
    basePrice: 22.5,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 20, price: 22.5, discountPercent: 0 },
      { minQuantity: 21, maxQuantity: 50, price: 21.15, discountPercent: 6.0 },
      { minQuantity: 51, maxQuantity: 100, price: 19.8, discountPercent: 12.0 },
      { minQuantity: 101, maxQuantity: Infinity, price: 18.45, discountPercent: 18.0 }
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8eCTJsDF4kz1jnuCr0P4XXfLEbSZ6x-uynQ&s" // Almond Milk
  },
  {
    id: "PROD006",
    name: "Spelt Pasta",
    category: "Pasta & Grains",
    basePrice: 30.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 10, price: 30.0, discountPercent: 0 },
      { minQuantity: 11, maxQuantity: 30, price: 28.2, discountPercent: 6.0 },
      { minQuantity: 31, maxQuantity: 60, price: 26.4, discountPercent: 12.0 },
      { minQuantity: 61, maxQuantity: Infinity, price: 24.6, discountPercent: 18.0 }
    ],
    image: "https://fieldgoods.co.uk/cdn/shop/files/radiatori-spelt-pasta-926005_800x.jpg?v=1729904979" // Spelt Pasta
  },
  {
    id: "PROD007",
    name: "Dark Chocolate Chips",
    category: "Baking Ingredients",
    basePrice: 38.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 5, price: 38.0, discountPercent: 0 },
      { minQuantity: 6, maxQuantity: 20, price: 35.7, discountPercent: 6.1 },
      { minQuantity: 21, maxQuantity: 50, price: 33.4, discountPercent: 12.1 },
      { minQuantity: 51, maxQuantity: Infinity, price: 31.1, discountPercent: 18.2 }
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRce75ulBuih4JtKFQpObJpcc_UkD_4vZjarw&s" // Dark Chocolate Chips
  },
  {
    id: "PROD008",
    name: "Organic Coconut Oil",
    category: "Oils & Fats",
    basePrice: 42.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 10, price: 42.0, discountPercent: 0 },
      { minQuantity: 11, maxQuantity: 25, price: 39.5, discountPercent: 6.0 },
      { minQuantity: 26, maxQuantity: 50, price: 37.0, discountPercent: 11.9 },
      { minQuantity: 51, maxQuantity: Infinity, price: 34.4, discountPercent: 18.1 }
    ],
    image: "https://cdn.shopify.com/s/files/1/0489/5028/0356/files/Screenshot_2023-02-06_104905_480x480.png?v=1675660757" // Organic Coconut Oil
  },
  {
    id: "PROD009",
    name: "Quinoa Seeds",
    category: "Grains & Seeds",
    basePrice: 35.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 10, price: 35.0, discountPercent: 0 },
      { minQuantity: 11, maxQuantity: 30, price: 32.9, discountPercent: 6.0 },
      { minQuantity: 31, maxQuantity: 60, price: 30.8, discountPercent: 12.0 },
      { minQuantity: 61, maxQuantity: Infinity, price: 28.7, discountPercent: 18.0 }
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpZ37QcOzezAJFtDavce6_x5YaU6q8BHF7EA&s" // Quinoa Seeds
  },
  {
    id: "PROD010",
    name: "Green Tea Leaves",
    category: "Beverages",
    basePrice: 28.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 15, price: 28.0, discountPercent: 0 },
      { minQuantity: 16, maxQuantity: 40, price: 26.3, discountPercent: 6.1 },
      { minQuantity: 41, maxQuantity: 80, price: 24.6, discountPercent: 12.1 },
      { minQuantity: 81, maxQuantity: Infinity, price: 22.9, discountPercent: 18.2 }
    ],
    image: "https://cdn.shopify.com/s/files/1/0805/7857/6667/files/fresh-tea-leaves-in-japan_718X535_87c5746c-a95a-4198-942d-e1c04fbe72ff.webp?v=1703796255" // Green Tea Leaves
  },
  {
    id: "PROD011",
    name: "Mixed Nuts Premium",
    category: "Snacks",
    basePrice: 48.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 8, price: 48.0, discountPercent: 0 },
      { minQuantity: 9, maxQuantity: 25, price: 45.1, discountPercent: 6.0 },
      { minQuantity: 26, maxQuantity: 50, price: 42.2, discountPercent: 12.1 },
      { minQuantity: 51, maxQuantity: Infinity, price: 39.3, discountPercent: 18.1 }
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvfTUiWMzFJfXD0S45SiQ5ESa9x_uQAOGUyg&s" // Mixed Nuts Premium
  },
  {
    id: "PROD012",
    name: "Organic Maple Syrup",
    category: "Sweeteners",
    basePrice: 65.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 5, price: 65.0, discountPercent: 0 },
      { minQuantity: 6, maxQuantity: 15, price: 61.1, discountPercent: 6.0 },
      { minQuantity: 16, maxQuantity: 30, price: 57.2, discountPercent: 12.0 },
      { minQuantity: 31, maxQuantity: Infinity, price: 53.3, discountPercent: 18.0 }
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRq3ee875jpvwcw9xuMMGZHoT_Z2untPZsrQ&s" // Organic Maple Syrup
  },
  {
    id: "PROD013",
    name: "Chia Seeds",
    category: "Grains & Seeds",
    basePrice: 32.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 12, price: 32.0, discountPercent: 0 },
      { minQuantity: 13, maxQuantity: 35, price: 30.1, discountPercent: 5.9 },
      { minQuantity: 36, maxQuantity: 70, price: 28.2, discountPercent: 11.9 },
      { minQuantity: 71, maxQuantity: Infinity, price: 26.2, discountPercent: 18.1 }
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0LGNwHEfyMD4YvebCCxWIpJWULkEM9q-JjQ&s" // Chia Seeds
  },
  {
    id: "PROD014",
    name: "Vanilla Extract",
    category: "Baking Ingredients",
    basePrice: 55.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 8, price: 55.0, discountPercent: 0 },
      { minQuantity: 9, maxQuantity: 20, price: 51.7, discountPercent: 6.0 },
      { minQuantity: 21, maxQuantity: 40, price: 48.4, discountPercent: 12.0 },
      { minQuantity: 41, maxQuantity: Infinity, price: 45.1, discountPercent: 18.0 }
    ],
    image: "https://www.thespicehouse.com/cdn/shop/articles/Vanilla_Extract_720x.jpg?v=1590182129" // Vanilla Extract
  },
  {
    id: "PROD015",
    name: "Dried Cranberries",
    category: "Snacks",
    basePrice: 26.0,
    tierPrices: [
      { minQuantity: 1, maxQuantity: 15, price: 26.0, discountPercent: 0 },
      { minQuantity: 16, maxQuantity: 40, price: 24.4, discountPercent: 6.2 },
      { minQuantity: 41, maxQuantity: 80, price: 22.9, discountPercent: 11.9 },
      { minQuantity: 81, maxQuantity: Infinity, price: 21.3, discountPercent: 18.1 }
    ],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqWSCT4j-RVp2jl3lHMqT0EM742dy05glgjQ&s" // Dried Cranberries
  }
];

const customers: Customer[] = [
  {
    id: "CUST001",
    name: "Green Valley Bakery",
    creditLimit: 10000,
    currentBalance: 3500,
    paymentDueDate: "2025-03-25",
    accountStatus: "Active"
  },
  {
    id: "CUST002",
    name: "Sunset Coffee Roasters",
    creditLimit: 7500,
    currentBalance: 2200,
    paymentDueDate: "2025-03-30",
    accountStatus: "Active"
  }
];

const initialOrders: Order[] = [
  {
    id: "ORD001",
    date: "2025-03-15",
    total: 760.50,
    status: "Processing",
    items: [
      { ...products[0], selectedTier: products[0].tierPrices[1], quantity: 20 },
      { ...products[2], selectedTier: products[2].tierPrices[0], quantity: 5 }
    ]
  },
  {
    id: "ORD002",
    date: "2025-03-10",
    total: 1425.00,
    status: "In Transit",
    items: [
      { ...products[1], selectedTier: products[1].tierPrices[2], quantity: 30 },
      { ...products[3], selectedTier: products[3].tierPrices[0], quantity: 3 }
    ],
    trackingNumber: "UPS-4536271890",
    estimatedDelivery: "2025-03-18"
  }
];

const inventoryData = [
  { name: 'Organic Flour', quantity: 1500, minStock: 200, category: 'Bakery & Grains' },
  { name: 'Coffee Beans', quantity: 800, minStock: 150, category: 'Beverages' },
  { name: 'Granola', quantity: 300, minStock: 100, category: 'Snacks' },
  { name: 'Artisanal Honey', quantity: 500, minStock: 80, category: 'Jams & Spreads' },
  { name: 'Almond Milk', quantity: 1200, minStock: 300, category: 'Dairy Alternatives' },
  { name: 'Spelt Pasta', quantity: 600, minStock: 150, category: 'Pasta & Grains' },
];

export default function B2BPortal() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'orders' | 'account' | 'products'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(customers[0]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close order details modal when closing the main modal
  useEffect(() => {
    if (!showOrderModal) {
      setShowOrderDetailsModal(false);
    }
  }, [showOrderModal]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showOrderModal) {
          setShowOrderModal(false);
          setShowOrderDetailsModal(false);
        }
        if (showOrderDetailsModal) {
          setShowOrderDetailsModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showOrderModal, showOrderDetailsModal]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.date.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getProductById(productId: string): Product | undefined {
    return products.find(p => p.id === productId);
  }

  const getOrderCountByStatus = (status: 'Processing' | 'Confirmed' | 'In Transit' | 'Delivered' | 'Cancelled') => {
    return orders.filter(order => order.status === status).length;
  };

  const getProductInventoryStatus = (product: Product | undefined | null) => {
    if (!product || !product.name) return 'In Stock';
    const inventoryItem = inventoryData.find(item => item.name === product.name);
    if (!inventoryItem) return 'In Stock';
    const bufferPercent = ((inventoryItem.quantity - inventoryItem.minStock) / inventoryItem.minStock) * 100;
    if (inventoryItem.quantity <= inventoryItem.minStock) return 'Critical';
    if (bufferPercent < 20) return 'Low';
    if (bufferPercent < 50) return 'Moderate';
    return 'Good';
  };

  const getAccountStatusColor = (status: 'Active' | 'Overdue' | 'Suspended') => {
    switch (status) {
      case 'Active': return 'text-emerald-500';
      case 'Overdue': return 'text-amber-500';
      case 'Suspended': return 'text-red-500';
    }
  };

  const getOrderStatusColor = (status: 'Processing' | 'Confirmed' | 'In Transit' | 'Delivered' | 'Cancelled') => {
    switch (status) {
      case 'Processing': return 'bg-[#FF9800]/10 dark:bg-[#FF9800]/20 text-[#FF9800] dark:text-[#FF9800] border border-[#FF9800]/20';
      case 'Confirmed': return 'bg-[#4880FF]/10 dark:bg-[#4880FF]/20 text-[#4880FF] dark:text-[#4880FF] border border-[#4880FF]/20';
      case 'In Transit': return 'bg-[#2196F3]/10 dark:bg-[#2196F3]/20 text-[#2196F3] dark:text-[#2196F3] border border-[#2196F3]/20';
      case 'Delivered': return 'bg-[#4CAF50]/10 dark:bg-[#4CAF50]/20 text-[#4CAF50] dark:text-[#4CAF50] border border-[#4CAF50]/20';
      case 'Cancelled': return 'bg-[#E91E63]/10 dark:bg-[#E91E63]/20 text-[#E91E63] dark:text-[#E91E63] border border-[#E91E63]/20';
    }
  };

  // Show "Feature coming soon" toast
  const showComingSoonToast = () => {
    toast.info('Feature coming soon', {
      description: 'This feature is currently under development and will be available soon.',
      duration: 3000,
    });
  };

  const handleAddToCart = (product: Product) => {
    const defaultTier = product.tierPrices[0];
    setCart(prevCart => [...prevCart, { ...product, selectedTier: defaultTier, quantity: 1 }]);
    toast.success(`Added ${product.name} to cart`, {
      description: `Price: $${defaultTier.price}/unit`,
      duration: 3000,
    });
  };

  const calculateCartSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.selectedTier.price * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const calculateCartTax = (subtotal: number) => {
    const taxRate = 0.08;
    return subtotal * taxRate;
  };

  const calculateCartTotal = () => {
    const subtotal = calculateCartSubtotal();
    const tax = calculateCartTax(subtotal);
    return subtotal + tax;
  };

  const handlePlaceOrder = () => {
    const orderTotal = calculateCartTotal();

    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      total: orderTotal,
      status: 'Processing',
      items: [...cart]
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);

    toast.success('Order placed successfully!', {
      description: `Order #${newOrder.id}`,
      duration: 3000,
    });

    setCart([]);
    setShowOrderModal(false);
    setActiveTab('orders');
  };

  const handlePayInvoice = (invoiceAmount: number) => {
    if (selectedCustomer.currentBalance >= invoiceAmount) {
      const newBalance = selectedCustomer.currentBalance - invoiceAmount;
      setSelectedCustomer({
        ...selectedCustomer,
        currentBalance: newBalance,
        accountStatus: newBalance <= 0 ? 'Active' : 'Overdue'
      });

      toast.success('Payment successful!', {
        description: `Paid $${invoiceAmount.toFixed(2)}`,
        duration: 3000,
      });
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-sm bg-blue-50 dark:bg-blue-900 px-3 py-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M12 2v4"></path>
              <path d="M12 18v4"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h4"></path>
              <path d="M18 12h4"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
            <span className="text-gray-700 dark:text-white">Today: <span className="font-medium">{new Date().toLocaleDateString()}</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Balance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm flex flex-row min-w-[180px] min-h-[120px] relative transition-colors">
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1 truncate">Current Balance</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${selectedCustomer.currentBalance.toLocaleString('en-US')}</div>
            <div className="text-xs text-gray-500 mb-1 truncate">Credit Limit: ${selectedCustomer.creditLimit.toLocaleString('en-US')}</div>
            <div className={`text-xs font-medium truncate ${getAccountStatusColor(selectedCustomer.accountStatus)}`}>● {selectedCustomer.accountStatus}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-[#2196F3] flex items-center justify-center md:absolute md:top-4 md:right-4 transition-colors">
            <svg width="22" height="21" viewBox="0 0 77 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 dark:text-white">
              <path d="M72.9474 17.8333V8.33333C72.9474 3.75 69.3 0 64.8421 0H8.10526C3.60684 0 0 3.75 0 8.33333V66.6667C0 71.25 3.60684 75 8.10526 75H64.8421C69.3 75 72.9474 71.25 72.9474 66.6667V57.1667C75.3384 55.7083 77 53.0833 77 50V25C77 21.9167 75.3384 19.2917 72.9474 17.8333ZM68.8947 25V50H40.5263V25H68.8947ZM8.10526 66.6667V8.33333H64.8421V16.6667H40.5263C36.0684 16.6667 32.4211 20.4167 32.4211 25V50C32.4211 54.5833 36.0684 58.3333 40.5263 58.3333H64.8421V66.6667H8.10526Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        {/* Pending Orders Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm flex flex-row min-w-[180px] min-h-[120px] relative transition-colors">
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-sm font-medium text-gray-500 mb-1 truncate">Total Pending</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${calculateCartTotal().toLocaleString('en-US')}</div>
            <div className="text-xs text-gray-500 mb-1 truncate">Processing Orders: {getOrderCountByStatus('Processing')}</div>
                                <button
                      onClick={() => {
                        setActiveTab('orders');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-fit px-3 py-1 rounded-lg bg-orange-50 dark:bg-[#FF9800] text-black text-xs font-semibold hover:bg-orange-100 dark:hover:bg-[#E68900] transition-colors mt-1"
                    >
                      View Orders
                    </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-[#FF9800] flex items-center justify-center md:absolute md:top-4 md:right-4 transition-colors">
            <svg width="22" height="23" viewBox="0 0 75 79" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-500 dark:text-white">
              <path opacity="0.78" fill-rule="evenodd" clip-rule="evenodd" d="M33.732 24.2031C33.7521 23.9426 33.9693 23.7415 34.2306 23.7415H36.8696C37.1265 23.7415 37.3415 23.9361 37.3671 24.1917L39.0993 41.5141L51.2882 48.4791C51.444 48.5682 51.5402 48.7338 51.5402 48.9133V51.523C51.5402 51.8527 51.2267 52.0921 50.9086 52.0054L32.389 46.9546C32.1576 46.8915 32.0036 46.673 32.022 46.4338L33.732 24.2031Z" fill="currentColor"/>
              <path opacity="0.901274" d="M15.9863 0.383904C16.0818 -0.0154669 16.5914 -0.13565 16.8555 0.178826L22.7139 7.16027C27.2007 5.24983 32.1378 4.19157 37.3223 4.19152C57.9348 4.19152 74.6454 20.9013 74.6455 41.5138C74.6455 62.1264 57.9349 78.8361 37.3223 78.8361C16.7098 78.8359 0 62.1263 0 41.5138C2.17514e-05 38.0131 0.482599 34.625 1.38379 31.4122L8.22852 33.3321C7.48887 35.969 7.1094 38.7126 7.10938 41.5138C7.10938 58.2001 20.636 71.7275 37.3223 71.7277C54.0087 71.7277 67.5361 58.2002 67.5361 41.5138C67.536 25.0882 54.4284 11.7243 38.1025 11.3107L37.3223 11.3009C33.9413 11.3009 30.6491 11.8561 27.5439 12.9171L33.4141 19.9122C33.6785 20.2274 33.4703 20.709 33.0596 20.7325L11.5029 21.9542C11.1687 21.9732 10.9106 21.6646 10.9883 21.339L15.9863 0.383904Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        {/* Total Orders Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm flex flex-row min-w-[180px] min-h-[120px] relative transition-colors">
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-sm font-medium text-gray-500 mb-1 truncate">Total Orders</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{orders.length}</div>
            <div className="text-xs text-gray-500 mb-1 truncate">In Transit this month: {getOrderCountByStatus('In Transit')}</div>
                                <button
                      onClick={() => {
                        setActiveTab('orders');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-fit px-3 py-1 rounded-lg bg-green-50 dark:bg-[#4CAF50] text-black text-xs font-semibold hover:bg-green-100 dark:hover:bg-[#3D8B40] transition-colors mt-1"
                    >
                      Order History
                    </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-[#4CAF50] flex items-center justify-center md:absolute md:top-4 md:right-4 transition-colors">
            <svg width="22" height="22" viewBox="0 0 75 75" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 dark:text-white">
              <path d="M8.29388 66.3511H70.498C72.7883 66.3511 74.645 68.2077 74.645 70.498C74.645 72.7883 72.7883 74.645 70.498 74.645H4.14694C1.85665 74.645 0 72.7883 0 70.498V4.14694C0 1.85665 1.85665 0 4.14694 0C6.43724 0 8.29388 1.85665 8.29388 4.14694V66.3511Z" fill="currentColor"/>
              <path opacity="0.5" d="M23.7597 48.4525C22.1933 50.1234 19.5689 50.208 17.8981 48.6416C16.2272 47.0752 16.1426 44.4509 17.709 42.78L33.26 26.1922C34.775 24.5763 37.2923 24.4362 38.9773 25.874L51.2511 36.3477L67.2428 16.0915C68.662 14.2939 71.2697 13.9871 73.0673 15.4063C74.8649 16.8255 75.1717 19.4332 73.7525 21.2308L55.0913 44.8683C53.6337 46.7146 50.9339 46.9802 49.1446 45.4532L36.604 34.752L23.7597 48.4525Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        {/* Available Products Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm flex flex-row min-w-[180px] min-h-[120px] relative transition-colors">
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-sm font-medium text-gray-500 mb-1 truncate">Available Products</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{products.length}</div>
            <div className="text-xs text-gray-500 mb-1 truncate">With low stock: {products.filter(p => getProductInventoryStatus(p) === 'Low').length}</div>
                                <button
                      onClick={() => {
                        setActiveTab('products');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-fit px-3 py-1 rounded-lg bg-yellow-50 dark:bg-[#FFEB3B] text-black text-xs font-semibold hover:bg-yellow-100 dark:hover:bg-[#FDD835] transition-colors mt-1"
                    >
                      View Products
                    </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-[#FFEB3B] flex items-center justify-center md:absolute md:top-4 md:right-4 transition-colors">
            <svg width="22" height="24" viewBox="0 0 80 89" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500 dark:text-[#795548]">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0 30.1683L34.3913 50.0242C34.7616 50.238 35.1499 50.3924 35.5452 50.4904V88.9999L2.45279 69.4157C0.932486 68.516 0 66.8806 0 65.114V30.1683ZM79.9763 29.6405V65.114C79.9763 66.8806 79.0438 68.516 77.5235 69.4157L44.4311 88.9999V50.1531C44.5117 50.1128 44.5916 50.0699 44.6707 50.0242L79.9763 29.6405Z" fill="currentColor"/>
              <path opacity="0.499209" fill-rule="evenodd" clip-rule="evenodd" d="M1.08057 20.5312C1.50064 20.0007 2.03086 19.5524 2.64902 19.2231L37.6388 0.586761C39.1077 -0.195587 40.8696 -0.195587 42.3385 0.586761L77.3283 19.2231C77.8048 19.4769 78.2291 19.8015 78.5909 20.1799L40.2283 42.3285C39.976 42.4742 39.7435 42.6408 39.5315 42.825C39.3196 42.6408 39.087 42.4742 38.8348 42.3285L1.08057 20.5312Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Credit Utilization Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Credit Utilization</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Payment Due: {selectedCustomer.paymentDueDate}</span>
              </div>
            </div>
            <div className="w-full h-56 relative mb-4 -ml-8 -mr-8">

              {(() => {

                const utilizationData = [
                  { percent: 0, Healthy: 0, Critical: 0 },
                  { percent: 25, Healthy: 2000, Critical: 1000 },
                  { percent: 50, Healthy: 3000, Critical: 2000 },
                  { percent: 75, Healthy: 4000, Critical: 3500 },
                  { percent: 100, Healthy: 6500, Critical: 5000 },
                ];
                const chartConfig = {
                  Healthy: { label: 'Healthy', color: '#4CAF50' },
                  Warning: { label: 'Warning', color: '#FFEB3B' },
                  Critical: { label: 'Critical', color: '#FF9800' },
                  Overdue: { label: 'Overdue', color: '#E91E63' },
                };
                return (
                  <ChartContainer config={chartConfig} className="w-full h-56">
                    <Recharts.LineChart data={utilizationData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <Recharts.CartesianGrid strokeDasharray="3 3" />
                      <Recharts.XAxis dataKey="percent" tickFormatter={v => `${v}%`} />
                      <Recharts.YAxis tickFormatter={v => `$${v / 1000}k`} />
                      <ChartTooltip />
                      <Recharts.Line type="monotone" dataKey="Healthy" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4, fill: '#4CAF50' }} />
                      <Recharts.Line type="monotone" dataKey="Critical" stroke="#FF9800" strokeWidth={3} dot={{ r: 4, fill: '#FF9800' }} />
                    </Recharts.LineChart>
                  </ChartContainer>
                );
              })()}
            </div>
            {/* Personalized subtitles */}
            <div className="flex gap-6 mt-2 mb-2">
              <div className="flex items-center gap-1 text-sm"><span className="w-3 h-3 rounded-full bg-[#4CAF50] inline-block"></span> Healthy</div>
              <div className="flex items-center gap-1 text-sm"><span className="w-3 h-3 rounded-full bg-[#FFEB3B] inline-block"></span> Warning</div>
              <div className="flex items-center gap-1 text-sm"><span className="w-3 h-3 rounded-full bg-[#FF9800] inline-block"></span> Critical</div>
              <div className="flex items-center gap-1 text-sm"><span className="w-3 h-3 rounded-full bg-[#E91E63] inline-block"></span> Overdue</div>
            </div>
          </div>
          {/* Summary below the graph */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-200">
            <div>Current Balance</div>
            <div className="text-right">${selectedCustomer.currentBalance.toLocaleString('en-US')}</div>
            <div>Credit Limit</div>
            <div className="text-right">${selectedCustomer.creditLimit.toLocaleString('en-US')}</div>
            <div>Available Credit</div>
            <div className="text-right">${(selectedCustomer.creditLimit - selectedCustomer.currentBalance).toLocaleString('en-US')}</div>
          </div>
        </div>
        {/* Monthly Sales Trend Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between min-h-[320px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Sales Trend</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Last 6 months</span>
              </div>
            </div>
            <div className="w-full h-56 relative mb-4 -ml-4 -mr-4">
              {/* Monthly sales line chart using ChartContainer */}
              {(() => {
                const salesData = [
                  { month: 'Feb', sales: 0 },
                  { month: 'Mar', sales: 9000 },
                  { month: 'Apr', sales: 4000 },
                  { month: 'May', sales: 3000 },
                  { month: 'Jun', sales: 13000 },
                ];
                const chartConfig = {
                  sales: { label: 'Sales', color: '#2196F3' },
                };
                return (
                  <ChartContainer config={chartConfig} className="w-full h-56">
                    <Recharts.LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <Recharts.CartesianGrid strokeDasharray="3 3" />
                      <Recharts.XAxis dataKey="month" />
                      <Recharts.YAxis tickFormatter={v => v >= 1000 ? `$${v / 1000}k` : `$${v}k`}/>
                      <ChartTooltip />
                      <Recharts.Line type="monotone" dataKey="sales" stroke="#2196F3" strokeWidth={3} dot={false} />
                    </Recharts.LineChart>
                  </ChartContainer>
                );
              })()}
            </div>
          </div>
          {/* Summary below the graph */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-200">
            <div>Total Sales</div>
            <div className="text-right">$47,000</div>
            <div>Average Monthly</div>
            <div className="text-right">$15,667</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory Status</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z"></path>
                <path d="M12 17v5"></path>
                <path d="M9 20h6"></path>
              </svg>
              <span>Warehouse A</span>
            </div>
            <button className="text-sm text-[#4880FF] dark:text-[#4880FF] hover:text-[#3A6FD9] transition-colors font-medium">
              View All Warehouses
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PRODUCT</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CATEGORY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">QUANTITY</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">BUFFER</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">STATUS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100">
              {inventoryData.map((item) => {
                const bufferPercent = ((item.quantity - item.minStock) / item.minStock) * 100;
                const status = item.quantity <= item.minStock ? 'Critical' :
                  bufferPercent < 20 ? 'Low' :
                    bufferPercent < 50 ? 'Moderate' : 'Good';

                return (
                  <tr
                    key={item.name}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900 flex items-center justify-center mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                            <path d="M4 4h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z"></path>
                            <path d="M12 17v5"></path>
                            <path d="M9 20h6"></path>
                          </svg>
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-nunito-sans">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            status === 'Critical' ? 'bg-red-500' :
                              status === 'Low' ? 'bg-amber-500' :
                                status === 'Moderate' ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, bufferPercent))}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.minStock} units min
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-nunito-sans ${
                        status === 'Critical' ? 'bg-red-100 text-red-800' :
                          status === 'Low' ? 'bg-amber-100 text-amber-800' :
                            status === 'Moderate' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap flex gap-2">
                      <button
                        onClick={showComingSoonToast}
                        className="text-[#4880FF] dark:text-[#4880FF] hover:text-[#3A6FD9] transition-colors p-1 rounded-md"
                        aria-label="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={showComingSoonToast}
                        className="text-[#4880FF] dark:text-[#4880FF] hover:text-[#3A6FD9] transition-colors p-1 rounded-md"
                        aria-label="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v10"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

     
            {inventoryData.filter(item => getProductInventoryStatus(getProductById(item.name)!) === 'Critical').map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900 rounded-xl">
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-xs text-red-600 dark:text-red-400">Critical stock level: {item.quantity} units remaining</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toast.success('Restock order placed!', {
                      description: 'Your restock request has been submitted.',
                      duration: 3000,
                    });
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 transition-colors font-medium"
                >
                  Order Restock
                </button>
              </div>
            ))}
            {inventoryData.filter(item => getProductInventoryStatus(getProductById(item.name)!) === 'Low').map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900 rounded-xl">
                <div className="flex items-center">
                  <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h3>
                    <p className="text-xs text-amber-600 dark:text-amber-400">Low stock level: {item.quantity} units remaining</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    toast.success('Restock reminder set!', {
                      description: 'You will be notified when stock is low.',
                      duration: 3000,
                    });
                  }}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 transition-colors font-medium"
                >
                  Set Reminder
                </button>
              </div>
            ))}
          </div>
            );

  const renderCatalog = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <button
          onClick={() => {
            if (cart.length > 0) {
              setShowOrderModal(true);
            }
          }}
          className={`flex items-center gap-2 font-medium py-2.5 px-5 rounded-xl shadow-sm border transition-colors ${
            cart.length > 0
              ? 'bg-[#FAFBFD] border-[#D5D5D5] text-[#202224] hover:bg-gray-50'
              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          disabled={cart.length === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <path d="M3 6h18"></path>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          View Cart ({cart.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search products by name, category, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-0 rounded-xl text-gray-700 placeholder-gray-400 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700">
            <div className="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-[#4880FF] dark:text-[#4880FF] hover:text-[#3A6FD9] transition-colors font-medium text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700 flex flex-col h-full"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-36 object-cover object-center"
                />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{product.name}</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                    </div>
                    <div className={`px-2.5 py-0.5 text-xs font-medium rounded-full font-nunito-sans flex-shrink-0 ml-2 ${
                      getProductInventoryStatus(product) === 'Critical' ? 'bg-red-100 text-red-800' :
                        getProductInventoryStatus(product) === 'Low' ? 'bg-amber-100 text-amber-800' :
                          getProductInventoryStatus(product) === 'Moderate' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {getProductInventoryStatus(product)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 flex-1">
                    {product.tierPrices.map((tier, index) => {
                      const savingsPerUnit = product.basePrice - tier.price;
                      const savingsAmount = savingsPerUnit > 0 ? savingsPerUnit : 0;
                      
                      return (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-2 rounded-lg ${
                            index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-700'
                          }`}
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{tier.minQuantity}-{tier.maxQuantity === Infinity ? '∞' : tier.maxQuantity}</span>
                            {savingsAmount > 0 ? (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">({tier.discountPercent}% off)</span>
                                <span className="text-xs text-[#4CAF50] dark:text-[#4CAF50] font-medium">
                                  Save ${savingsAmount.toFixed(2)}/unit
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({tier.discountPercent}% off)</span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">${tier.price}</div>
                            {savingsAmount > 0 && (
                              <div className="text-xs text-gray-400 line-through">${product.basePrice}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 mt-auto">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-[#FAFBFD] border border-[#D5D5D5] text-[#202224] font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                        <path d="M3 6h18"></path>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        setShowOrderModal(true);
                      }}
                      className="flex-1 text-white bg-[#4880FF] dark:bg-[#4880FF] font-semibold py-2.5 rounded-lg hover:bg-[#3A6FD9] transition-colors text-sm"
                    >
                      Quick Buy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order History</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white px-3 py-1.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Z"></path>
            <path d="M12 17v5"></path>
            <path d="M9 20h6"></path>
          </svg>
          Total Orders: {orders.length}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search orders by ID, status, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-0 rounded-xl text-gray-700 dark:text-white placeholder-gray-400 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="space-y-5">
          {filteredOrders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center dark:bg-gray-800 dark:border-gray-700">
              <div className="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No orders found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-[#4880FF] dark:text-[#4880FF] hover:text-[#3A6FD9] transition-colors font-medium text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="p-4 border-b-2 border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">Order #{order.id}</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Placed on {order.date}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-nunito-sans ${getOrderStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-3 mb-4">
                    {order.items.map((item) => (
                      <div key={`${item.id}-${item.selectedTier.minQuantity}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center">
                          <img
                            src={products.find(p => p.id === item.id)?.image || '/images/bear-icon.svg'}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity} · ${item.selectedTier.price}/unit
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${(item.selectedTier.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"></path>
                        <path d="M3 7h18"></path>
                        <path d="m7 12 3-3 3 3 4-4"></path>
                      </svg>
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDetailsModal(true);
                        setShowOrderModal(true);
                      }}
                      className="text-sm text-[#4880FF] dark:text-[#4880FF] hover:text-[#3A6FD9] transition-colors font-medium flex items-center gap-1"
                    >
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderAccount = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Management</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 border-b bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center bg-white dark:bg-gray-800">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwr_zZjgvmu4BccwDNIHic8K5dyehw7cSYA&s"
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover bg-blue-100 dark:bg-blue-900"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedCustomer.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer ID: {selectedCustomer.id}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Credit Limit</span>
                  <span className="text-sm font-medium">${selectedCustomer.creditLimit.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Current Balance</span>
                  <span className="text-sm font-medium">${selectedCustomer.currentBalance.toLocaleString('en-US')}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Account Status</span>
                  <span className={`text-sm font-medium ${getAccountStatusColor(selectedCustomer.accountStatus)}`}>
                    ● {selectedCustomer.accountStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Payment Due</span>
                  <span className="text-sm font-medium">{selectedCustomer.paymentDueDate}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Payment History</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">2025-03-01</span>
                    <span className="text-gray-900 dark:text-white font-medium">-$1,500.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">2025-02-15</span>
                    <span className="text-gray-900 dark:text-white font-medium">-$2,000.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">2025-01-30</span>
                    <span className="text-gray-900 dark:text-white font-medium">-$1,750.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl h-full">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Make a Payment</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="paymentAmount" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">$</span>
                      </div>
                      <input
                        type="number"
                        id="paymentAmount"
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2.5 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        min="0"
                        max={selectedCustomer.currentBalance}
                        step="0.01"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const amountInput = e.target as HTMLInputElement;
                            const amount = parseFloat(amountInput.value);
                            if (!isNaN(amount) && amount > 0 && amount <= selectedCustomer.currentBalance) {
                              handlePayInvoice(amount);
                              amountInput.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Max: ${selectedCustomer.currentBalance.toLocaleString('en-US')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const amountInput = document.getElementById('paymentAmount') as HTMLInputElement;
                      const amount = parseFloat(amountInput.value);
                      if (!isNaN(amount) && amount > 0 && amount <= selectedCustomer.currentBalance) {
                        handlePayInvoice(amount);
                        amountInput.value = '';
                      }
                    }}
                    className="w-full py-2.5 px-4 text-white bg-[#4880FF] dark:bg-[#4880FF] font-medium rounded-lg hover:bg-[#3A6FD9] transition-colors"
                  >
                    Submit Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-800">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Statements</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">March 2025 Statement</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Generated on 2025-03-01</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white mr-3">PDF</span>
                <button
                  onClick={showComingSoonToast}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">February 2025 Statement</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Generated on 2025-02-01</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white mr-3">PDF</span>
                <button
                  onClick={showComingSoonToast}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">January 2025 Statement</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Generated on 2025-01-01</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white mr-3">PDF</span>
                <button
                  onClick={showComingSoonToast}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6 font-nunito-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-nunito-sans">Product Management</h1>
        <button
          onClick={showComingSoonToast}
          className="flex items-center gap-2 text-white bg-[#4880FF] dark:bg-[#4880FF] hover:bg-[#3A6FD9] font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Inventory Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-600 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{inventoryData.reduce((sum, item) => sum + item.quantity, 0)}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">Total Units</p>
                    </div>
                    <div className="w-10 h-10 bg-[#E3E8FF] flex items-center justify-center rounded-full ml-2">
                      <svg width="20" height="20" viewBox="0 0 58 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.20833 0.5C8.65516 0.500296 8.1117 0.645482 7.63208 0.921103C7.15245 1.19672 6.75339 1.59317 6.47461 2.07096L0.932943 11.571C0.64988 12.0551 0.500474 12.6058 0.5 13.1667V51.1667C0.5 54.628 3.37197 57.5 6.83333 57.5H51.1667C54.628 57.5 57.5 54.628 57.5 51.1667V13.1667C57.4995 12.6058 57.3501 12.0551 57.0671 11.571L51.5254 2.07096C51.2466 1.59317 50.8475 1.19672 50.3679 0.921103C49.8883 0.645482 49.3448 0.500296 48.7917 0.5H9.20833ZM11.0267 6.83333H46.9733L50.6657 13.1667H7.33431L11.0267 6.83333ZM6.83333 19.5H51.1667V51.1667H6.83333V19.5ZM19.5 25.8333V32.1667H38.5V25.8333H19.5Z" fill="#3D42DF"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-600 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{inventoryData.filter(item => getProductInventoryStatus(getProductById(item.name)!) === 'Low').length}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">Low Stock Items</p>
                    </div>
                    <div className="w-10 h-10 bg-[#FFE3E3] flex items-center justify-center rounded-full ml-2">
                      <svg width="20" height="12" viewBox="0 0 72 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50.3332 43.5L58.539 35.2942L41.0523 17.8075L26.719 32.1408L0.166504 5.5525L5.219 0.5L26.719 22L41.0523 7.66667L63.6273 30.2058L71.8332 22V43.5H50.3332Z" fill="#E78175"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Product Categories</h2>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(inventoryData.map(item => item.category))).map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-nunito-sans"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
  return (
    <>
      <style jsx global>{`
        :root {
          --font-nunito-sans: 'Nunito Sans', sans-serif;
        }
        * {
          font-family: var(--font-nunito-sans) !important;
        }
        .font-nunito-sans {
          font-family: var(--font-nunito-sans);
        }
      `}</style>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${nunitoSans.variable} font-sans`}>
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Hamburger menu button for mobile */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 mr-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <h1 className="text-xl font-bold">
                <span className="text-[#4880FF]">Whole</span>
                <span className="text-gray-900 dark:text-white">sale</span>
              </h1>
            </div>

            <div className="flex items-center space-x-1">
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
              <button 
                className="flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={showComingSoonToast}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBwr_zZjgvmu4BccwDNIHic8K5dyehw7cSYA&s"
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover bg-blue-100 dark:bg-blue-900"
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">John Doe</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 h-full lg:sticky lg:top-20 overflow-y-auto">
              {/* Close button for mobile */}
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
              <nav className="space-y-4">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-[#4880FF] text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg" className={activeTab === 'dashboard' ? 'text-white' : 'text-gray-400'}>
                    <path d="M12.3958 12.6172C20.8073 4.20575 30.842 0 42.5 0C54.1579 0 64.1189 4.20575 72.3829 12.6172C80.7943 20.8811 85 30.842 85 42.5C85 54.1579 80.7943 64.1925 72.3829 72.6044C64.1189 80.868 54.1579 85 42.5 85C30.842 85 20.8073 80.868 12.3958 72.6044C4.13193 64.1925 0 54.1579 0 42.5C0 30.842 4.13193 20.8811 12.3958 12.6172ZM67.5132 17.487C60.5772 10.5512 52.2395 7.08333 42.5 7.08333C32.7604 7.08333 24.4228 10.5512 17.487 17.487C10.5512 24.4228 7.08333 32.7604 7.08333 42.5C7.08333 52.2395 10.5512 60.5772 17.487 67.5132C24.4228 74.4487 32.7604 77.9167 42.5 77.9167C52.2395 77.9167 60.5772 74.4487 67.5132 67.5132C74.4487 60.5772 77.9167 52.2395 77.9167 42.5C77.9167 32.7604 74.4487 24.4228 67.5132 17.487ZM39.8438 11.7318C40.5816 10.9939 41.467 10.625 42.5 10.625C43.533 10.625 44.3446 10.9939 44.9349 11.7318C45.6728 12.3221 46.0417 13.1337 46.0417 14.1667C46.0417 15.1996 45.6728 16.0851 44.9349 16.8229C44.3446 17.4132 43.533 17.7083 42.5 17.7083C41.467 17.7083 40.5816 17.4132 39.8438 16.8229C39.2535 16.0851 38.9583 15.1996 38.9583 14.1667C38.9583 13.1337 39.2535 12.3221 39.8438 11.7318ZM19.9219 20.1432C20.6597 19.4054 21.4714 19.0364 22.3568 19.0364C23.3897 19.0364 24.2752 19.4054 25.013 20.1432C25.7509 20.7335 26.1198 21.5451 26.1198 22.5781C26.1198 23.4636 25.7509 24.2752 25.013 25.013C24.2752 25.7509 23.3897 26.1198 22.3568 26.1198C21.4714 26.1198 20.6597 25.7509 19.9219 25.013C19.3316 24.2752 19.0364 23.4636 19.0364 22.5781C19.0364 21.5451 19.3316 20.7335 19.9219 20.1432ZM59.9868 19.9219L65.0781 25.013L49.3618 40.7292C49.5097 41.3194 49.5833 41.9097 49.5833 42.5C49.5833 44.4184 48.8456 46.1154 47.3698 47.5911C46.0417 48.9193 44.4184 49.5833 42.5 49.5833C40.5816 49.5833 38.8846 48.9193 37.4089 47.5911C36.0807 46.1154 35.4167 44.4184 35.4167 42.5C35.4167 40.5816 36.0807 38.9583 37.4089 37.6302C38.8846 36.1545 40.5816 35.4167 42.5 35.4167C43.0903 35.4167 43.6806 35.4904 44.2708 35.638L59.9868 19.9219ZM11.5104 40.0651C12.2482 39.3272 13.1337 38.9583 14.1667 38.9583C15.1996 38.9583 16.0113 39.3272 16.6016 40.0651C17.3394 40.6554 17.7083 41.467 17.7083 42.5C17.7083 43.533 17.3394 44.4184 16.6016 45.1562C16.0113 45.7465 15.1996 46.0417 14.1667 46.0417C13.1337 46.0417 12.2482 45.7465 11.5104 45.1562C10.9201 44.4184 10.625 43.533 10.625 42.5C10.625 41.467 10.9201 40.6554 11.5104 40.0651ZM68.1772 40.0651C68.9149 39.3272 69.8005 38.9583 70.8333 38.9583C71.8662 38.9583 72.6781 39.3272 73.2685 40.0651C74.0061 40.6554 74.375 41.467 74.375 42.5C74.375 43.533 74.0061 44.4184 73.2685 45.1562C72.6781 45.7465 71.8662 46.0417 70.8333 46.0417C69.8005 46.0417 68.9149 45.7465 68.1772 45.1562C67.5868 44.4184 67.2917 43.533 67.2917 42.5C67.2917 41.467 67.5868 40.6554 68.1772 40.0651ZM19.9219 59.9868C20.6597 59.2491 21.4714 58.8803 22.3568 58.8803C23.3897 58.8803 24.2752 59.2491 25.013 59.9868C25.7509 60.725 26.1198 61.6101 26.1198 62.6435C26.1198 63.5285 25.7509 64.3404 25.013 65.0781C24.2752 65.6684 23.3897 65.9636 22.3568 65.9636C21.4714 65.9636 20.6597 65.6684 19.9219 65.0781C19.3316 64.3404 19.0364 63.5285 19.0364 62.6435C19.0364 61.6101 19.3316 60.725 19.9219 59.9868ZM59.9868 59.9868C60.725 59.2491 61.5364 58.8803 62.4219 58.8803C63.4548 58.8803 64.2667 59.2491 64.8565 59.9868C65.5948 60.725 65.9636 61.6101 65.9636 62.6435C65.9636 63.5285 65.5948 64.3404 64.8565 65.0781C64.2667 65.6684 63.4548 65.9636 62.4219 65.9636C61.5364 65.9636 60.725 65.6684 59.9868 65.0781C59.2491 64.3404 58.8803 63.5285 58.8803 62.6435C58.8803 61.6101 59.2491 60.725 59.9868 59.9868Z" fill="currentColor"/>
                  </svg>
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab('catalog');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'catalog'
                      ? 'bg-[#4880FF] text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg width="20" height="23" viewBox="0 0 71 83" fill="none" xmlns="http://www.w3.org/2000/svg" className={activeTab === 'catalog' ? 'text-white' : 'text-gray-400'}>
                    <path d="M0.245605 0.5H3.77477H67.2998H70.8289V3.9375V79.5625V83H67.2998H3.77477H0.245605V79.5625V3.9375V0.5ZM7.30394 7.375V24.5625H63.7706V7.375H7.30394ZM7.30394 31.4375V52.0625H63.7706V31.4375H7.30394ZM7.30394 58.9375V76.125H63.7706V58.9375H7.30394Z" fill="currentColor"/>
                  </svg>
                  Product Catalog
                </button>
                <button
                  onClick={() => {
                    setActiveTab('orders');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-[#4880FF] text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg width="21" height="20" viewBox="0 0 87 82" fill="none" xmlns="http://www.w3.org/2000/svg" className={activeTab === 'orders' ? 'text-white' : 'text-gray-400'}>
                    <path d="M22.3561 0.90918L27.7415 6.38767L13.3804 20.997L10.6877 23.2798L7.99504 20.997L0.814453 13.6924L6.19984 8.21389L10.6877 13.0076L22.3561 0.90918ZM39.4099 7.30078H86.0835V14.6055H39.4099V7.30078ZM22.3561 30.128L27.7415 35.6064L13.3804 50.2158L10.6877 52.4985L7.99504 50.2158L0.814453 42.9111L6.19984 37.4326L10.6877 42.2263L22.3561 30.128ZM39.4099 36.5195H86.0835V43.8242H39.4099V36.5195ZM22.3561 59.3468L27.7415 64.8251L13.3804 79.4344L10.6877 81.7172L7.99504 79.4344L0.814453 72.1298L6.19984 66.6515L10.6877 71.445L22.3561 59.3468ZM39.4099 65.7383H86.0835V73.043H39.4099V65.7383Z" fill="currentColor"/>
                  </svg>
                  Order History
                </button>
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === 'products'
                      ? 'bg-[#4880FF] text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg width="20" height="20" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg" className={activeTab === 'products' ? 'text-white' : 'text-gray-400'}>
                    <path d="M0.433594 0.0429688H4.25781H80.7422H84.5664V3.86719V80.3516V84.1758H80.7422H4.25781H0.433594V80.3516V3.86719V0.0429688ZM8.08203 7.69141V38.2852H38.6758V7.69141H8.08203ZM46.3242 7.69141V38.2852H76.918V7.69141H46.3242ZM8.08203 45.9336V76.5273H38.6758V45.9336H8.08203ZM46.3242 45.9336V76.5273H76.918V45.9336H46.3242Z" fill="currentColor"/>
                  </svg>
                  Products
                </button>
                <div className="pt-8">
                  <button
                    onClick={() => {
                      setActiveTab('account');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-colors ${
                      activeTab === 'account'
                        ? 'bg-[#4880FF] text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                                      <svg width="18" height="20" viewBox="0 0 73 81" fill="none" xmlns="http://www.w3.org/2000/svg" className={activeTab === 'account' ? 'text-white' : 'text-gray-400'}>
                    <path d="M18.6347 7.52906C23.6133 2.50708 29.5726 -0.00390625 36.5125 -0.00390625C43.4525 -0.00390625 49.4118 2.50708 54.3902 7.52906C59.3688 12.551 61.8584 18.5622 61.8584 25.5625C61.8584 29.8235 60.8024 33.8564 58.6899 37.6609C56.7286 41.4654 54.0131 44.5091 50.5432 46.7917C57.1816 49.6832 62.5372 54.1724 66.6105 60.2595C70.6842 66.1946 72.7209 72.891 72.7209 80.3477H65.4792C65.4792 72.2822 62.6125 65.4339 56.8798 59.8032C51.2976 54.0205 44.5085 51.1289 36.5125 51.1289C28.5165 51.1289 21.6521 54.0205 15.919 59.8032C10.3369 65.4339 7.54587 72.2822 7.54587 80.3477H0.304199C0.304199 72.891 2.34092 66.1946 6.41437 60.2595C10.4878 54.1724 15.8436 49.6832 22.4818 46.7917C19.0118 44.5091 16.2208 41.4654 14.1086 37.6609C12.1474 33.8564 11.1667 29.8235 11.1667 25.5625C11.1667 18.5622 13.656 12.551 18.6347 7.52906ZM49.1854 12.7793C45.7155 9.12695 41.4912 7.30078 36.5125 7.30078C31.5339 7.30078 27.2341 9.12695 23.6133 12.7793C20.1434 16.2794 18.4084 20.5405 18.4084 25.5625C18.4084 30.5845 20.1434 34.9216 23.6133 38.574C27.2341 42.0741 31.5339 43.8242 36.5125 43.8242C41.4912 43.8242 45.7155 42.0741 49.1854 38.574C52.806 34.9216 54.6167 30.5845 54.6167 25.5625C54.6167 20.5405 52.806 16.2794 49.1854 12.7793Z" fill="currentColor"/>
                  </svg>
                    Account
                  </button>
                </div>
              </nav>
            </div>
          </div>

          <div className="flex-1">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'catalog' && renderCatalog()}
            {activeTab === 'orders' && renderOrderHistory()}
            {activeTab === 'account' && renderAccount()}
            {activeTab === 'products' && renderProducts()}
          </div>
        </div>
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {showOrderDetailsModal && selectedOrder
                  ? `Order #${selectedOrder.id} Details`
                  : cart.length > 0
                    ? 'Review Order'
                    : 'Add Products to Order'}
              </h2>
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setShowOrderDetailsModal(false);
                }}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            {showOrderDetailsModal && selectedOrder ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-nunito-sans ${getOrderStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Order Date</span>
                    <span className="text-sm font-medium">{selectedOrder.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</span>
                    <span className="text-sm font-medium">{selectedOrder.trackingNumber || 'Not available'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={`${item.id}-${item.selectedTier.minQuantity}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <div className="flex items-center">
                          <img
                            src={products.find(p => p.id === item.id)?.image || '/images/bear-icon.svg'}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity} · ${item.selectedTier.price}/unit
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${(item.selectedTier.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="text-sm font-medium">${(selectedOrder.total / 1.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tax (8%)</span>
                    <span className="text-sm font-medium">${(selectedOrder.total - (selectedOrder.total / 1.08)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.status === 'In Transit' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Shipping Information</h3>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Carrier</span>
                        <span className="text-sm font-medium">United Parcel Service (UPS)</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</span>
                        <span className="text-sm font-medium">{selectedOrder.trackingNumber}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</span>
                        <span className="text-sm font-medium">{selectedOrder.estimatedDelivery}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setShowOrderDetailsModal(false);
                      setShowOrderModal(false);
                    }}
                    className="py-2 px-4 bg-[#4880FF] text-white dark:text-gray-900 font-medium rounded-lg hover:bg-[#3A6FD9] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Your cart is empty. Please add products to continue.</p>
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    setActiveTab('catalog');
                  }}
                  className="py-2 px-4 bg-[#4880FF] text-white dark:text-gray-900 font-medium rounded-lg hover:bg-[#3A6FD9] transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.selectedTier.minQuantity}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex items-center">
                          <img
                            src={products.find(p => p.id === item.id)?.image || '/images/bear-icon.svg'}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover mr-3"
                          />
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity} · ${item.selectedTier.price}/unit
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.selectedTier.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="text-sm font-medium">${calculateCartSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tax (8%)</span>
                    <span className="text-sm font-medium">${calculateCartTax(calculateCartSubtotal()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">${calculateCartTotal().toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Shipping Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="shippingAddress" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Shipping Address
                      </label>
                      <input
                        type="text"
                        id="shippingAddress"
                        placeholder="Enter shipping address"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="shippingMethod" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Shipping Method
                      </label>
                      <select
                        id="shippingMethod"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="standard">Standard Shipping (3-5 days)</option>
                        <option value="express">Express Shipping (1-2 days)</option>
                        <option value="overnight">Overnight Shipping</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="py-2 px-4 text-gray-600 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="py-2 px-4 bg-[#4880FF] text-white font-medium rounded-lg hover:bg-[#3A6FD9] transition-colors"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Toast "Coming Soon" */}



      <Toaster 
        toastOptions={{
          classNames: {
            toast: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg",
            description: "text-gray-600 dark:text-gray-300",
            actionButton: "bg-blue-600 text-white hover:bg-blue-700",
            cancelButton: "bg-gray-200 text-gray-800 hover:bg-gray-300",
          },
        }}
      />
    </div>
    </>
  );
}
