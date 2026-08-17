import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const WHATSAPP_HREF =
  'https://wa.me/917019793408?text=' +
  encodeURIComponent('Hello TurboByte, I want to claim the Operation Tiranga Independence Day offer.');

/** Floating WhatsApp CTA — shown only on the Operation Tiranga landing page. */
export function WhatsAppFloatButton() {
  return (
    <motion.a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 z-40 hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(37,211,102,0.45)]"
      data-testid="button-whatsapp-float"
      aria-label="Chat with TurboByte on WhatsApp about Operation Tiranga"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
      <MessageCircle className="w-7 h-7 text-white relative z-10" fill="white" strokeWidth={1.5} />
    </motion.a>
  );
}
