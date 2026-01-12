
import { JobStatus, PaymentStatus, JobCard, Part, VehicleBrand } from './types';

// Brand Logos - Mapped to actual existing files
import toyotaLogo from './assets/brands/toyota.svg';
import hyundaiLogo from './assets/brands/hyundai.webp';
import hondaLogo from './assets/brands/honda.svg';
import marutiLogo from './assets/brands/Maruti Suzuki.webp';
import tataLogo from './assets/brands/tata.svg';
import mahindraLogo from './assets/brands/Mahindra.webp';
import kiaLogo from './assets/brands/Kia.webp';
import bmwLogo from './assets/brands/bmw.svg';
import renaultLogo from './assets/brands/Renault.webp';
import nissanLogo from './assets/brands/Nissan.webp';
import vwLogo from './assets/brands/Volkswagen.webp';
import skodaLogo from './assets/brands/Skoda.webp';
import mgLogo from './assets/brands/MG.webp';
import fordLogo from './assets/brands/Ford.webp';
import chevroletLogo from './assets/brands/Chevrolet.webp';
import fiatLogo from './assets/brands/Fiat.webp';
import jeepLogo from './assets/brands/Jeep.webp';
import forceLogo from './assets/brands/Force Motors.webp';

// Missing local assets - Using URLs
const mercedesLogo = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/1024px-Mercedes-Logo.svg.png';


// Helper for placeholder images
const getImg = (name: string) => `https://placehold.co/400x300/e2e8f0/1e293b?text=${name.replace(' ', '+')}`;

// Model Images (Reuse locally where available, else placeholder)
// Toyota
import fortunerImg from './assets/models/fortuner.jpeg';
import innovaImg from './assets/models/innova.jpeg';
import glanzaImg from './assets/models/glanza.jpeg';
// Hyundai
import cretaImg from './assets/models/creta.jpeg';
import vernaImg from './assets/models/verna.jpeg';
import i20Img from './assets/models/i20.jpeg';
import venueImg from './assets/models/venue.jpeg';
// Honda
import cityImg from './assets/models/city.jpeg';
import amazeImg from './assets/models/amaze.jpeg';
// Maruti
import swiftImg from './assets/models/swift.jpeg';
import balenoImg from './assets/models/baleno.jpeg';
import dzireImg from './assets/models/dzire.jpeg';
import brezzaImg from './assets/models/brezza.jpeg';
import ertigaImg from './assets/models/ertiga.jpeg';
// Tata
import nexonImg from './assets/models/nexon.jpeg';
import harrierImg from './assets/models/harrier.jpeg';
import safariImg from './assets/models/safari.jpeg';
import tiagoImg from './assets/models/tiago.jpeg';
// Mahindra
import xuv700Img from './assets/models/xuv700.jpeg';
import scorpioImg from './assets/models/scorpio.jpeg';
import tharImg from './assets/models/thar.jpeg';
import boleroImg from './assets/models/bolero.jpeg';
// Kia
import seltosImg from './assets/models/seltos.jpeg';
import sonetImg from './assets/models/sonet.jpeg';


export const MOCK_JOBS: JobCard[] = [];
export const MOCK_INVENTORY: Part[] = [];

