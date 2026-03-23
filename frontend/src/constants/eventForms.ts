import { 
  Coffee, 
  Droplets, 
  Milk, 
  Cake, 
  PieChart, 
  Apple, 
  Cookie,
  Monitor,
  Mic,
  Speaker,
  Image as ImageIcon,
  Tent,
  LayoutGrid,
  Armchair,
  Laptop,
  Warehouse,
  Utensils
} from 'lucide-react';

export const coffeeItems = [
  { id: 'cafe', name: 'Café', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'agua', name: 'Água', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'suco', name: 'Suco', icon: Milk, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'bolo', name: 'Bolo', icon: Cake, color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'salgados', name: 'Salgados', icon: PieChart, color: 'text-orange-700', bg: 'bg-orange-100' },
  { id: 'frutas', name: 'Frutas', icon: Apple, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'biscoitos', name: 'Biscoitos', icon: Cookie, color: 'text-yellow-700', bg: 'bg-yellow-50' },
];

export const materiaisItems = [
  { id: 'projetor', name: 'Projetor', icon: Monitor, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'microfone', name: 'Microfone', icon: Mic, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'caixa_som', name: 'Caixa de Som', icon: Speaker, color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'banner', name: 'Banner', icon: ImageIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'tenda', name: 'Tenda', icon: Tent, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'mesas', name: 'Mesas', icon: LayoutGrid, color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'cadeiras', name: 'Cadeiras', icon: Armchair, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'notebook', name: 'Notebook', icon: Laptop, color: 'text-slate-700', bg: 'bg-slate-50' },
  { id: 'logistica', name: 'Logística', icon: Warehouse, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'cafe', name: 'Café', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'descartaveis_gerais', name: 'Descartáveis Gerais', icon: Utensils, color: 'text-slate-500', bg: 'bg-slate-50' },
];
