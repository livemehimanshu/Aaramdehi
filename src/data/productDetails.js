// ===== PRODUCT DETAILS DATA =====
// Yeh file mein single product ki detailed information hoti hai
// Product details page mein ye data use hota hai

export const productDetailsData = {
  "main-pillow-001": { // Product ki unique ID
    id: "main-pillow-001", // Product ID
    brand: "Aaramdehi Premium", // Brand name
    name: "Luxury Microfiber Soft Pillow (Pack of 2)", // Full product name
    description: "Experience ultimate comfort with Aaramdehi's signature microfiber pillows. Designed for back, side, and stomach sleepers with pure organic materials.", // Product ka detailed description
    images: [ // Multiple product images
      "https://rukminim2.flixcart.com/image/1086/1086/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg?q=90",
      "https://rukminim2.flixcart.com/image/1086/1086/k7f26kw0/bolster/v/j/z/plain-bolster-white-1-bolster-white-satin-plain-white-fiber-original-imafpnzdqghvggym.jpeg?q=70"
    ],
    sizes: [ // Available sizes aur unki prices
      { label: 'Standard', dimensions: '17" x 27"', price: 949, oldPrice: 1599 },
      { label: 'King', dimensions: '20" x 36"', price: 1249, oldPrice: 1999 }
    ],
    rating: 4.8, // Overall rating
    reviews: [ // Customer reviews
      { 
        id: 1, 
        user: "Mukul Bhardwaj", // Review ka author
        rating: 5, // Stars
        date: "24 March 2026", // Review ka date
        comment: "Quality is top-notch! The standard size fits perfectly.", // Actual review
        helpful: 12 // Kitne logo ne helpful mark kiya 
      },
      { 
        id: 2, 
        user: "Priya Sharma", 
        rating: 5, 
        date: "20 March 2026", 
        comment: "Very comfortable and durable. Highly recommended!", 
        helpful: 8 
      },
      { 
        id: 3, 
        user: "Rajesh Kumar", 
        rating: 4, 
        date: "18 March 2026", 
        comment: "Good quality but a bit expensive.", 
        helpful: 5 
      }
    ]
  }
};

export const relatedItemsData = [
  // Bundle offer mein jo items add kar sakte ho
  { 
    id: 101, 
    name: "Cotton Pillow Cover (Pair)", // Related product ka naam
    price: 299, // Current price
    oldPrice: 499, // Original price (discount dikhane ke liye)
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow-covers/original-imahfzhgzff9ay8h.jpeg" // Product image
  },
  { 
    id: 102, 
    name: "Fragrant Mogra Spray", 
    price: 150, 
    oldPrice: 299,
    image: "https://rukminim2.flixcart.com/image/612/612/k7f26kw0/air-freshner.jpeg" 
  },
  { 
    id: 103, 
    name: "Premium Satin Bolster", 
    price: 599, 
    oldPrice: 999,
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bolster/original-imahg6w2dkgcvnjh.jpeg" 
  }
];