export const VEHICLE_BRANDS: VehicleBrand[] = [
  {
    name: 'Maruti Suzuki',
    logo: marutiLogo,
    models: [
      { name: 'Alto', type: 'Hatchback', fuel: 'Petrol', image: getImg('Alto') },
      { name: 'Alto K10', type: 'Hatchback', fuel: 'Petrol', image: getImg('Alto+K10') },
      { name: 'WagonR', type: 'Hatchback', fuel: 'Petrol/CNG', image: getImg('WagonR') },
      { name: 'Swift', type: 'Hatchback', fuel: 'Petrol', image: swiftImg },
      { name: 'Dzire', type: 'Sedan', fuel: 'Petrol/CNG', image: dzireImg },
      { name: 'Baleno', type: 'Hatchback', fuel: 'Petrol/CNG', image: balenoImg },
      { name: 'Celerio', type: 'Hatchback', fuel: 'Petrol', image: getImg('Celerio') },
      { name: 'S-Presso', type: 'Hatchback', fuel: 'Petrol', image: getImg('S-Presso') },
      { name: 'Eeco', type: 'Van', fuel: 'Petrol/CNG', image: getImg('Eeco') },
      { name: 'Ertiga', type: 'MPV', fuel: 'Petrol/CNG', image: ertigaImg },
      { name: 'Brezza', type: 'SUV', fuel: 'Petrol', image: brezzaImg },
      { name: 'Ciaz', type: 'Sedan', fuel: 'Petrol', image: getImg('Ciaz') },
    ]
  },
  {
    name: 'Hyundai',
    logo: hyundaiLogo,
    models: [
      { name: 'i10', type: 'Hatchback', fuel: 'Petrol', image: getImg('i10') },
      { name: 'Grand i10', type: 'Hatchback', fuel: 'Petrol/Diesel', image: getImg('Grand+i10') },
      { name: 'i20', type: 'Hatchback', fuel: 'Petrol', image: i20Img },
      { name: 'Santro', type: 'Hatchback', fuel: 'Petrol', image: getImg('Santro') },
      { name: 'Aura', type: 'Sedan', fuel: 'Petrol/CNG', image: getImg('Aura') },
      { name: 'Xcent', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Xcent') },
      { name: 'Verna', type: 'Sedan', fuel: 'Petrol', image: vernaImg },
      { name: 'Creta', type: 'SUV', fuel: 'Diesel/Petrol', image: cretaImg },
      { name: 'Venue', type: 'SUV', fuel: 'Petrol', image: venueImg },
      { name: 'Eon', type: 'Hatchback', fuel: 'Petrol', image: getImg('Eon') },
    ]
  },
  {
    name: 'Tata',
    logo: tataLogo,
    models: [
      { name: 'Indica', type: 'Hatchback', fuel: 'Diesel', image: getImg('Indica') },
      { name: 'Indigo', type: 'Sedan', fuel: 'Diesel', image: getImg('Indigo') },
      { name: 'Tiago', type: 'Hatchback', fuel: 'Petrol/EV', image: tiagoImg },
      { name: 'Tigor', type: 'Sedan', fuel: 'Petrol/EV', image: getImg('Tigor') },
      { name: 'Altroz', type: 'Hatchback', fuel: 'Petrol/Diesel', image: getImg('Altroz') },
      { name: 'Punch', type: 'SUV', fuel: 'Petrol', image: getImg('Punch') },
      { name: 'Nexon', type: 'SUV', fuel: 'Petrol/Diesel/EV', image: nexonImg },
      { name: 'Harrier', type: 'SUV', fuel: 'Diesel', image: harrierImg },
      { name: 'Safari', type: 'SUV', fuel: 'Diesel', image: safariImg },
      { name: 'Sumo', type: 'SUV', fuel: 'Diesel', image: getImg('Sumo') },
    ]
  },
  {
    name: 'Mahindra',
    logo: mahindraLogo,
    models: [
      { name: 'Bolero', type: 'SUV', fuel: 'Diesel', image: boleroImg },
      { name: 'Bolero Neo', type: 'SUV', fuel: 'Diesel', image: getImg('Bolero+Neo') },
      { name: 'Scorpio', type: 'SUV', fuel: 'Diesel', image: scorpioImg },
      { name: 'Scorpio Classic', type: 'SUV', fuel: 'Diesel', image: getImg('Scorpio+Classic') },
      { name: 'XUV300', type: 'SUV', fuel: 'Diesel/Petrol', image: getImg('XUV300') },
      { name: 'XUV500', type: 'SUV', fuel: 'Diesel', image: getImg('XUV500') },
      { name: 'XUV700', type: 'SUV', fuel: 'Diesel/Petrol', image: xuv700Img },
      { name: 'Thar', type: 'SUV', fuel: 'Diesel/Petrol', image: tharImg },
      { name: 'KUV100', type: 'SUV', fuel: 'Diesel/Petrol', image: getImg('KUV100') },
      { name: 'Quanto', type: 'SUV', fuel: 'Diesel', image: getImg('Quanto') },
    ]
  },
  {
    name: 'Toyota',
    logo: toyotaLogo,
    models: [
      { name: 'Innova', type: 'MPV', fuel: 'Diesel', image: innovaImg },
      { name: 'Innova Crysta', type: 'MPV', fuel: 'Diesel', image: innovaImg },
      { name: 'Fortuner', type: 'SUV', fuel: 'Diesel/Petrol', image: fortunerImg },
      { name: 'Etios', type: 'Sedan', fuel: 'Diesel/Petrol', image: getImg('Etios') },
      { name: 'Etios Liva', type: 'Hatchback', fuel: 'Diesel/Petrol', image: getImg('Etios+Liva') },
      { name: 'Glanza', type: 'Hatchback', fuel: 'Petrol', image: glanzaImg },
      { name: 'Urban Cruiser', type: 'SUV', fuel: 'Petrol', image: getImg('Urban+Cruiser') },
      { name: 'Qualis', type: 'MPV', fuel: 'Diesel', image: getImg('Qualis') },
    ]
  },
  {
    name: 'Honda',
    logo: hondaLogo,
    models: [
      { name: 'City', type: 'Sedan', fuel: 'Petrol', image: cityImg },
      { name: 'Amaze', type: 'Compact Sedan', fuel: 'Petrol', image: amazeImg },
      { name: 'Jazz', type: 'Hatchback', fuel: 'Petrol', image: getImg('Jazz') },
      { name: 'Brio', type: 'Hatchback', fuel: 'Petrol', image: getImg('Brio') },
      { name: 'WR-V', type: 'SUV', fuel: 'Petrol/Diesel', image: getImg('WR-V') },
      { name: 'Civic', type: 'Sedan', fuel: 'Petrol', image: getImg('Civic') },
      { name: 'Accord', type: 'Sedan', fuel: 'Hybrid', image: getImg('Accord') },
    ]
  },
  {
    name: 'Kia',
    logo: kiaLogo,
    models: [
      { name: 'Seltos', type: 'SUV', fuel: 'Diesel/Petrol', image: seltosImg },
      { name: 'Sonet', type: 'SUV', fuel: 'Diesel/Petrol', image: sonetImg },
      { name: 'Carens', type: 'MPV', fuel: 'Diesel/Petrol', image: getImg('Carens') },
      { name: 'Carnival', type: 'MPV', fuel: 'Diesel', image: getImg('Carnival') },
    ]
  },
  {
    name: 'Renault',
    logo: renaultLogo,
    models: [
      { name: 'Kwid', type: 'Hatchback', fuel: 'Petrol', image: getImg('Kwid') },
      { name: 'Triber', type: 'MPV', fuel: 'Petrol', image: getImg('Triber') },
      { name: 'Duster', type: 'SUV', fuel: 'Diesel/Petrol', image: getImg('Duster') },
      { name: 'Lodgy', type: 'MPV', fuel: 'Diesel', image: getImg('Lodgy') },
    ]
  },
  {
    name: 'Nissan',
    logo: nissanLogo,
    models: [
      { name: 'Micra', type: 'Hatchback', fuel: 'Petrol/Diesel', image: getImg('Micra') },
      { name: 'Sunny', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Sunny') },
      { name: 'Terrano', type: 'SUV', fuel: 'Diesel', image: getImg('Terrano') },
      { name: 'Magnite', type: 'SUV', fuel: 'Petrol', image: getImg('Magnite') },
    ]
  },
  {
    name: 'Volkswagen',
    logo: vwLogo,
    models: [
      { name: 'Polo', type: 'Hatchback', fuel: 'Petrol/Diesel', image: getImg('Polo') },
      { name: 'Vento', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Vento') },
      { name: 'Ameo', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Ameo') },
      { name: 'Taigun', type: 'SUV', fuel: 'Petrol', image: getImg('Taigun') },
      { name: 'Jetta', type: 'Sedan', fuel: 'Diesel', image: getImg('Jetta') },
    ]
  },
  {
    name: 'Skoda',
    logo: skodaLogo,
    models: [
      { name: 'Rapid', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Rapid') },
      { name: 'Octavia', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Octavia') },
      { name: 'Superb', type: 'Sedan', fuel: 'Petrol', image: getImg('Superb') },
      { name: 'Fabia', type: 'Hatchback', fuel: 'Petrol/Diesel', image: getImg('Fabia') },
      { name: 'Kushaq', type: 'SUV', fuel: 'Petrol', image: getImg('Kushaq') },
    ]
  },
  {
    name: 'MG',
    logo: mgLogo,
    models: [
      { name: 'Hector', type: 'SUV', fuel: 'Petrol/Diesel', image: getImg('Hector') },
      { name: 'Hector Plus', type: 'SUV', fuel: 'Petrol/Diesel', image: getImg('Hector+Plus') },
      { name: 'Astor', type: 'SUV', fuel: 'Petrol', image: getImg('Astor') },
      { name: 'ZS EV', type: 'SUV', fuel: 'EV', image: getImg('ZS+EV') },
      { name: 'Gloster', type: 'SUV', fuel: 'Diesel', image: getImg('Gloster') },
    ]
  },
  {
    name: 'Ford',
    logo: fordLogo,
    models: [
      { name: 'Figo', type: 'Hatchback', fuel: 'Petrol/Diesel', image: getImg('Figo') },
      { name: 'Aspire', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Aspire') },
      { name: 'EcoSport', type: 'SUV', fuel: 'Petrol/Diesel', image: getImg('EcoSport') },
      { name: 'Endeavour', type: 'SUV', fuel: 'Diesel', image: getImg('Endeavour') },
      { name: 'Fiesta', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Fiesta') },
    ]
  },
  {
    name: 'Chevrolet',
    logo: chevroletLogo,
    models: [
      { name: 'Beat', type: 'Hatchback', fuel: 'Petrol/Diesel', image: getImg('Beat') },
      { name: 'Spark', type: 'Hatchback', fuel: 'Petrol', image: getImg('Spark') },
      { name: 'Enjoy', type: 'MPV', fuel: 'Diesel', image: getImg('Enjoy') },
      { name: 'Cruze', type: 'Sedan', fuel: 'Diesel', image: getImg('Cruze') },
      { name: 'Tavera', type: 'MPV', fuel: 'Diesel', image: getImg('Tavera') },
    ]
  },
  {
    name: 'Fiat',
    logo: fiatLogo,
    models: [
      { name: 'Punto', type: 'Hatchback', fuel: 'Petrol/Diesel', image: getImg('Punto') },
      { name: 'Linea', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('Linea') },
      { name: 'Palio', type: 'Hatchback', fuel: 'Petrol', image: getImg('Palio') },
    ]
  },
  {
    name: 'Jeep',
    logo: jeepLogo,
    models: [
      { name: 'Compass', type: 'SUV', fuel: 'Petrol/Diesel', image: getImg('Compass') },
      { name: 'Meridian', type: 'SUV', fuel: 'Diesel', image: getImg('Meridian') },
    ]
  },
  {
    name: 'Force Motors',
    logo: forceLogo,
    models: [
      { name: 'Traveller', type: 'Van', fuel: 'Diesel', image: getImg('Traveller') },
      { name: 'Gurkha', type: 'SUV', fuel: 'Diesel', image: getImg('Gurkha') },
      { name: 'Trax', type: 'SUV', fuel: 'Diesel', image: getImg('Trax') },
    ]
  },
  {
    name: 'BMW',
    logo: bmwLogo,
    models: [
      { name: '3 Series', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('3+Series') },
      { name: 'X1', type: 'SUV', fuel: 'Petrol/Diesel', image: getImg('X1') }
    ]
  },
  {
    name: 'Mercedes-Benz',
    logo: mercedesLogo,
    models: [
      { name: 'C-Class', type: 'Sedan', fuel: 'Petrol/Diesel', image: getImg('C-Class') }
    ]
  }
];
