import React from 'react';
import { CheckCircle2, Circle, Truck, Package, MapPin, Box } from 'lucide-react';

const steps = [
    { id: 'Order Placed', icon: Box },
    { id: 'Processing', icon: Package },
    { id: 'Shipped', icon: Truck },
    { id: 'Out for Delivery', icon: MapPin },
    { id: 'Delivered', icon: CheckCircle2 }
];

const OrderTracking = ({ currentStatus }) => {
    const currentIndex = steps.findIndex(step => step.id === currentStatus);

    return (
        <div className="w-full py-8">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 z-0">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`p-3 rounded-full border-2 transition-all ${
                                isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-gray-900 border-gray-800 text-gray-600'
                            } ${isCurrent ? 'ring-4 ring-emerald-500/20 scale-110' : ''}`}>
                                <Icon size={20} />
                            </div>
                            <p className={`text-[10px] font-black uppercase mt-2 tracking-tighter ${
                                isCompleted ? 'text-emerald-400' : 'text-gray-600'
                            }`}>{step.id}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTracking;