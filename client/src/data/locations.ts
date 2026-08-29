export interface LocationOption {
  id: string;
  name: string;
  area: string;
  city: string;
  zipCode: string;
  estimatedTime: string;
  distance?: string;
  landmark?: string;
  popular?: boolean;
}

export interface SavedAddress {
  id: string;
  type: "home" | "work" | "other";
  title: string;
  address: string;
  area: string;
}

export const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: "saved-1",
    type: "home",
    title: "Home",
    address: "Flat 402, Green Avenue, Vesu Canal Road",
    area: "Vesu"
  },
  {
    id: "saved-2",
    type: "work",
    title: "Work",
    address: "Office 708, Silicon Shoppers, VIP Road",
    area: "VIP Road, Vesu"
  },
  {
    id: "saved-3",
    type: "other",
    title: "Other",
    address: "12 Sunset Villas, Near Science Centre",
    area: "City Light"
  }
];

export const POPULAR_LOCATIONS: LocationOption[] = [
  { id: '1', name: 'Vesu Main Road, Near Shoppers Plaza', area: 'Vesu', city: 'Surat', zipCode: '395007', estimatedTime: '15-20 mins', distance: '1.2 km', landmark: 'Shoppers Plaza', popular: true },
  { id: '2', name: 'VIP Road, Opp. VR Mall', area: 'Vesu', city: 'Surat', zipCode: '395007', estimatedTime: '20-25 mins', distance: '2.1 km', landmark: 'VR Mall', popular: true },
  { id: '3', name: 'Vesu Canal Road, Near Valentine Multiplex', area: 'Vesu', city: 'Surat', zipCode: '395007', estimatedTime: '15-22 mins', distance: '1.8 km', landmark: 'Valentine Multiplex', popular: true },
  { id: '4', name: 'Ghod Dod Road, Near Circle', area: 'Athwa', city: 'Surat', zipCode: '395001', estimatedTime: '20-25 mins', distance: '3.4 km', landmark: 'St. Xavier High School', popular: true },
  { id: '5', name: 'City Light Town, Science Centre Road', area: 'City Light', city: 'Surat', zipCode: '395007', estimatedTime: '15-20 mins', distance: '2.5 km', landmark: 'Science Centre', popular: true },
  { id: '6', name: 'Piplod Canal Road, Near SVNIT Campus', area: 'Piplod', city: 'Surat', zipCode: '395007', estimatedTime: '15-25 mins', distance: '2.8 km', landmark: 'SVNIT Gate 1', popular: true },
  { id: '7', name: 'Adajan Gam, Near Honey Park Road', area: 'Adajan', city: 'Surat', zipCode: '395009', estimatedTime: '25-35 mins', distance: '6.2 km', landmark: 'Honey Park Garden', popular: true },
  { id: '8', name: 'LP Savani Circle, Opp. Prime Shoppers', area: 'Adajan', city: 'Surat', zipCode: '395009', estimatedTime: '25-30 mins', distance: '6.8 km', landmark: 'Prime Shoppers', popular: true },
  { id: '9', name: 'Palanpur Jakatnaka, Rander Road', area: 'Adajan', city: 'Surat', zipCode: '395009', estimatedTime: '30-40 mins', distance: '7.5 km', landmark: 'Palanpur Circle', popular: true },
  { id: '10', name: 'Althan Canal Road, Near Tenement', area: 'Althan', city: 'Surat', zipCode: '395017', estimatedTime: '20-30 mins', distance: '3.9 km', landmark: 'Althan BRTS Stand', popular: true },
  { id: '11', name: 'Bhatar Road, Near Breadliner Circle', area: 'Bhatar', city: 'Surat', zipCode: '395017', estimatedTime: '20-25 mins', distance: '4.1 km', landmark: 'Breadliner Circle', popular: true },
  { id: '12', name: 'Dumas Road, Near Airport Circle', area: 'Dumas', city: 'Surat', zipCode: '395007', estimatedTime: '25-35 mins', distance: '5.6 km', landmark: 'Surat Airport Gate', popular: true },
  { id: '13', name: 'Ring Road, Majura Gate', area: 'Ring Road', city: 'Surat', zipCode: '395002', estimatedTime: '20-25 mins', distance: '5.0 km', landmark: 'Majura Gate Flyover', popular: true },
  { id: '14', name: 'Varachha Main Road, Poddar Arcade', area: 'Varachha', city: 'Surat', zipCode: '395006', estimatedTime: '35-45 mins', distance: '9.2 km', landmark: 'Poddar Arcade', popular: true },
  { id: '15', name: 'Katargam Darwaja, Gotalawadi', area: 'Katargam', city: 'Surat', zipCode: '395004', estimatedTime: '35-45 mins', distance: '10.5 km', landmark: 'Gotalawadi Circle', popular: true },
  { id: '16', name: 'Jahangirpura, Opp. D-Mart', area: 'Rander', city: 'Surat', zipCode: '395005', estimatedTime: '35-45 mins', distance: '11.0 km', landmark: 'D-Mart Jahangirpura', popular: true },
  { id: '17', name: 'Nanpura Main Bazaar, Chowk', area: 'Nanpura', city: 'Surat', zipCode: '395001', estimatedTime: '20-30 mins', distance: '5.8 km', landmark: 'Gandhi Smriti Bhavan', popular: true },
  { id: '18', name: 'University Road, VNSGU Campus', area: 'Vesu', city: 'Surat', zipCode: '395007', estimatedTime: '15-20 mins', distance: '1.5 km', landmark: 'VNSGU Main Gate', popular: true },
  { id: '19', name: 'Pal Umra Bridge, Near Gaurav Path', area: 'Pal', city: 'Surat', zipCode: '395009', estimatedTime: '20-30 mins', distance: '4.5 km', landmark: 'Gaurav Path BRTS', popular: true },
  { id: '20', name: 'Parvat Patiya, Model Town Road', area: 'Dumbhal', city: 'Surat', zipCode: '395010', estimatedTime: '30-40 mins', distance: '8.4 km', landmark: 'Model Town Circle', popular: true }
];

