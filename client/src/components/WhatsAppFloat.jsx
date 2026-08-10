import { MessageCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { whatsappUrl } from '../utils/whatsapp';

export default function WhatsAppFloat() {
  const { store } = useContent();
  return (
    <a className="whatsapp-float" href={whatsappUrl(store.whatsappNumber)} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp">
      <MessageCircle size={26} fill="currentColor" />
      <span>Chat with us</span>
      <b>1</b>
    </a>
  );
}
