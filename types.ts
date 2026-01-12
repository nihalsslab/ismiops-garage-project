
export enum JobStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  FINISHED = 'Finished'
}

export enum PaymentStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  ADVANCE = 'Advance'
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockQty: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

// Categories as requested
export const SERVICE_CATEGORIES = [
  'General Service', 'Engine Labour', 'Brake Labour', 'Clutch Labour', 'Suspension Labour', 'Electrical Labour', 'AC Service Labour', 'Wheel Alignment / Balancing', 'Washing / Detailing', 'Inspection / Diagnosis', // Labour
  'Engine Parts', 'Brake Parts', 'Clutch Parts', 'Suspension Parts', 'Electrical Parts', 'AC Parts', 'Filters (Oil / Air / Fuel / AC)', 'Belts & Hoses', 'Battery', 'Tyres', // Parts
  'Engine Oil', 'Gear Oil', 'Brake Oil', 'Coolant', 'Power Steering Oil', 'Grease', 'Washer Fluid', // Fluids
  'Pickup & Drop', 'Emergency Service', 'Outside Work', // Extra
  'Other'
] as const;

export type ServiceCategory = typeof SERVICE_CATEGORIES[number];

export interface LineItem {
  id: string;
  description: string;
  category: ServiceCategory;
  type: 'Part' | 'Labour' | 'Fluid' | 'Other';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface JobCard {
  id: string;
  date: string;
  customerName: string;
  phone: string;
  vehicle: string;
  brand: string;
  model: string;
  numberPlate: string;
  fuelType?: string;
  fuelLevel?: number;
  vehicleImages?: string[];
  status: JobStatus;
  paymentStatus: PaymentStatus;
  advanceAmount?: number;
  complaints: string[];
  notes?: string;
  lineItems?: LineItem[]; // New field for detailed invoice
  totalAmount: number;
}

export interface VehicleBrand {
  name: string;
  logo: string;
  models: VehicleModel[];
}

export interface VehicleModel {
  name: string;
  type: string;
  fuel: string;
  image: string;
}
