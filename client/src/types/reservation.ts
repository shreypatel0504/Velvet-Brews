export interface Reservation {
  id?: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  seatingArea?: string;
  specialRequests?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  location: string;
  status: 'available' | 'occupied' | 'reserved';
}
