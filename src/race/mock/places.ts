/**
 * Countries and cities for the race preview's dummy walkers (design only: real walkers come from the race API).
 * `atlas` is the country's id in world-atlas/countries-110m.json, `w` its share of dummy walkers, `tz` the UTC offset in
 * minutes in mid-October. Cities are [slug, name, lat, lng, weight, tz override].
 * A city is not part of the race contract yet (CONTRACT.md has country only); city boards need a new decision.
 */
export type Region = 'southAsia' | 'eastAsia' | 'korea' | 'japan' | 'seAsia' | 'anglo' | 'westEurope' | 'nordic' | 'eastEurope' | 'latam' | 'brazil' | 'mena' | 'africa' | 'centralAsia';

export interface City { id: string; slug: string; name: string; lat: number; lng: number; w: number; tz: number }
export interface Country { cc: string; atlas: string; name: string; short: string; w: number; region: Region; cities: City[] }

type CityRow = [slug: string, name: string, lat: number, lng: number, w: number, tz?: number];

const rows: [cc: string, atlas: string, name: string, w: number, region: Region, tz: number, cities: CityRow[]][] = [
  ['IN', '356', 'India', 22, 'southAsia', 330, [
    ['mumbai', 'Mumbai', 19.08, 72.88, 10], ['delhi', 'Delhi', 28.61, 77.21, 10], ['bengaluru', 'Bengaluru', 12.97, 77.59, 9],
    ['pune', 'Pune', 18.52, 73.86, 7], ['hyderabad', 'Hyderabad', 17.39, 78.49, 7], ['chennai', 'Chennai', 13.08, 80.27, 6],
    ['kolkata', 'Kolkata', 22.57, 88.36, 6], ['ahmedabad', 'Ahmedabad', 23.02, 72.57, 4], ['jaipur', 'Jaipur', 26.91, 75.79, 3],
    ['lucknow', 'Lucknow', 26.85, 80.95, 3], ['kochi', 'Kochi', 9.93, 76.27, 2], ['chandigarh', 'Chandigarh', 30.73, 76.78, 2],
    ['guwahati', 'Guwahati', 26.14, 91.74, 1.5], ['nagpur', 'Nagpur', 21.15, 79.09, 2], ['bhopal', 'Bhopal', 23.26, 77.41, 1.5],
  ]],
  ['US', '840', 'United States', 14, 'anglo', -300, [
    ['new-york', 'New York', 40.71, -74.01, 10, -240], ['los-angeles', 'Los Angeles', 34.05, -118.24, 8, -420], ['chicago', 'Chicago', 41.88, -87.63, 6],
    ['houston', 'Houston', 29.76, -95.37, 5], ['phoenix', 'Phoenix', 33.45, -112.07, 3, -420], ['seattle', 'Seattle', 47.61, -122.33, 4, -420],
    ['denver', 'Denver', 39.74, -104.99, 3, -360], ['miami', 'Miami', 25.76, -80.19, 3, -240], ['atlanta', 'Atlanta', 33.75, -84.39, 3, -240],
    ['boston', 'Boston', 42.36, -71.06, 3, -240], ['austin', 'Austin', 30.27, -97.74, 3], ['san-francisco', 'San Francisco', 37.77, -122.42, 4, -420],
    ['minneapolis', 'Minneapolis', 44.98, -93.27, 2], ['anchorage', 'Anchorage', 61.22, -149.9, 0.6, -480],
  ]],
  ['BR', '076', 'Brazil', 6, 'brazil', -180, [
    ['sao-paulo', 'São Paulo', -23.55, -46.63, 10], ['rio-de-janeiro', 'Rio de Janeiro', -22.91, -43.17, 7], ['brasilia', 'Brasília', -15.79, -47.88, 3],
    ['salvador', 'Salvador', -12.97, -38.5, 3], ['fortaleza', 'Fortaleza', -3.73, -38.53, 3], ['belo-horizonte', 'Belo Horizonte', -19.92, -43.94, 3],
    ['manaus', 'Manaus', -3.12, -60.02, 2, -240], ['porto-alegre', 'Porto Alegre', -30.03, -51.23, 2], ['recife', 'Recife', -8.05, -34.88, 2],
  ]],
  ['GB', '826', 'United Kingdom', 4.5, 'anglo', 60, [
    ['london', 'London', 51.51, -0.13, 10], ['manchester', 'Manchester', 53.48, -2.24, 4], ['birmingham', 'Birmingham', 52.49, -1.89, 3],
    ['glasgow', 'Glasgow', 55.86, -4.25, 2], ['edinburgh', 'Edinburgh', 55.95, -3.19, 2], ['bristol', 'Bristol', 51.45, -2.59, 2], ['leeds', 'Leeds', 53.8, -1.55, 2],
  ]],
  ['DE', '276', 'Germany', 3.5, 'westEurope', 120, [
    ['berlin', 'Berlin', 52.52, 13.4, 8], ['munich', 'Munich', 48.14, 11.58, 5], ['hamburg', 'Hamburg', 53.55, 9.99, 4], ['cologne', 'Cologne', 50.94, 6.96, 3],
    ['frankfurt', 'Frankfurt', 50.11, 8.68, 3], ['stuttgart', 'Stuttgart', 48.78, 9.18, 2], ['leipzig', 'Leipzig', 51.34, 12.37, 2],
  ]],
  ['FR', '250', 'France', 3, 'westEurope', 120, [
    ['paris', 'Paris', 48.86, 2.35, 10], ['lyon', 'Lyon', 45.76, 4.84, 3], ['marseille', 'Marseille', 43.3, 5.37, 3], ['toulouse', 'Toulouse', 43.6, 1.44, 2],
    ['bordeaux', 'Bordeaux', 44.84, -0.58, 2], ['lille', 'Lille', 50.63, 3.06, 2], ['nantes', 'Nantes', 47.22, -1.55, 2],
  ]],
  ['JP', '392', 'Japan', 3.5, 'japan', 540, [
    ['tokyo', 'Tokyo', 35.68, 139.69, 10], ['osaka', 'Osaka', 34.69, 135.5, 5], ['nagoya', 'Nagoya', 35.18, 136.91, 3], ['sapporo', 'Sapporo', 43.06, 141.35, 2],
    ['fukuoka', 'Fukuoka', 33.59, 130.4, 2], ['kyoto', 'Kyoto', 35.01, 135.77, 2], ['sendai', 'Sendai', 38.27, 140.87, 1.5],
  ]],
  ['MX', '484', 'Mexico', 3, 'latam', -360, [
    ['mexico-city', 'Mexico City', 19.43, -99.13, 10], ['guadalajara', 'Guadalajara', 20.66, -103.35, 4], ['monterrey', 'Monterrey', 25.69, -100.32, 4],
    ['puebla', 'Puebla', 19.04, -98.21, 2], ['tijuana', 'Tijuana', 32.51, -117.04, 2, -420], ['merida', 'Mérida', 20.97, -89.59, 1.5],
  ]],
  ['CA', '124', 'Canada', 2.5, 'anglo', -240, [
    ['toronto', 'Toronto', 43.65, -79.38, 8], ['vancouver', 'Vancouver', 49.28, -123.12, 5, -420], ['montreal', 'Montreal', 45.5, -73.57, 5],
    ['calgary', 'Calgary', 51.05, -114.07, 3, -360], ['ottawa', 'Ottawa', 45.42, -75.7, 2], ['edmonton', 'Edmonton', 53.55, -113.49, 2, -360],
    ['winnipeg', 'Winnipeg', 49.9, -97.14, 1.5, -300], ['halifax', 'Halifax', 44.65, -63.58, 1, -180],
  ]],
  ['AU', '036', 'Australia', 2.5, 'anglo', 660, [
    ['sydney', 'Sydney', -33.87, 151.21, 8], ['melbourne', 'Melbourne', -37.81, 144.96, 7], ['brisbane', 'Brisbane', -27.47, 153.03, 4, 600],
    ['perth', 'Perth', -31.95, 115.86, 3, 480], ['adelaide', 'Adelaide', -34.93, 138.6, 2, 630], ['darwin', 'Darwin', -12.46, 130.84, 0.8, 570],
  ]],
  ['ID', '360', 'Indonesia', 3, 'seAsia', 420, [
    ['jakarta', 'Jakarta', -6.21, 106.85, 10], ['surabaya', 'Surabaya', -7.25, 112.75, 4], ['bandung', 'Bandung', -6.92, 107.61, 3],
    ['medan', 'Medan', 3.6, 98.67, 3], ['makassar', 'Makassar', -5.15, 119.43, 2, 480], ['denpasar', 'Denpasar', -8.65, 115.22, 2, 480],
  ]],
  ['PH', '608', 'Philippines', 2, 'seAsia', 480, [
    ['manila', 'Manila', 14.6, 120.98, 10], ['cebu', 'Cebu', 10.32, 123.89, 4], ['davao', 'Davao', 7.19, 125.46, 3], ['baguio', 'Baguio', 16.4, 120.6, 1.5], ['iloilo', 'Iloilo', 10.72, 122.56, 1.5],
  ]],
  ['NG', '566', 'Nigeria', 2, 'africa', 60, [
    ['lagos', 'Lagos', 6.52, 3.38, 10], ['abuja', 'Abuja', 9.08, 7.4, 5], ['kano', 'Kano', 12, 8.52, 3], ['ibadan', 'Ibadan', 7.38, 3.95, 3], ['port-harcourt', 'Port Harcourt', 4.82, 7.05, 3],
  ]],
  ['KE', '404', 'Kenya', 1, 'africa', 180, [
    ['nairobi', 'Nairobi', -1.29, 36.82, 10], ['mombasa', 'Mombasa', -4.04, 39.67, 4], ['kisumu', 'Kisumu', -0.09, 34.77, 2], ['nakuru', 'Nakuru', -0.3, 36.07, 2],
  ]],
  ['ZA', '710', 'South Africa', 1.2, 'africa', 120, [
    ['johannesburg', 'Johannesburg', -26.2, 28.05, 8], ['cape-town', 'Cape Town', -33.92, 18.42, 7], ['durban', 'Durban', -29.86, 31.02, 4],
    ['pretoria', 'Pretoria', -25.75, 28.19, 3], ['gqeberha', 'Gqeberha', -33.96, 25.6, 2],
  ]],
  ['EG', '818', 'Egypt', 1.2, 'mena', 180, [
    ['cairo', 'Cairo', 30.04, 31.24, 10], ['alexandria', 'Alexandria', 31.2, 29.92, 5], ['luxor', 'Luxor', 25.69, 32.64, 1.5], ['aswan', 'Aswan', 24.09, 32.9, 1],
  ]],
  ['TR', '792', 'Turkey', 1.5, 'mena', 180, [
    ['istanbul', 'Istanbul', 41.01, 28.98, 10], ['ankara', 'Ankara', 39.93, 32.86, 4], ['izmir', 'Izmir', 38.42, 27.14, 3], ['antalya', 'Antalya', 36.9, 30.71, 2], ['bursa', 'Bursa', 40.19, 29.06, 2],
  ]],
  ['SA', '682', 'Saudi Arabia', 1, 'mena', 180, [
    ['riyadh', 'Riyadh', 24.71, 46.68, 10], ['jeddah', 'Jeddah', 21.49, 39.19, 7], ['dammam', 'Dammam', 26.42, 50.09, 3], ['medina', 'Medina', 24.52, 39.57, 2],
  ]],
  ['AE', '784', 'United Arab Emirates', 1, 'mena', 240, [
    ['dubai', 'Dubai', 25.2, 55.27, 10], ['abu-dhabi', 'Abu Dhabi', 24.45, 54.38, 6], ['sharjah', 'Sharjah', 25.35, 55.42, 3],
  ]],
  ['PK', '586', 'Pakistan', 1.5, 'southAsia', 300, [
    ['karachi', 'Karachi', 24.86, 67.01, 10], ['lahore', 'Lahore', 31.55, 74.34, 8], ['islamabad', 'Islamabad', 33.68, 73.05, 4], ['faisalabad', 'Faisalabad', 31.42, 73.08, 2], ['peshawar', 'Peshawar', 34.01, 71.58, 2],
  ]],
  ['BD', '050', 'Bangladesh', 1, 'southAsia', 360, [
    ['dhaka', 'Dhaka', 23.81, 90.41, 10], ['chattogram', 'Chattogram', 22.36, 91.78, 4], ['khulna', 'Khulna', 22.85, 89.54, 2], ['sylhet', 'Sylhet', 24.89, 91.87, 2],
  ]],
  ['NP', '524', 'Nepal', 0.5, 'southAsia', 345, [
    ['kathmandu', 'Kathmandu', 27.72, 85.32, 10], ['pokhara', 'Pokhara', 28.21, 83.99, 3], ['biratnagar', 'Biratnagar', 26.45, 87.27, 2],
  ]],
  ['LK', '144', 'Sri Lanka', 0.5, 'southAsia', 330, [
    ['colombo', 'Colombo', 6.93, 79.86, 10], ['kandy', 'Kandy', 7.29, 80.63, 3], ['galle', 'Galle', 6.05, 80.22, 2],
  ]],
  ['VN', '704', 'Vietnam', 1.2, 'seAsia', 420, [
    ['ho-chi-minh-city', 'Ho Chi Minh City', 10.82, 106.63, 10], ['hanoi', 'Hanoi', 21.03, 105.85, 8], ['da-nang', 'Da Nang', 16.05, 108.2, 3], ['hai-phong', 'Hai Phong', 20.84, 106.69, 2],
  ]],
  ['TH', '764', 'Thailand', 1.2, 'seAsia', 420, [
    ['bangkok', 'Bangkok', 13.76, 100.5, 10], ['chiang-mai', 'Chiang Mai', 18.79, 98.98, 3], ['phuket', 'Phuket', 7.88, 98.39, 2], ['khon-kaen', 'Khon Kaen', 16.43, 102.83, 2],
  ]],
  ['KR', '410', 'South Korea', 1.5, 'korea', 540, [
    ['seoul', 'Seoul', 37.57, 126.98, 10], ['busan', 'Busan', 35.18, 129.08, 5], ['incheon', 'Incheon', 37.46, 126.71, 3], ['daegu', 'Daegu', 35.87, 128.6, 3], ['gwangju', 'Gwangju', 35.16, 126.85, 2],
  ]],
  ['MY', '458', 'Malaysia', 0.8, 'seAsia', 480, [
    ['kuala-lumpur', 'Kuala Lumpur', 3.14, 101.69, 10], ['penang', 'Penang', 5.41, 100.33, 3], ['johor-bahru', 'Johor Bahru', 1.49, 103.74, 3],
    ['kota-kinabalu', 'Kota Kinabalu', 5.98, 116.07, 2], ['kuching', 'Kuching', 1.55, 110.36, 2],
  ]],
  ['RU', '643', 'Russia', 0.8, 'eastEurope', 180, [
    ['moscow', 'Moscow', 55.76, 37.62, 10], ['saint-petersburg', 'Saint Petersburg', 59.93, 30.34, 6], ['novosibirsk', 'Novosibirsk', 55.03, 82.92, 2, 420],
    ['yekaterinburg', 'Yekaterinburg', 56.84, 60.61, 2, 300], ['kazan', 'Kazan', 55.79, 49.12, 2], ['vladivostok', 'Vladivostok', 43.12, 131.89, 1, 600],
  ]],
  ['ES', '724', 'Spain', 2, 'westEurope', 120, [
    ['madrid', 'Madrid', 40.42, -3.7, 10], ['barcelona', 'Barcelona', 41.39, 2.17, 8], ['valencia', 'Valencia', 39.47, -0.38, 3], ['seville', 'Seville', 37.39, -5.98, 3],
    ['bilbao', 'Bilbao', 43.26, -2.93, 2], ['malaga', 'Málaga', 36.72, -4.42, 2],
  ]],
  ['IT', '380', 'Italy', 2, 'westEurope', 120, [
    ['rome', 'Rome', 41.9, 12.5, 10], ['milan', 'Milan', 45.46, 9.19, 8], ['naples', 'Naples', 40.85, 14.27, 4], ['turin', 'Turin', 45.07, 7.69, 3],
    ['florence', 'Florence', 43.77, 11.26, 2], ['bologna', 'Bologna', 44.49, 11.34, 2], ['palermo', 'Palermo', 38.12, 13.36, 2],
  ]],
  ['NL', '528', 'Netherlands', 1, 'westEurope', 120, [
    ['amsterdam', 'Amsterdam', 52.37, 4.9, 10], ['rotterdam', 'Rotterdam', 51.92, 4.48, 5], ['utrecht', 'Utrecht', 52.09, 5.12, 3], ['eindhoven', 'Eindhoven', 51.44, 5.47, 2],
  ]],
  ['SE', '752', 'Sweden', 0.8, 'nordic', 120, [
    ['stockholm', 'Stockholm', 59.33, 18.07, 10], ['gothenburg', 'Gothenburg', 57.71, 11.97, 5], ['malmo', 'Malmö', 55.6, 13, 3], ['umea', 'Umeå', 63.83, 20.26, 1],
  ]],
  ['NO', '578', 'Norway', 0.5, 'nordic', 120, [
    ['oslo', 'Oslo', 59.91, 10.75, 10], ['bergen', 'Bergen', 60.39, 5.32, 4], ['trondheim', 'Trondheim', 63.43, 10.4, 3], ['tromso', 'Tromsø', 69.65, 18.96, 1],
  ]],
  ['FI', '246', 'Finland', 0.4, 'nordic', 180, [
    ['helsinki', 'Helsinki', 60.17, 24.94, 10], ['tampere', 'Tampere', 61.5, 23.79, 3], ['oulu', 'Oulu', 65.01, 25.47, 2], ['rovaniemi', 'Rovaniemi', 66.5, 25.73, 1],
  ]],
  ['DK', '208', 'Denmark', 0.4, 'nordic', 120, [
    ['copenhagen', 'Copenhagen', 55.68, 12.57, 10], ['aarhus', 'Aarhus', 56.16, 10.2, 4], ['odense', 'Odense', 55.4, 10.39, 2],
  ]],
  ['PL', '616', 'Poland', 1.2, 'eastEurope', 120, [
    ['warsaw', 'Warsaw', 52.23, 21.01, 10], ['krakow', 'Kraków', 50.06, 19.94, 5], ['wroclaw', 'Wrocław', 51.11, 17.04, 3], ['gdansk', 'Gdańsk', 54.35, 18.65, 3], ['poznan', 'Poznań', 52.41, 16.93, 3],
  ]],
  ['UA', '804', 'Ukraine', 0.8, 'eastEurope', 180, [
    ['kyiv', 'Kyiv', 50.45, 30.52, 10], ['lviv', 'Lviv', 49.84, 24.03, 4], ['odesa', 'Odesa', 46.48, 30.72, 3], ['kharkiv', 'Kharkiv', 49.99, 36.23, 3], ['dnipro', 'Dnipro', 48.46, 35.05, 2],
  ]],
  ['GR', '300', 'Greece', 0.5, 'eastEurope', 180, [
    ['athens', 'Athens', 37.98, 23.73, 10], ['thessaloniki', 'Thessaloniki', 40.64, 22.94, 4], ['patras', 'Patras', 38.25, 21.73, 2], ['heraklion', 'Heraklion', 35.34, 25.14, 2],
  ]],
  ['PT', '620', 'Portugal', 0.7, 'westEurope', 60, [
    ['lisbon', 'Lisbon', 38.72, -9.14, 10], ['porto', 'Porto', 41.16, -8.63, 6], ['braga', 'Braga', 41.55, -8.43, 2], ['faro', 'Faro', 37.02, -7.93, 2],
  ]],
  ['IE', '372', 'Ireland', 0.6, 'anglo', 60, [
    ['dublin', 'Dublin', 53.35, -6.26, 10], ['cork', 'Cork', 51.9, -8.47, 4], ['galway', 'Galway', 53.27, -9.05, 2], ['limerick', 'Limerick', 52.66, -8.63, 2],
  ]],
  ['CH', '756', 'Switzerland', 0.6, 'westEurope', 120, [
    ['zurich', 'Zürich', 47.38, 8.54, 10], ['geneva', 'Geneva', 46.2, 6.14, 6], ['basel', 'Basel', 47.56, 7.59, 3], ['bern', 'Bern', 46.95, 7.45, 3],
  ]],
  ['AT', '040', 'Austria', 0.5, 'westEurope', 120, [
    ['vienna', 'Vienna', 48.21, 16.37, 10], ['graz', 'Graz', 47.07, 15.44, 3], ['salzburg', 'Salzburg', 47.81, 13.06, 2], ['innsbruck', 'Innsbruck', 47.27, 11.4, 2],
  ]],
  ['AR', '032', 'Argentina', 1.5, 'latam', -180, [
    ['buenos-aires', 'Buenos Aires', -34.6, -58.38, 10], ['cordoba', 'Córdoba', -31.42, -64.18, 4], ['rosario', 'Rosario', -32.94, -60.64, 3],
    ['mendoza', 'Mendoza', -32.89, -68.84, 2], ['salta', 'Salta', -24.79, -65.41, 1.5], ['ushuaia', 'Ushuaia', -54.8, -68.3, 0.5],
  ]],
  ['CO', '170', 'Colombia', 1.2, 'latam', -300, [
    ['bogota', 'Bogotá', 4.71, -74.07, 10], ['medellin', 'Medellín', 6.24, -75.58, 6], ['cali', 'Cali', 3.45, -76.53, 4], ['barranquilla', 'Barranquilla', 10.96, -74.8, 3], ['cartagena', 'Cartagena', 10.39, -75.48, 2],
  ]],
  ['CL', '152', 'Chile', 0.8, 'latam', -180, [
    ['santiago', 'Santiago', -33.45, -70.67, 10], ['valparaiso', 'Valparaíso', -33.05, -71.62, 3], ['concepcion', 'Concepción', -36.83, -73.05, 2],
    ['antofagasta', 'Antofagasta', -23.65, -70.4, 2], ['punta-arenas', 'Punta Arenas', -53.16, -70.91, 1],
  ]],
  ['PE', '604', 'Peru', 0.8, 'latam', -300, [
    ['lima', 'Lima', -12.05, -77.04, 10], ['arequipa', 'Arequipa', -16.41, -71.54, 3], ['cusco', 'Cusco', -13.53, -71.97, 2], ['trujillo', 'Trujillo', -8.11, -79.03, 2],
  ]],
  ['GH', '288', 'Ghana', 0.6, 'africa', 0, [
    ['accra', 'Accra', 5.6, -0.19, 10], ['kumasi', 'Kumasi', 6.69, -1.62, 5], ['tamale', 'Tamale', 9.4, -0.84, 2],
  ]],
  ['MA', '504', 'Morocco', 0.6, 'mena', 60, [
    ['casablanca', 'Casablanca', 33.57, -7.59, 10], ['rabat', 'Rabat', 34.02, -6.84, 4], ['marrakesh', 'Marrakesh', 31.63, -8.01, 4], ['fes', 'Fes', 34.03, -5, 3], ['tangier', 'Tangier', 35.76, -5.83, 2],
  ]],
  ['DZ', '012', 'Algeria', 0.5, 'mena', 60, [
    ['algiers', 'Algiers', 36.75, 3.06, 10], ['oran', 'Oran', 35.7, -0.63, 5], ['constantine', 'Constantine', 36.37, 6.61, 3], ['tamanrasset', 'Tamanrasset', 22.79, 5.53, 0.5],
  ]],
  ['ET', '231', 'Ethiopia', 0.5, 'africa', 180, [
    ['addis-ababa', 'Addis Ababa', 9.03, 38.74, 10], ['dire-dawa', 'Dire Dawa', 9.59, 41.87, 2], ['bahir-dar', 'Bahir Dar', 11.59, 37.39, 2], ['mekelle', 'Mekelle', 13.5, 39.47, 1.5],
  ]],
  ['TZ', '834', 'Tanzania', 0.4, 'africa', 180, [
    ['dar-es-salaam', 'Dar es Salaam', -6.79, 39.21, 10], ['dodoma', 'Dodoma', -6.16, 35.75, 2], ['arusha', 'Arusha', -3.39, 36.68, 3], ['mwanza', 'Mwanza', -2.52, 32.9, 2],
  ]],
  ['UG', '800', 'Uganda', 0.3, 'africa', 180, [
    ['kampala', 'Kampala', 0.35, 32.58, 10], ['gulu', 'Gulu', 2.78, 32.3, 2], ['mbarara', 'Mbarara', -0.61, 30.65, 2],
  ]],
  ['NZ', '554', 'New Zealand', 0.6, 'anglo', 780, [
    ['auckland', 'Auckland', -36.85, 174.76, 10], ['wellington', 'Wellington', -41.29, 174.78, 4], ['christchurch', 'Christchurch', -43.53, 172.64, 4],
    ['queenstown', 'Queenstown', -45.03, 168.66, 1], ['dunedin', 'Dunedin', -45.88, 170.5, 1.5],
  ]],
  ['KZ', '398', 'Kazakhstan', 0.4, 'centralAsia', 300, [
    ['almaty', 'Almaty', 43.24, 76.89, 10], ['astana', 'Astana', 51.17, 71.43, 6], ['shymkent', 'Shymkent', 42.32, 69.6, 3], ['aktobe', 'Aktobe', 50.28, 57.17, 2],
  ]],
  ['MN', '496', 'Mongolia', 0.15, 'centralAsia', 480, [
    ['ulaanbaatar', 'Ulaanbaatar', 47.89, 106.91, 10], ['erdenet', 'Erdenet', 49.03, 104.04, 2],
  ]],
];

const SHORT: Record<string, string> = { US: 'USA', GB: 'UK', AE: 'UAE', ZA: 'S. Africa', KR: 'S. Korea', NZ: 'NZ', SA: 'Saudi' };

export const countries: Country[] = rows.map(([cc, atlas, name, w, region, tz, cities]) => ({
  cc, atlas, name, short: SHORT[cc] ?? name, w, region,
  cities: cities.map(([slug, cityName, lat, lng, cw, ctz]) => ({ id: `${cc.toLowerCase()}-${slug}`, slug, name: cityName, lat, lng, w: cw, tz: ctz ?? tz })),
}));

export const countryByCode = new Map(countries.map(country => [country.cc, country]));
export const cityById = new Map(countries.flatMap(country => country.cities.map(city => [city.id, city] as const)));
