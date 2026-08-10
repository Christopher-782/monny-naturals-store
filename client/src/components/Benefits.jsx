import { Leaf, Droplets, Recycle, Heart } from 'lucide-react';
import { useContent } from '../context/ContentContext';

const icons = [Leaf, Droplets, Recycle, Heart];

export default function Benefits() {
  const { benefits } = useContent();
  return <section className="container benefits-strip">{(benefits || []).slice(0,4).map((item, index) => {
    const Icon = icons[index] || Leaf;
    return <div key={`${item.title}-${index}`}><Icon/><span><strong>{item.title}</strong><small>{item.text}</small></span></div>;
  })}</section>;
}
