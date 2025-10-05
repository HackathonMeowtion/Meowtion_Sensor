export type CatLocation = {
  name: string;
  lat: number;
  lng: number;
  description?: string;
};

export const catLocations: CatLocation[] = [
  {
    name: 'Microwave',
    lat: 32.73075943089946,
    lng: -97.11194459433784,
    description: 'Courtyard prowler known for scavenging snacks.'
  },
  {
    name: 'Snickers',
    lat: 32.73136320465538,
    lng: -97.11238129897278,
    description: 'Often spotted lounging near the library steps.'
  },
  {
    name: 'Eggs',
    lat: 32.7298388011233,
    lng: -97.11042768317395,
    description: 'Campus celebrity that naps by the science building.'
  },
  {
    name: 'Twix',
    lat: 32.73109871375422,
    lng: -97.11028512162308,
    description: 'Shy tabby that loves the shaded planters.'
  }
];
