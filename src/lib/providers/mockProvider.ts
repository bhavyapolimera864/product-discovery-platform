import { Product, ProductCategory, ProductProvider } from "@/types";

/**
 * Mock product provider for development and testing.
 * This simulates a real product API with realistic data.
 * 
 * WARNING: This data is for development/testing only.
 * In production, connect to real product data providers.
 */

const MOCK_LAPTOPS: Product[] = [
  {
    id: "mock_laptop_001",
    productId: "dell_xps_13_9320",
    name: "Dell XPS 13 (9320)",
    brand: "Dell",
    category: "laptops",
    description:
      "Ultra-thin laptop with FHD display, Intel Core i5, 8GB RAM, 512GB SSD",
    price: 999,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=Dell+XPS+13",
    productUrl: "https://example.com/laptops/dell-xps-13",
    specifications: {
      cpu: "Intel Core i5-1240P",
      ram: 8,
      storage: 512,
      storageType: "SSD",
      display: "13.3 FHD (1920x1200)",
      batteryLife: "12h",
      weight: "2.8 lbs",
      os: "Windows 11",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.5,
    reviewCount: 2847,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
  {
    id: "mock_laptop_002",
    productId: "macbook_air_m2",
    name: "MacBook Air M2",
    brand: "Apple",
    category: "laptops",
    description: "Lightweight laptop with Apple M2 chip, 8GB RAM, 256GB SSD",
    price: 1199,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=MacBook+Air+M2",
    productUrl: "https://example.com/laptops/macbook-air-m2",
    specifications: {
      cpu: "Apple M2",
      ram: 8,
      storage: 256,
      storageType: "SSD",
      display: "13.6 Liquid Retina",
      batteryLife: "15h",
      weight: "2.7 lbs",
      os: "macOS",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.8,
    reviewCount: 5234,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
  {
    id: "mock_laptop_003",
    productId: "lenovo_thinkpad_e14",
    name: "Lenovo ThinkPad E14",
    brand: "Lenovo",
    category: "laptops",
    description:
      "Business laptop with Intel Core i7, 16GB RAM, 512GB SSD, great for professionals",
    price: 849,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=Lenovo+ThinkPad",
    productUrl: "https://example.com/laptops/lenovo-thinkpad-e14",
    specifications: {
      cpu: "Intel Core i7-1260P",
      ram: 16,
      storage: 512,
      storageType: "SSD",
      display: "14 FHD",
      batteryLife: "11h",
      weight: "3.3 lbs",
      os: "Windows 11",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.4,
    reviewCount: 1923,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
  {
    id: "mock_laptop_004",
    productId: "asus_vivobook_15",
    name: "ASUS VivoBook 15",
    brand: "ASUS",
    category: "laptops",
    description:
      "Budget-friendly laptop with AMD Ryzen 5, 8GB RAM, 256GB SSD",
    price: 499,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=ASUS+VivoBook",
    productUrl: "https://example.com/laptops/asus-vivobook-15",
    specifications: {
      cpu: "AMD Ryzen 5 5500U",
      ram: 8,
      storage: 256,
      storageType: "SSD",
      display: "15.6 FHD",
      batteryLife: "8h",
      weight: "3.6 lbs",
      os: "Windows 11",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.2,
    reviewCount: 3421,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
];

const MOCK_SMARTPHONES: Product[] = [
  {
    id: "mock_phone_001",
    productId: "iphone_14_pro",
    name: "iPhone 14 Pro",
    brand: "Apple",
    category: "smartphones",
    description:
      "Flagship smartphone with A16 Bionic chip, 128GB storage, ProMotion display",
    price: 999,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=iPhone+14+Pro",
    productUrl: "https://example.com/phones/iphone-14-pro",
    specifications: {
      cpu: "Apple A16 Bionic",
      ram: 6,
      storage: 128,
      display: "6.1 OLED Super Retina",
      battery: "3200mAh",
      camera: "48MP Main",
      os: "iOS 16",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.7,
    reviewCount: 12400,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
  {
    id: "mock_phone_002",
    productId: "samsung_s23_ultra",
    name: "Samsung Galaxy S23 Ultra",
    brand: "Samsung",
    category: "smartphones",
    description:
      "Premium flagship with Snapdragon 8 Gen 2, 12GB RAM, 200MP camera",
    price: 1199,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=Samsung+S23+Ultra",
    productUrl: "https://example.com/phones/samsung-s23-ultra",
    specifications: {
      cpu: "Snapdragon 8 Gen 2",
      ram: 12,
      storage: 256,
      display: "6.8 AMOLED Dynamic",
      battery: "5000mAh",
      camera: "200MP Main",
      os: "Android 13",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.6,
    reviewCount: 8900,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
  {
    id: "mock_phone_003",
    productId: "google_pixel_7",
    name: "Google Pixel 7",
    brand: "Google",
    category: "smartphones",
    description:
      "Mid-range flagship killer with Tensor chip, excellent computational photography",
    price: 599,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=Google+Pixel+7",
    productUrl: "https://example.com/phones/google-pixel-7",
    specifications: {
      cpu: "Google Tensor",
      ram: 8,
      storage: 128,
      display: "6.3 OLED",
      battery: "4003mAh",
      camera: "50MP Main",
      os: "Android 13",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.5,
    reviewCount: 6200,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
];

const MOCK_HEADPHONES: Product[] = [
  {
    id: "mock_headphones_001",
    productId: "sony_wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "headphones",
    description:
      "Industry-leading noise cancellation, 30-hour battery life, premium sound quality",
    price: 399,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=Sony+WH-1000XM5",
    productUrl: "https://example.com/headphones/sony-wh1000xm5",
    specifications: {
      type: "Over-ear",
      noiseCancel: "Yes (ANC)",
      batteryLife: "30h",
      connectivity: "Bluetooth 5.3",
      weight: "250g",
      driverSize: "40mm",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.8,
    reviewCount: 9800,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
  {
    id: "mock_headphones_002",
    productId: "bose_qc45",
    name: "Bose QuietComfort 45",
    brand: "Bose",
    category: "headphones",
    description:
      "Comfortable noise-cancelling headphones with exceptional sound quality",
    price: 379,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=Bose+QC45",
    productUrl: "https://example.com/headphones/bose-qc45",
    specifications: {
      type: "Over-ear",
      noiseCancel: "Yes",
      batteryLife: "24h",
      connectivity: "Bluetooth 5.3",
      weight: "238g",
      driverSize: "Dual",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.5,
    reviewCount: 5600,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
];

const MOCK_CAMERAS: Product[] = [
  {
    id: "mock_camera_001",
    productId: "sony_a6400",
    name: "Sony a6400",
    brand: "Sony",
    category: "cameras",
    description:
      "Mirrorless camera with 24.2MP sensor, fast autofocus, 4K video recording",
    price: 898,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=Sony+a6400",
    productUrl: "https://example.com/cameras/sony-a6400",
    specifications: {
      sensorType: "APS-C CMOS",
      megapixels: 24.2,
      videoCapability: "4K UHD",
      autofocus: "Fast Eye-AF",
      weight: "403g",
      weatherSealed: "Yes",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.7,
    reviewCount: 4300,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
];

const MOCK_APPLIANCES: Product[] = [
  {
    id: "mock_appliance_001",
    productId: "dyson_v15",
    name: "Dyson V15 Detect Cordless Vacuum",
    brand: "Dyson",
    category: "appliances",
    description:
      "Lightweight cordless vacuum with laser dust detection, up to 60 minutes runtime",
    price: 749,
    currency: "USD",
    imageUrl:
      "https://via.placeholder.com/300x300?text=Dyson+V15",
    productUrl: "https://example.com/appliances/dyson-v15",
    specifications: {
      type: "Cordless Stick",
      runtimeMinutes: 60,
      dustCapacity: "0.5L",
      weight: "3.6 lbs",
      modes: 3,
      laserTech: "Yes",
    },
    source: "mock",
    availability: "in_stock",
    inStock: true,
    rating: 4.6,
    reviewCount: 3200,
    status: "current",
    dataFreshness: "fresh",
    lastUpdated: new Date(),
  },
];

class MockProductProvider implements ProductProvider {
  name = "mock";
  category: ProductCategory = "laptops";

  private getAllProducts(): Product[] {
    return [
      ...MOCK_LAPTOPS,
      ...MOCK_SMARTPHONES,
      ...MOCK_HEADPHONES,
      ...MOCK_CAMERAS,
      ...MOCK_APPLIANCES,
    ];
  }

  async search(query: string, limit: number = 20): Promise<Product[]> {
    const queryLower = query.toLowerCase();
    const allProducts = this.getAllProducts();

    // Simple keyword search in name, brand, and description
    const results = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.brand?.toLowerCase().includes(queryLower) ||
        p.description?.toLowerCase().includes(queryLower)
    );

    return results.slice(0, limit);
  }

  async getProduct(productId: string): Promise<Product | null> {
    const allProducts = this.getAllProducts();
    return allProducts.find((p) => p.productId === productId) || null;
  }

  async getCategories(): Promise<ProductCategory[]> {
    return ["laptops", "smartphones", "headphones", "appliances", "cameras"];
  }
}

export const mockProvider = new MockProductProvider();
