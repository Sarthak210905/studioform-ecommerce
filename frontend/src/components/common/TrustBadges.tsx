import { Shield, Lock, RotateCcw, Truck } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: '100% Secure',
      description: 'SSL Encrypted',
    },
    {
      icon: Lock,
      title: 'Safe Payment',
      description: 'Trusted Gateway',
    },
    {
      icon: RotateCcw,
      title: '7 Day Exchange',
      description: 'For defective products',
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders above ₹1499',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <badge.icon className="h-8 w-8 mb-2 text-primary" />
          <h4 className="font-semibold text-sm mb-1">{badge.title}</h4>
          <p className="text-xs text-muted-foreground">{badge.description}</p>
        </div>
      ))}
    </div>
  );
}
